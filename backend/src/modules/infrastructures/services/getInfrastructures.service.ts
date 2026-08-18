/*
 * |--------------------------------------------------------------------------
 * | GET INFRASTRUCTURES SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des infrastructures.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { InfrastructureRepository, GetAllInfrastructuresQuery } from '../repositories/infrastructure.repositories';
import type { Infrastructure, PaginatedResult } from '../types/infrastructure.types';

export class GetInfrastructuresService {
  constructor(
    private readonly infrastructureRepository: InfrastructureRepository,
    private readonly logger: Logger,
  ) {}

  /** Récupère la liste paginée des infrastructures avec filtres optionnels. */
  public async getInfrastructures(
    query: GetAllInfrastructuresQuery = {}
  ): Promise<PaginatedResult<Infrastructure>> {
    try {
      const result = await this.infrastructureRepository.getAllInfrastructures(query);
      this.logger.info(
        `Liste des infrastructures récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`
      );
      return result;
    } catch (error: any) {
      this.logger.error(`Erreur getInfrastructures (service): ${error.message}`);
      throw error;
    }
  }
}
