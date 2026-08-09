/*
 * |--------------------------------------------------------------------------
 * | GET PERMISSIONS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des permissions.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { PermissionRepository } from '../repositories/permission.repositories';
import type { Permission, PaginationQuery, PaginatedResult } from '../types/permission.types';

export class GetPermissionsService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère la liste paginée des permissions.
   * @param query Paramètres de pagination (page, limit)
   */
  public async getPermissions(
    query: PaginationQuery = {}
  ): Promise<PaginatedResult<Permission>> {
    try {
      const result = await this.permissionRepository.getAllPermissions(query);
      this.logger.info(
        `Liste des permissions récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`
      );
      return result;
    } catch (error: any) {
      this.logger.error(`Erreur getPermissions (service): ${error.message}`);
      throw error;
    }
  }
}