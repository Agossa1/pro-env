"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET TEAM MEMBERS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération des membres actifs d'une équipe.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTeamMembersService = void 0;
class GetTeamMembersService {
    constructor(teamRepository, logger) {
        this.teamRepository = teamRepository;
        this.logger = logger;
    }
    /** Récupère les membres actifs d'une équipe. */
    async getTeamMembers(teamId) {
        try {
            const members = await this.teamRepository.getTeamMembers(teamId);
            this.logger.info(`Membres de l'équipe ${teamId} : ${members.length} membre(s)`);
            return members;
        }
        catch (error) {
            this.logger.error(`Erreur getTeamMembers (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetTeamMembersService = GetTeamMembersService;
//# sourceMappingURL=getTeamMembers.service.js.map