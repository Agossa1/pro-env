/*
 * |--------------------------------------------------------------------------
 * | REMOVE MEMBER FROM TEAM SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de retrait d'un membre d'une équipe terrain.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class RemoveMemberFromTeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly logger: Logger,
  ) {}

  /** Retire (désactive) un membre d'une équipe. */
  public async removeMemberFromTeam(teamId: string, memberId: string): Promise<void> {
    try {
      if (!teamId || !memberId) {
        throw new BadRequestError('L\'équipe et le membre sont requis.');
      }

      await this.teamRepository.removeMemberFromTeam(teamId, memberId);

      this.logger.info(
        `Membre ${memberId} retiré de l'équipe ${teamId}`
      );
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur removeMemberFromTeam (service): ${error.message}`);
      throw error;
    }
  }
}