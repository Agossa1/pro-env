/*
 * |--------------------------------------------------------------------------
 * | UPDATE PERMISSION SERVICE
 *--------------------------------------------------------------------------
 * | Service métier de mise à jour d'une permission (description).
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { PermissionRepository } from '../repositories/permission.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { Permission, UpdatePermissionPayload } from '../types/permission.types';

export class UpdatePermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Met à jour une permission existante.
   * @param id Identifiant UUID de la permission
   * @param payload Champs modifiables (description)
   */
  public async updatePermission(
    id: string,
    payload: UpdatePermissionPayload
  ): Promise<Permission> {
    try {
      const updated = await this.permissionRepository.updatePermission(id, payload);
      if (!updated) {
        throw new NotFoundError('Permission introuvable.');
      }
      this.logger.info(`Permission mise à jour : ${updated.module}/${updated.action}`);
      return updated;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updatePermission (service): ${error.message}`);
      throw error;
    }
  }
}