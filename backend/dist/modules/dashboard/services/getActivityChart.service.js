"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetActivityChartService = void 0;
class GetActivityChartService {
    constructor(dashboardRepository, logger) {
        this.dashboardRepository = dashboardRepository;
        this.logger = logger;
    }
    async getActivityChart(period = 'monthly', filters) {
        try {
            // 12 mois de profondeur, quel que soit le mode d'affichage.
            const months = 12;
            return await this.dashboardRepository.getActivityChart(months, filters);
        }
        catch (error) {
            this.logger.error(`Erreur getActivityChart (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetActivityChartService = GetActivityChartService;
//# sourceMappingURL=getActivityChart.service.js.map