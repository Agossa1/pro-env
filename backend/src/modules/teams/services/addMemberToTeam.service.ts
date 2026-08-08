/*
 * |--------------------------------------------------------------------------
 * | ADD MEMBER TO TEAM SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier d'ajout d'un membre à une équipe terrain.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import { TeamMemberRole } from '../types/team.enums';
import type { FieldTeamMember } from '../types/team.types';

export class AddMemberToTeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly logger: Logger,
  ) {}

  /** Ajoute un membre (leader/member) à une équipe. */
  public async addMemberToTeam(
    teamId: string,
    userId: string,
    role: TeamMemberRole = TeamMemberRole.MEMBER
  ): Promise<FieldTeamMember> {
    try {
      if (!teamId || !userId) {
        throw new BadRequestError('L\'équipe et l\'utilisateur sont requis.');
      }

      const member = await this.teamRepository.addMemberToTeam(teamId, userId, role);

      this.logger.info(
        `Utilisateur ${userId} ajouté à l'équipe ${teamId} (${role})`
      );
      return member;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur addMemberToTeam (service): ${error.message}`);
      throw error;
    }
  }
}