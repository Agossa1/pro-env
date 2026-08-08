/*
 * |--------------------------------------------------------------------------
 * | GET MISSION STATUS HISTORY SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération de l'historique des statuts d'une mission.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { MissionRepository } from '../repositories/mission.repositories';
import type { MissionStatusHistory } from '../types/mission.types';

export class GetMissionStatusHistoryService {
  constructor(
    private readonly missionRepository: MissionRepository,
    private readonly logger: Logger,
  ) {}

  /** Récupère l'historique des statuts d'une mission. */
  public async getMissionStatusHistory(missionId: string): Promise<MissionStatusHistory[]> {
    try {
      const history = await this.missionRepository.getMissionStatusHistory(missionId);
      this.logger.info(`Historique de la mission ${missionId} : ${history.length} entrée(s)`);
      return history;
    } catch (error: any) {
      this.logger.error(`Erreur getMissionStatusHistory (service): ${error.message}`);
      throw error;
    }
  }
}