/*
 * |--------------------------------------------------------------------------
 * | UPDATE ROLE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de mise à jour d'un rôle.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { RoleRepository } from '../repositories/role.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { AppRole, UpdateRolePayload } from '../types/role.types';

export class UpdateRoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Met à jour un rôle existant.
   * @param id Identifiant UUID du rôle
   * @param payload Champs modifiables (name, description, tier, ...)
   */
  public async updateRole(
    id: string,
    payload: UpdateRolePayload
  ): Promise<AppRole> {
    try {
      const updated = await this.roleRepository.updateRole(id, payload);
      if (!updated) {
        throw new NotFoundError('Rôle introuvable.');
      }
      this.logger.info(`Rôle mis à jour : ${updated.code}`);
      return updated;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updateRole (service): ${error.message}`);
      throw error;
    }
  }
}