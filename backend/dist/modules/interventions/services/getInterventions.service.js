"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET INTERVENTIONS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des interventions.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterventionsService = void 0;
class GetInterventionsService {
    constructor(interventionRepository, logger) {
        this.interventionRepository = interventionRepository;
        this.logger = logger;
    }
    /** Récupère la liste paginée des interventions avec filtres optionnels. */
    async getInterventions(query = {}) {
        try {
            const result = await this.interventionRepository.getAllInterventions(query);
            this.logger.info(`Liste des interventions récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur getInterventions (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetInterventionsService = GetInterventionsService;
//# sourceMappingURL=getInterventions.service.js.map