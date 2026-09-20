"use strict";
/*
 * |--------------------------------------------------------------------------
 * | ADD MEMBER TO TEAM SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier d'ajout d'un membre à une équipe terrain.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMemberToTeamService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const team_enums_1 = require("../types/team.enums");
class AddMemberToTeamService {
    constructor(teamRepository, authRepository, password, logger) {
        this.teamRepository = teamRepository;
        this.authRepository = authRepository;
        this.password = password;
        this.logger = logger;
    }
    /** Crée l'utilisateur technicien puis l'ajoute à l'équipe. */
    async addMemberToTeam(teamId, params) {
        try {
            if (!teamId || !params.fullName || !params.email) {
                throw new appErrors_1.BadRequestError("Le nom, l'email et l'équipe sont requis.");
            }
            const role = params.role ?? team_enums_1.TeamMemberRole.OPS_OPERATOR;
            // 1. Vérifier si l'utilisateur existe déjà
            const existingUser = await this.authRepository.findAuthByEmail(params.email);
            let userId;
            if (existingUser) {
                // Si l'utilisateur existe, on utilise son ID
                userId = existingUser.id;
            }
            else {
                // Sinon on crée le compte technicien
                const technicienRole = await this.authRepository.getRoleByCode('technicien');
                if (!technicienRole) {
                    throw new appErrors_1.BadRequestError("Le rôle 'technicien' n'existe pas. Lancez le seed des rôles.");
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
            this.logger.info(`Utilisateur ${userId} ajouté à l'équipe ${teamId} (${role})`);
            return member;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur addMemberToTeam (service): ${error.message}`);
            throw error;
        }
    }
}
exports.AddMemberToTeamService = AddMemberToTeamService;
//# sourceMappingURL=addMemberToTeam.service.js.map