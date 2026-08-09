"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET TEAMS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée des équipes terrain.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTeamsService = void 0;
class GetTeamsService {
    constructor(teamRepository, logger) {
        this.teamRepository = teamRepository;
        this.logger = logger;
    }
    /** Récupère la liste paginée des équipes avec filtres (teamType, organizationId). */
    async getTeams(query = {}) {
        try {
            const result = await this.teamRepository.getAllTeams(query);
            this.logger.info(`Liste des équipes récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur getTeams (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetTeamsService = GetTeamsService;
//# sourceMappingURL=getTeams.service.js.map