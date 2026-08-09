/*
 * |--------------------------------------------------------------------------
 * | GET MISSIONS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des missions.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { MissionRepository } from '../repositories/mission.repositories';
import type { Mission, PaginationQuery, PaginatedResult } from '../types/mission.types';

export interface GetAllMissionsQuery extends PaginationQuery {
  territoryId?: string;
  status?: string;
  missionType?: string;
  organizationId?: string;
}

export class GetMissionsService {
  constructor(
    private readonly missionRepository: MissionRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère la liste paginée des missions avec filtres optionnels.
   */
  public async getMissions(
    query: GetAllMissionsQuery = {}
  ): Promise<PaginatedResult<Mission>> {
    try {
      const result = await this.missionRepository.getAllMissions(query);
      this.logger.info(
        `Liste des missions récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`
      );
      return result;
    } catch (error: any) {
      this.logger.error(`Erreur getMissions (service): ${error.message}`);
      throw error;
    }
  }
}