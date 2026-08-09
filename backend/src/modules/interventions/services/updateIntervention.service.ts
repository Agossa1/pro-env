/*
 * |--------------------------------------------------------------------------
 * | UPDATE INTERVENTION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de mise à jour d'une intervention.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { InterventionRepository } from '../repositories/intervention.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { Intervention, UpdateInterventionPayload } from '../types/intervention.types';

export class UpdateInterventionService {
  constructor(
    private readonly interventionRepository: InterventionRepository,
    private readonly logger: Logger,
  ) {}

  /** Met à jour une intervention existante (statut, notes, dates...). */
  public async updateIntervention(
    id: string,
    payload: UpdateInterventionPayload
  ): Promise<Intervention> {
    try {
      const updated = await this.interventionRepository.updateIntervention(id, payload);
      if (!updated) {
        throw new NotFoundError('Intervention introuvable.');
      }
      this.logger.info(`Intervention mise à jour : ${updated.interventionType}`);
      return updated;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updateIntervention (service): ${error.message}`);
      throw error;
    }
  }
}