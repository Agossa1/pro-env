/*
 * |--------------------------------------------------------------------------
 * | CREATE ROLE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'un rôle.
 * | Vérifie l'unicité du code avant insertion.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { RoleRepository } from '../repositories/role.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import type { AppRole, CreateRolePayload } from '../types/role.types';

export class CreateRoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Crée un nouveau rôle après validation de l'unicité du code.
   * @param payload Données du rôle (code, name, ...)
   */
  public async createRole(payload: CreateRolePayload): Promise<AppRole> {
    try {
      const code = payload.code.trim().toLowerCase();
      if (!code) {
        throw new BadRequestError('Le code du rôle est requis.');
      }

      const existing = await this.roleRepository.getRoleByCode(code);
      if (existing) {
        throw new BadRequestError(`Un rôle existe déjà avec le code "${code}".`);
      }

      const created = await this.roleRepository.createRole({
        ...payload,
        code,
      });

      this.logger.info(`Rôle créé : ${created.code}`);
      return created;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur createRole (service): ${error.message}`);
      throw error;
    }
  }
}