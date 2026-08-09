/*
 * |--------------------------------------------------------------------------
 * | CREATE PERMISSION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'une permission.
 * | Vérifie l'unicité du couple (module, action) avant insertion.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { PermissionRepository } from '../repositories/permission.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import type { Permission, CreatePermissionPayload } from '../types/permission.types';

export class CreatePermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Crée une nouvelle permission après validation de l'unicité (module, action).
   * @param payload Données de la permission (module, action, description?)
   */
  public async createPermission(payload: CreatePermissionPayload): Promise<Permission> {
    try {
      const module = String(payload.module).trim().toLowerCase();
      const action = String(payload.action).trim().toLowerCase();

      if (!module || !action) {
        throw new BadRequestError('Le module et l\'action de la permission sont requis.');
      }

      const existing = await this.permissionRepository.getPermissionByModuleAction(module, action);
      if (existing) {
        throw new BadRequestError(
          `Une permission existe déjà pour "${module}" / "${action}".`
        );
      }

      const created = await this.permissionRepository.createPermission({
        ...payload,
        module,
        action,
      });

      this.logger.info(`Permission créée : ${created.module}/${created.action}`);
      return created;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur createPermission (service): ${error.message}`);
      throw error;
    }
  }
}