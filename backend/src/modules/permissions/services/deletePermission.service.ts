/*
 * |--------------------------------------------------------------------------
 * | DELETE PERMISSION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression d'une permission.
 * | La suppression propage en CASCADE sur role_permissions (FK).
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { PermissionRepository } from '../repositories/permission.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class DeletePermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Supprime une permission par son identifiant UUID.
   * @param id Identifiant UUID de la permission à supprimer
   */
  public async deletePermission(id: string): Promise<void> {
    try {
      await this.permissionRepository.deletePermission(id);
      this.logger.info(`Permission supprimée : ${id}`);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur deletePermission (service): ${error.message}`);
      throw error;
    }
  }
}