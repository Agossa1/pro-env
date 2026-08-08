/*
 * |--------------------------------------------------------------------------
 * | GET ALL TERRITORIES SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des territoires.
 * | Filtres optionnels : type (territoryTypeId) et parent (parentTerritoryId).
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TerritoryRepository } from '../repositories/territory.repositories';
import type { Territory, PaginationQuery, PaginatedResult } from '../types/territory.types';

export interface GetAllTerritoriesQuery extends PaginationQuery {
  territoryTypeId?: string;
  parentTerritoryId?: string;
}

export class GetAllTerritoriesService {
  constructor(
    private readonly territoryRepository: TerritoryRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère la liste paginée des territoires avec filtres optionnels.
   * @param query Paramètres de pagination et filtres (territoryTypeId, parentTerritoryId)
   */
  public async getAllTerritories(
    query: GetAllTerritoriesQuery = {}
  ): Promise<PaginatedResult<Territory>> {
    try {
      const result = await this.territoryRepository.getAllTerritories(query);
      this.logger.info(
        `Liste des territoires récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`
      );
      return result;
    } catch (error: any) {
      this.logger.error(`Erreur getAllTerritories (service): ${error.message}`);
      throw error;
    }
  }
}