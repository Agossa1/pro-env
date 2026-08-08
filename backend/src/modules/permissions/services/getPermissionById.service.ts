/*
 * |--------------------------------------------------------------------------
 * | GET PERMISSION BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'une permission par son identifiant UUID.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { PermissionRepository } from '../repositories/permission.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { Permission } from '../types/permission.types';

export class GetPermissionByIdService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère une permission par son identifiant UUID.
   * @param id Identifiant UUID de la permission
   */
  public async getPermissionById(id: string): Promise<Permission> {
    try {
      const permission = await this.permissionRepository.getPermissionById(id);
      if (!permission) {
        throw new NotFoundError('Permission introuvable.');
      }
      this.logger.info(`Permission récupérée par ID : ${permission.module}/${permission.action}`);
      return permission;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getPermissionById (service): ${error.message}`);
      throw error;
    }
  }
}