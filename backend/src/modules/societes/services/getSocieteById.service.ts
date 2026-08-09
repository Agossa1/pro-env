/*
 * |--------------------------------------------------------------------------
 * | GET SOCIETE BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'une société par son identifiant UUID.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { SocieteRepository } from '../repositories/societe.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { AppSociete } from '../types/societe.types';

export class GetSocieteByIdService {
  constructor(
    private readonly societeRepository: SocieteRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère une société par son identifiant UUID.
   * @param id Identifiant UUID de la société
   */
  public async getSocieteById(id: string): Promise<AppSociete> {
    try {
      const societe = await this.societeRepository.getSocieteById(id);
      if (!societe) {
        throw new NotFoundError('Société introuvable.');
      }
      this.logger.info(`Société récupérée par ID : ${societe.name}`);
      return societe;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getSocieteById (service): ${error.message}`);
      throw error;
    }
  }
}