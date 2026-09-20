/*
 * |--------------------------------------------------------------------------
 * | CREATE MISSION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'une mission.
 * | Injecte le créateur (utilisateur connecté) et valide les champs requis.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { MissionRepository } from '../repositories/mission.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import type { Mission, CreateMissionPayload } from '../types/mission.types';

export interface CreateMissionContext {
  userId?: string;
}

export class CreateMissionService {
  constructor(
    private readonly missionRepository: MissionRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Crée une nouvelle mission.
   * @param payload Données de la mission (territoire, type, titre...)
   * @param creator Contexte de l'utilisateur connecté (userId)
   */
  public async createMission(
    payload: CreateMissionPayload,
    creator?: CreateMissionContext
  ): Promise<Mission> {
    try {
      if (!payload.municipalityId || !payload.title || !payload.missionType) {
        throw new BadRequestError(
          'Le territoire, le titre et le type de la mission sont requis.'
        );
      }

      const created = await this.missionRepository.createMission({
        ...payload,
        createdBy: creator?.userId ?? payload.createdBy ?? null,
      });

      this.logger.info(`Mission créée : ${created.title} (${created.missionType})`);
      return created;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur createMission (service): ${error.message}`);
      throw error;
    }
  }
}