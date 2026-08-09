/*
 * |--------------------------------------------------------------------------
 * | DELETE INTERVENTION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression logique d'une intervention.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { InterventionRepository } from '../repositories/intervention.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class DeleteInterventionService {
  constructor(
    private readonly interventionRepository: InterventionRepository,
    private readonly logger: Logger,
  ) {}

  /** Supprime logiquement une intervention (deleted_at). */
  public async deleteIntervention(id: string): Promise<void> {
    try {
      await this.interventionRepository.deleteIntervention(id);
      this.logger.info(`Intervention supprimée : ${id}`);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur deleteIntervention (service): ${error.message}`);
      throw error;
    }
  }
}