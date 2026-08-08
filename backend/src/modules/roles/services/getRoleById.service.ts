/*
 * |--------------------------------------------------------------------------
 * | GET ROLE BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un rôle par son identifiant UUID.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { RoleRepository } from '../repositories/role.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { AppRole } from '../types/role.types';

export class GetRoleByIdService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère un rôle par son identifiant UUID.
   * @param id Identifiant UUID du rôle
   */
  public async getRoleById(id: string): Promise<AppRole> {
    try {
      const role = await this.roleRepository.getRoleById(id);
      if (!role) {
        throw new NotFoundError('Rôle introuvable.');
      }
      this.logger.info(`Rôle récupéré par ID : ${role.code}`);
      return role;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getRoleById (service): ${error.message}`);
      throw error;
    }
  }
}