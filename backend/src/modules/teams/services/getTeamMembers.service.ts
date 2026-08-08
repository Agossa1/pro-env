/*
 * |--------------------------------------------------------------------------
 * | GET TEAM MEMBERS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération des membres actifs d'une équipe.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repositories';
import type { FieldTeamMember } from '../types/team.types';

export class GetTeamMembersService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly logger: Logger,
  ) {}

  /** Récupère les membres actifs d'une équipe. */
  public async getTeamMembers(teamId: string): Promise<FieldTeamMember[]> {
    try {
      const members = await this.teamRepository.getTeamMembers(teamId);
      this.logger.info(`Membres de l'équipe ${teamId} : ${members.length} membre(s)`);
      return members;
    } catch (error: any) {
      this.logger.error(`Erreur getTeamMembers (service): ${error.message}`);
      throw error;
    }
  }
}