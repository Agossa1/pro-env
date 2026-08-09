/*
 * |--------------------------------------------------------------------------
 * | GET ROLE BY CODE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un rôle par son code unique.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { RoleRepository } from '../repositories/role.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { AppRole } from '../types/role.types';

export class GetRoleByCodeService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère un rôle par son code unique (ex: 'super_admin').
   * @param code Code unique du rôle
   */
  public async getRoleByCode(code: string): Promise<AppRole> {
    try {
      const role = await this.roleRepository.getRoleByCode(code);
      if (!role) {
        throw new NotFoundError(`Rôle introuvable : ${code}`);
      }
      this.logger.info(`Rôle récupéré par code : ${role.code}`);
      return role;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getRoleByCode (service): ${error.message}`);
      throw error;
    }
  }
}