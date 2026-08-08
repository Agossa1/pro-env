/*
 * |--------------------------------------------------------------------------
 * | GET ROLES WITH PERMISSIONS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération de tous les rôles avec leurs
 * | permissions agrégées.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { PermissionRepository } from '../repositories/permission.repositories';
import type { RoleWithPermissions } from '../types/permission.types';

export class GetRolesWithPermissionsService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère tous les rôles avec leurs permissions agrégées.
   */
  public async getRolesWithPermissions(): Promise<RoleWithPermissions[]> {
    try {
      const roles = await this.permissionRepository.getRolesWithPermissions();
      this.logger.info(`Rôles avec permissions récupérés : ${roles.length}`);
      return roles;
    } catch (error: any) {
      this.logger.error(`Erreur getRolesWithPermissions (service): ${error.message}`);
      throw error;
    }
  }
}