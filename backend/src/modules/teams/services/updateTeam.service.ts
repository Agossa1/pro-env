/*
 * |--------------------------------------------------------------------------
 * | UPDATE TEAM SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de mise à jour d'une équipe terrain.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { FieldTeam, UpdateTeamPayload } from '../types/team.types';

export class UpdateTeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly logger: Logger,
  ) {}

  /** Met à jour une équipe existante. */
  public async updateTeam(id: string, payload: UpdateTeamPayload): Promise<FieldTeam> {
    try {
      const updated = await this.teamRepository.updateTeam(id, payload);
      if (!updated) {
        throw new NotFoundError('Équipe introuvable.');
      }
      this.logger.info(`Équipe mise à jour : ${updated.name}`);
      return updated;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updateTeam (service): ${error.message}`);
      throw error;
    }
  }
}