/*
 * |--------------------------------------------------------------------------
 * | ASSIGN PERMISSIONS TO ROLE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier d'assignation de plusieurs permissions à un rôle.
 * | Détecte les doublons avant l'assignation.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { PermissionRepository } from '../repositories/permission.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import type { RolePermission } from '../types/permission.types';

export class AssignPermissionsToRoleService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Assigne plusieurs permissions à un rôle.
   * @param roleId Identifiant UUID du rôle
   * @param permissionIds Liste des UUID de permissions
   */
  public async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<RolePermission[]> {
    try {
      if (!permissionIds || permissionIds.length === 0) {
        throw new BadRequestError('Au moins une permission doit être assignée.');
      }

      const uniqueIds = [...new Set(permissionIds)];
      const assigned = await this.permissionRepository.assignPermissionsToRole(roleId, uniqueIds);

      this.logger.info(
        `${assigned.length}/${uniqueIds.length} permission(s) assignée(s) au rôle ${roleId}`
      );
      return assigned;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur assignPermissionsToRole (service): ${error.message}`);
      throw error;
    }
  }
}