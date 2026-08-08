"use strict";
/*
 * |--------------------------------------------------------------------------
 * | UPDATE TEAM SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de mise à jour d'une équipe terrain.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTeamService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class UpdateTeamService {
    constructor(teamRepository, logger) {
        this.teamRepository = teamRepository;
        this.logger = logger;
    }
    /** Met à jour une équipe existante. */
    async updateTeam(id, payload) {
        try {
            const updated = await this.teamRepository.updateTeam(id, payload);
            if (!updated) {
                throw new appErrors_1.NotFoundError('Équipe introuvable.');
            }
            this.logger.info(`Équipe mise à jour : ${updated.name}`);
            return updated;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur updateTeam (service): ${error.message}`);
            throw error;
        }
    }
}
exports.UpdateTeamService = UpdateTeamService;
//# sourceMappingURL=updateTeam.service.js.map