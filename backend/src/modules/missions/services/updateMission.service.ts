/*
 * |--------------------------------------------------------------------------
 * | UPDATE MISSION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de mise à jour d'une mission.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { MissionRepository } from '../repositories/mission.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { Mission, UpdateMissionPayload } from '../types/mission.types';

export class UpdateMissionService {
  constructor(
    private readonly missionRepository: MissionRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Met à jour une mission existante.
   * @param id Identifiant UUID de la mission
   * @param payload Champs modifiables (statut, assignation, dates...)
   */
  public async updateMission(
    id: string,
    payload: UpdateMissionPayload
  ): Promise<Mission> {
    try {
      const updated = await this.missionRepository.updateMission(id, payload);
      if (!updated) {
        throw new NotFoundError('Mission introuvable.');
      }
      this.logger.info(`Mission mise à jour : ${updated.title}`);
      return updated;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updateMission (service): ${error.message}`);
      throw error;
    }
  }
}