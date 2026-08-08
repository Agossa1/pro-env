/*
 * |--------------------------------------------------------------------------
 * | CREATE INTERVENTION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'une intervention (exécution d'une mission).
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { InterventionRepository } from '../repositories/intervention.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import type { Intervention, CreateInterventionPayload } from '../types/intervention.types';

export class CreateInterventionService {
  constructor(
    private readonly interventionRepository: InterventionRepository,
    private readonly logger: Logger,
  ) {}

  /** Crée une nouvelle intervention (exécution d'une mission par une équipe). */
  public async createIntervention(
    payload: CreateInterventionPayload
  ): Promise<Intervention> {
    try {
      if (!payload.missionId || !payload.assignedTeamId || !payload.interventionType) {
        throw new BadRequestError(
          'La mission, l\'équipe assignée et le type d\'intervention sont requis.'
        );
      }

      const created = await this.interventionRepository.createIntervention(payload);

      this.logger.info(
        `Intervention créée : ${created.interventionType} (mission ${created.missionId})`
      );
      return created;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur createIntervention (service): ${error.message}`);
      throw error;
    }
  }
}