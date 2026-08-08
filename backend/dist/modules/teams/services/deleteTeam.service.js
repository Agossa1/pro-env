"use strict";
/*
 * |--------------------------------------------------------------------------
 * | DELETE TEAM SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression logique d'une équipe terrain.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTeamService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class DeleteTeamService {
    constructor(teamRepository, logger) {
        this.teamRepository = teamRepository;
        this.logger = logger;
    }
    /** Supprime logiquement une équipe (deleted_at). */
    async deleteTeam(id) {
        try {
            await this.teamRepository.deleteTeam(id);
            this.logger.info(`Équipe supprimée : ${id}`);
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur deleteTeam (service): ${error.message}`);
            throw error;
        }
    }
}
exports.DeleteTeamService = DeleteTeamService;
//# sourceMappingURL=deleteTeam.service.js.map