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
    constructor(teamRepository, logger) {
        this.teamRepository = teamRepository;
        this.logger = logger;
    }
    /** Ajoute un membre (leader/member) à une équipe. */
    async addMemberToTeam(teamId, userId, role = team_enums_1.TeamMemberRole.MEMBER) {
        try {
            if (!teamId || !userId) {
                throw new appErrors_1.BadRequestError('L\'équipe et l\'utilisateur sont requis.');
            }
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