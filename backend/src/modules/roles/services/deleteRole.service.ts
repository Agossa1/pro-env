/*
 * |--------------------------------------------------------------------------
 * | DELETE ROLE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression d'un rôle.
 * | La suppression est bloquée si des utilisateurs y sont rattachés.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { RoleRepository } from '../repositories/role.repositories';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';

export class DeleteRoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Supprime un rôle par son identifiant UUID.
   * @param id Identifiant UUID du rôle à supprimer
   */
  public async deleteRole(id: string): Promise<void> {
    try {
      await this.roleRepository.deleteRole(id);
      this.logger.info(`Rôle supprimé : ${id}`);
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur deleteRole (service): ${error.message}`);
      throw error;
    }
  }
}