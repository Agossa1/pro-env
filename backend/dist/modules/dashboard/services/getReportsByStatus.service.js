"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportsByStatusService = void 0;
class GetReportsByStatusService {
    constructor(dashboardRepository, logger) {
        this.dashboardRepository = dashboardRepository;
        this.logger = logger;
    }
    async getReportsByStatus(filters) {
        try {
            return await this.dashboardRepository.getReportsByStatus(filters);
        }
        catch (error) {
            this.logger.error(`Erreur getReportsByStatus (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetReportsByStatusService = GetReportsByStatusService;
//# sourceMappingURL=getReportsByStatus.service.js.map