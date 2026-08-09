/*
 * |--------------------------------------------------------------------------
 * | ASSIGN USER TO MISSION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier d'assignation d'un utilisateur à une mission.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { MissionRepository } from '../repositories/mission.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import type { MissionAssignment } from '../types/mission.types';

export interface AssignUserContext {
  assignedBy?: string;
}

export class AssignUserToMissionService {
  constructor(
    private readonly missionRepository: MissionRepository,
    private readonly logger: Logger,
  ) {}

  /** Assigne un utilisateur à une mission (idempotent). */
  public async assignUserToMission(
    missionId: string,
    userId: string,
    context?: AssignUserContext
  ): Promise<MissionAssignment> {
    try {
      if (!missionId || !userId) {
        throw new BadRequestError('La mission et l\'utilisateur sont requis.');
      }

      const assignment = await this.missionRepository.assignUserToMission(
        missionId,
        userId,
        context?.assignedBy
      );

      this.logger.info(
        `Utilisateur ${userId} assigné à la mission ${missionId} (par ${context?.assignedBy ?? 'système'})`
      );
      return assignment;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur assignUserToMission (service): ${error.message}`);
      throw error;
    }
  }
}