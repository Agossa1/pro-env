/*
 * |--------------------------------------------------------------------------
 * | DELETE TEAM SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression logique d'une équipe terrain.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class DeleteTeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly logger: Logger,
  ) {}

  /** Supprime logiquement une équipe (deleted_at). */
  public async deleteTeam(id: string): Promise<void> {
    try {
      await this.teamRepository.deleteTeam(id);
      this.logger.info(`Équipe supprimée : ${id}`);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur deleteTeam (service): ${error.message}`);
      throw error;
    }
  }
}