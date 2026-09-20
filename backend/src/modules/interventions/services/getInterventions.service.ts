/*
 * |--------------------------------------------------------------------------
 * | GET INTERVENTIONS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des interventions.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { InterventionRepository } from '../repositories/intervention.repositories';
import type { Intervention, PaginationQuery, PaginatedResult } from '../types/intervention.types';

export interface GetAllInterventionsQuery extends PaginationQuery {
  missionId?: string;
  teamId?: string;
  status?: string;
  regionId?: string;
  municipalityId?: string;
  districtId?: string;
  neighborhoodId?: string;
  createdBy?: string;
  memberUserId?: string;
}

export class GetInterventionsService {
  constructor(
    private readonly interventionRepository: InterventionRepository,
    private readonly logger: Logger,
  ) {}

  /** Récupère la liste paginée des interventions avec filtres optionnels. */
  public async getInterventions(
    query: GetAllInterventionsQuery = {}
  ): Promise<PaginatedResult<Intervention>> {
    try {
      const result = await this.interventionRepository.getAllInterventions(query);
      this.logger.info(
        `Liste des interventions récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`
      );
      return result;
    } catch (error: any) {
      this.logger.error(`Erreur getInterventions (service): ${error.message}`);
      throw error;
    }
  }
}