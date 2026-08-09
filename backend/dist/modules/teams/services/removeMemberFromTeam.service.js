"use strict";
/*
 * |--------------------------------------------------------------------------
 * | REMOVE MEMBER FROM TEAM SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de retrait d'un membre d'une équipe terrain.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveMemberFromTeamService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const appErrors_2 = require("../../../shared/errors/appErrors");
class RemoveMemberFromTeamService {
    constructor(teamRepository, logger) {
        this.teamRepository = teamRepository;
        this.logger = logger;
    }
    /** Retire (désactive) un membre d'une équipe. */
    async removeMemberFromTeam(teamId, memberId) {
        try {
            if (!teamId || !memberId) {
                throw new appErrors_1.BadRequestError('L\'équipe et le membre sont requis.');
            }
            await this.teamRepository.removeMemberFromTeam(teamId, memberId);
            this.logger.info(`Membre ${memberId} retiré de l'équipe ${teamId}`);
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError || error instanceof appErrors_2.NotFoundError)
                throw error;
            this.logger.error(`Erreur removeMemberFromTeam (service): ${error.message}`);
            throw error;
        }
    }
}
exports.RemoveMemberFromTeamService = RemoveMemberFromTeamService;
//# sourceMappingURL=removeMemberFromTeam.service.js.map