/*
 * |--------------------------------------------------------------------------
 * | GET ROLES SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des rôles.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { RoleRepository } from '../repositories/role.repositories';
import type { AppRole, PaginationQuery, PaginatedResult } from '../types/role.types';

export class GetRolesService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère la liste paginée des rôles.
   * @param query Paramètres de pagination (page, limit)
   */
  public async getRoles(
    query: PaginationQuery = {}
  ): Promise<PaginatedResult<AppRole>> {
    try {
      const result = await this.roleRepository.getAllRoles(query);
      this.logger.info(
        `Liste des rôles récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`
      );
      return result;
    } catch (error: any) {
      this.logger.error(`Erreur getRoles (service): ${error.message}`);
      throw error;
    }
  }
}