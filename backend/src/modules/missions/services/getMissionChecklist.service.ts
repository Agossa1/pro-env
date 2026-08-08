/*
 * |--------------------------------------------------------------------------
 * | GET MISSION CHECKLIST SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération de la checklist d'une mission.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { MissionRepository } from '../repositories/mission.repositories';
import type { MissionChecklistItem } from '../types/mission.types';

export class GetMissionChecklistService {
  constructor(
    private readonly missionRepository: MissionRepository,
    private readonly logger: Logger,
  ) {}

  /** Récupère la checklist d'une mission. */
  public async getMissionChecklist(missionId: string): Promise<MissionChecklistItem[]> {
    try {
      const checklist = await this.missionRepository.getMissionChecklist(missionId);
      this.logger.info(`Checklist de la mission ${missionId} : ${checklist.length} élément(s)`);
      return checklist;
    } catch (error: any) {
      this.logger.error(`Erreur getMissionChecklist (service): ${error.message}`);
      throw error;
    }
  }
}