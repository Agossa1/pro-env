/*
 * |--------------------------------------------------------------------------
 * | GET MISSION BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'une mission par son identifiant UUID.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { MissionRepository } from '../repositories/mission.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { Mission } from '../types/mission.types';

export class GetMissionByIdService {
  constructor(
    private readonly missionRepository: MissionRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère une mission par son identifiant UUID.
   * @param id Identifiant UUID de la mission
   */
  public async getMissionById(id: string): Promise<Mission> {
    try {
      const mission = await this.missionRepository.getMissionById(id);
      if (!mission) {
        throw new NotFoundError('Mission introuvable.');
      }
      this.logger.info(`Mission récupérée par ID : ${mission.title}`);
      return mission;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getMissionById (service): ${error.message}`);
      throw error;
    }
  }
}