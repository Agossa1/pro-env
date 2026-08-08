/*
 * |--------------------------------------------------------------------------
 * | UPDATE SOCIETE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de mise à jour d'une société.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { SocieteRepository } from '../repositories/societe.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { AppSociete, UpdateSocietePayload } from '../types/societe.types';

export class UpdateSocieteService {
  constructor(
    private readonly societeRepository: SocieteRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Met à jour une société existante.
   * @param id Identifiant UUID de la société
   * @param payload Champs modifiables (name, type, ...)
   */
  public async updateSociete(
    id: string,
    payload: UpdateSocietePayload
  ): Promise<AppSociete> {
    try {
      const updated = await this.societeRepository.updateSociete(id, payload);
      if (!updated) {
        throw new NotFoundError('Société introuvable.');
      }
      this.logger.info(`Société mise à jour : ${updated.name}`);
      return updated;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updateSociete (service): ${error.message}`);
      throw error;
    }
  }
}