/*
 * |--------------------------------------------------------------------------
 * | REMOVE PERMISSION FROM ROLE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de retrait d'une permission d'un rôle.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { PermissionRepository } from '../repositories/permission.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class RemovePermissionFromRoleService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Retire une permission d'un rôle.
   * @param roleId Identifiant UUID du rôle
   * @param permissionId Identifiant UUID de la permission
   */
  public async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    try {
      await this.permissionRepository.removePermissionFromRole(roleId, permissionId);
      this.logger.info(`Permission ${permissionId} retirée du rôle ${roleId}`);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur removePermissionFromRole (service): ${error.message}`);
      throw error;
    }
  }
}