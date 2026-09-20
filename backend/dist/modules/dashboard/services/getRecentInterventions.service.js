"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRecentInterventionsService = void 0;
class GetRecentInterventionsService {
    constructor(dashboardRepository, logger) {
        this.dashboardRepository = dashboardRepository;
        this.logger = logger;
    }
    /**
     * Récupère les interventions récentes.
     * Pour un utilisateur "societe", restreint le périmètre à son organisation.
     */
    async getRecentInterventions(limit = 6, organizationId, filters) {
        try {
            return await this.dashboardRepository.getRecentInterventions(limit, organizationId, filters);
        }
        catch (error) {
            this.logger.error(`Erreur getRecentInterventions (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetRecentInterventionsService = GetRecentInterventionsService;
//# sourceMappingURL=getRecentInterventions.service.js.map