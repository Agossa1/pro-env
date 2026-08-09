"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET MISSIONS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des missions.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMissionsService = void 0;
class GetMissionsService {
    constructor(missionRepository, logger) {
        this.missionRepository = missionRepository;
        this.logger = logger;
    }
    /**
     * Récupère la liste paginée des missions avec filtres optionnels.
     */
    async getMissions(query = {}) {
        try {
            const result = await this.missionRepository.getAllMissions(query);
            this.logger.info(`Liste des missions récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur getMissions (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetMissionsService = GetMissionsService;
//# sourceMappingURL=getMissions.service.js.map