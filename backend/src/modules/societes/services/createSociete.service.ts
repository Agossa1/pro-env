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

/** Contexte de l'utilisateur connecté (req.user) */
export interface CreateSocieteContext {
  userId?: string;
  territoryId?: string | null;
}

export class CreateSocieteService {
  constructor(
    private readonly societeRepository: SocieteRepository,
    private readonly logger: Logger,
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

      // Déterminer le territoire d'association :
      // - Si non fourni par un admin, on utilise le territoire de l'utilisateur connecté
      const territoryId = payload.territoryId ?? creator?.territoryId ?? null;

      const created = await this.societeRepository.createSociete({
        ...payload,
        territoryId,
      });

      this.logger.info(
        `Société créée : ${created.name}${territoryId ? ` (associée au territoire ${territoryId})` : ''}`
      );
      return created;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur createSociete (service): ${error.message}`);
      throw error;
    }
  }
}