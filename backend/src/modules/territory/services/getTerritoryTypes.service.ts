/*
 * |--------------------------------------------------------------------------
 * | GET TERRITORY TYPES SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération de la liste des types de territoires.
 * | Retourne les résultats paginés, triés par niveau hiérarchique.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TerritoryRepository } from '../repositories/territory.repositories';
import type { TerritoryType, PaginationQuery, PaginatedResult } from '../types/territory.types';

export class GetTerritoryTypesService {
  constructor(
    private readonly territoryRepository: TerritoryRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère la liste paginée des types de territoires.
   * @param query Paramètres de pagination (page, limit)
   */
  public async getTerritoryTypes(
    query: PaginationQuery = {}
  ): Promise<PaginatedResult<TerritoryType>> {
    try {
      const result = await this.territoryRepository.getAllTerritoryTypes(query);
      this.logger.info(
        `Liste des types de territoires récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`
      );
      return result;
    } catch (error: any) {
      this.logger.error(`Erreur getTerritoryTypes (service): ${error.message}`);
      throw error;
    }
  }
}