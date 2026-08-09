/*
 * |--------------------------------------------------------------------------
 * | CREATE TEAM SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'une équipe (institution ou prestataire).
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import { TeamType } from '../types/team.enums';
import type { FieldTeam, CreateTeamPayload } from '../types/team.types';

export class CreateTeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly logger: Logger,
  ) {}

  /** Crée une équipe terrain (institution publique ou société prestataire). */
  public async createTeam(payload: CreateTeamPayload): Promise<FieldTeam> {
    try {
      if (!payload.name || !payload.teamType) {
        throw new BadRequestError('Le nom et le type de l\'équipe sont requis.');
      }

      if (payload.teamType === TeamType.PROVIDER && !payload.organizationId) {
        throw new BadRequestError(
          'Une équipe prestataire (provider) doit être rattachée à une société (organizationId requis).'
        );
      }

      if (payload.teamType === TeamType.INSTITUTION && payload.organizationId) {
        throw new BadRequestError(
          'Une équipe d\'institution publique ne doit pas être rattachée à une société.'
        );
      }

      const created = await this.teamRepository.createTeam({
        ...payload,
        organizationId: payload.teamType === TeamType.PROVIDER ? payload.organizationId : null,
      });

      this.logger.info(`Équipe créée : ${created.name} (${created.teamType})`);
      return created;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur createTeam (service): ${error.message}`);
      throw error;
    }
  }
}