/*
 * |--------------------------------------------------------------------------
 * | DELETE MISSION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression logique d'une mission.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { MissionRepository } from '../repositories/mission.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class DeleteMissionService {
  constructor(
    private readonly missionRepository: MissionRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Supprime logiquement une mission par son identifiant UUID (deleted_at).
   * @param id Identifiant UUID de la mission à supprimer
   */
  public async deleteMission(id: string): Promise<void> {
    try {
      await this.missionRepository.deleteMission(id);
      this.logger.info(`Mission supprimée : ${id}`);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur deleteMission (service): ${error.message}`);
      throw error;
    }
  }
}