/*
 * |--------------------------------------------------------------------------
 * | GET SOCIETE BY REGISTRATION NUMBER SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'une société par son n° d'enregistrement.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { SocieteRepository } from '../repositories/societe.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { AppSociete } from '../types/societe.types';

export class GetSocieteByRegistrationNumberService {
  constructor(
    private readonly societeRepository: SocieteRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère une société par son numéro d'enregistrement.
   * @param registrationNumber Numéro d'enregistrement de la société
   */
  public async getSocieteByRegistrationNumber(
    registrationNumber: string
  ): Promise<AppSociete> {
    try {
      const societe = await this.societeRepository.getSocieteByRegistrationNumber(
        registrationNumber
      );
      if (!societe) {
        throw new NotFoundError(
          `Société introuvable avec le n° d'enregistrement : ${registrationNumber}`
        );
      }
      this.logger.info(`Société récupérée par n° d'enregistrement : ${societe.name}`);
      return societe;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getSocieteByRegistrationNumber (service): ${error.message}`);
      throw error;
    }
  }
}