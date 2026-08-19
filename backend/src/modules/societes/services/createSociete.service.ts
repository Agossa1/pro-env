/*
 * |--------------------------------------------------------------------------
 * | CREATE SOCIETE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'une société.
 * | Vérifie l'unicité du n° d'enregistrement avant insertion et associe la
 * | société à un territoire (mairie/commune ou ministère) :
 * |   - Admin  : le territoryId est fourni dans le payload (association libre)
 * |   - Maire/Ministere : le territoryId est déduit du territoire de
 * |     l'utilisateur connecté (creator.territoryId)
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { SocieteRepository } from '../repositories/societe.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import type { AppSociete, CreateSocietePayload } from '../types/societe.types';
import { CreateSocieteAccountService } from './createSocieteAccount.service';

/** Contexte de l'utilisateur connecté (req.user) */
export interface CreateSocieteContext {
  userId?: string;
  territoryId?: string | null;
}

export class CreateSocieteService {
  constructor(
    private readonly societeRepository: SocieteRepository,
    private readonly logger: Logger,
    private readonly createSocieteAccountService: CreateSocieteAccountService,
  ) {}

  /**
   * Crée une nouvelle société après validation de l'unicité du n° d'enregistrement.
   * @param payload Données de la société (name, type, ...)
   * @param creator Contexte de l'utilisateur connecté (optionnel)
   */
  public async createSociete(
    payload: CreateSocietePayload,
    creator?: CreateSocieteContext
  ): Promise<AppSociete> {
    try {
      if (!payload.name || !payload.type) {
        throw new BadRequestError('Le nom et le type de la société sont requis.');
      }

      if (!payload.contactEmail) {
        throw new BadRequestError("L'email de contact est requis (il servira à créer le compte de la société).");
      }

      if (payload.registrationNumber) {
        const existing = await this.societeRepository.getSocieteByRegistrationNumber(
          payload.registrationNumber
        );
        if (existing) {
          throw new BadRequestError(
            `Une société existe déjà avec le n° d'enregistrement "${payload.registrationNumber}".`
          );
        }
      }

      // Les sociétés sont des prestataires pouvant travailler avec toutes les
      // mairies : on ne leur associe PAS de territoire automatiquement.
      // L'association n'est possible que si un territoire est fourni explicitement.
      const territoryId = payload.territoryId ?? null;

      const created = await this.societeRepository.createSociete({
        ...payload,
        territoryId,
      });

      this.logger.info(
        `Société créée : ${created.name}${territoryId ? ` (associée au territoire ${territoryId})` : ''}`
      );

      // Création du compte de la société + envoi de l'email d'activation
      await this.createSocieteAccountService.createSocieteAccount({
        fullName: created.name,
        email: payload.contactEmail,
        organizationId: created.id,
        createdBy: creator?.userId,
      });

      return created;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur createSociete (service): ${error.message}`);
      throw error;
    }
  }
}