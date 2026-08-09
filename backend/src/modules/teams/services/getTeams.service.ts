/*
 * |--------------------------------------------------------------------------
 * | GET TEAMS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée des équipes terrain.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repositories';
import type { FieldTeam, PaginationQuery, PaginatedResult } from '../types/team.types';

export interface GetAllTeamsQuery extends PaginationQuery {
  teamType?: string;
  organizationId?: string;
}

export class GetTeamsService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly logger: Logger,
  ) {}

  /** Récupère la liste paginée des équipes avec filtres (teamType, organizationId). */
  public async getTeams(
    query: GetAllTeamsQuery = {}
  ): Promise<PaginatedResult<FieldTeam>> {
    try {
      const result = await this.teamRepository.getAllTeams(query);
      this.logger.info(
        `Liste des équipes récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`
      );
      return result;
    } catch (error: any) {
      this.logger.error(`Erreur getTeams (service): ${error.message}`);
      throw error;
    }
  }
}