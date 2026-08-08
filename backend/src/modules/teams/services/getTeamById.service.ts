/*
 * |--------------------------------------------------------------------------
 * | GET TEAM BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'une équipe par son identifiant UUID.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { FieldTeam } from '../types/team.types';

export class GetTeamByIdService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly logger: Logger,
  ) {}

  /** Récupère une équipe par son identifiant UUID. */
  public async getTeamById(id: string): Promise<FieldTeam> {
    try {
      const team = await this.teamRepository.getTeamById(id);
      if (!team) {
        throw new NotFoundError('Équipe introuvable.');
      }
      this.logger.info(`Équipe récupérée par ID : ${team.name}`);
      return team;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getTeamById (service): ${error.message}`);
      throw error;
    }
  }
}