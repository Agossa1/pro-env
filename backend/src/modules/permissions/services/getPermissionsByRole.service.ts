/*
 * |--------------------------------------------------------------------------
 * | GET PERMISSIONS BY ROLE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération des permissions associées à un rôle.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { PermissionRepository } from '../repositories/permission.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { Permission } from '../types/permission.types';

export class GetPermissionsByRoleService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère les permissions d'un rôle.
   * @param roleId Identifiant UUID du rôle
   */
  public async getPermissionsByRole(roleId: string): Promise<Permission[]> {
    try {
      // Vérifie que le rôle existe via les permissions (retourne [] si inexistant
      // car l'administration ne distingue pas rôle vide vs rôle absent ici)
      const permissions = await this.permissionRepository.getPermissionsByRoleId(roleId);
      this.logger.info(`Permissions du rôle ${roleId} : ${permissions.length}`);
      return permissions;
    } catch (error: any) {
      this.logger.error(`Erreur getPermissionsByRole (service): ${error.message}`);
      throw error;
    }
  }
}