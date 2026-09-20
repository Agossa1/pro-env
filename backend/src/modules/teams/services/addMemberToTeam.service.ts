/*
 * |--------------------------------------------------------------------------
 * | ADD MEMBER TO TEAM SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier d'ajout d'un membre à une équipe terrain.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TeamRepository } from '../repositories/team.repositories';
import { AuthRepository } from '../../auth/repositories/auth.repositories';
import { PasswordService } from '../../../config/passwords/passwordServices';
import { BadRequestError } from '../../../shared/errors/appErrors';
import { TeamMemberRole } from '../types/team.enums';
import type { FieldTeamMember } from '../types/team.types';

export interface AddMemberToTeamParams {
  fullName: string;
  email: string;
  phone?: string;
  role?: TeamMemberRole;
  organizationId?: string | null;
}

export class AddMemberToTeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly authRepository: AuthRepository,
    private readonly password: PasswordService,
    private readonly logger: Logger,
  ) {}

  /** Crée l'utilisateur technicien puis l'ajoute à l'équipe. */
  public async addMemberToTeam(
    teamId: string,
    params: AddMemberToTeamParams
  ): Promise<FieldTeamMember> {
    try {
      if (!teamId || !params.fullName || !params.email) {
        throw new BadRequestError("Le nom, l'email et l'équipe sont requis.");
      }

      const role = params.role ?? TeamMemberRole.OPS_OPERATOR;

      // 1. Vérifier si l'utilisateur existe déjà
      const existingUser = await this.authRepository.findAuthByEmail(params.email);
      let userId: string;

      if (existingUser) {
        // Si l'utilisateur existe, on utilise son ID
        userId = existingUser.id;
      } else {
        // Sinon on crée le compte technicien
        const technicienRole = await this.authRepository.getRoleByCode('technicien');
        if (!technicienRole) {
          throw new BadRequestError("Le rôle 'technicien' n'existe pas. Lancez le seed des rôles.");
        }

        const rawPassword = this.password.generateRandomPassword();
        const passwordHash = await this.password.hashPassword(rawPassword);

        const createdUser = await this.authRepository.createUser({
          fullName: params.fullName,
          email: params.email.toLowerCase(),
          phone: params.phone ?? undefined,
          passwordHash,
          roleId: technicienRole.id,
          regionId: null, municipalityId: null, districtId: null, neighborhoodId: null,
          organizationId: params.organizationId ?? null,
          createdBy: undefined,
        });
        
        userId = createdUser.id;
      }

      // 5. Ajout du membre à l'équipe
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
