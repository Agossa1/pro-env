/*
 * |--------------------------------------------------------------------------
 * | GET SOCIETES SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des sociétés.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { SocieteRepository } from '../repositories/societe.repositories';
import type { AppSociete, PaginationQuery, PaginatedResult } from '../types/societe.types';

export interface GetAllSocietesQuery extends PaginationQuery {
  type?: string;
  filters?: { forcedRegionId?: string; forcedMunicipalityId?: string; forcedDistrictId?: string; forcedNeighborhoodId?: string; forcedCreatedBy?: string; forcedUserIdForTeamScopes?: string };
}

export class GetSocietesService {
  constructor(
    private readonly societeRepository: SocieteRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère la liste paginée des sociétés avec filtre optionnel par type.
   * @param query Paramètres de pagination et filtre type
   */
  public async getSocietes(
    query: GetAllSocietesQuery = {}
  ): Promise<PaginatedResult<AppSociete>> {
    try {
      const result = await this.societeRepository.getAllSocietes(query);
      this.logger.info(
        `Liste des sociétés récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`
      );
      return result;
    } catch (error: any) {
      this.logger.error(`Erreur getSocietes (service): ${error.message}`);
      throw error;
    }
  }
}