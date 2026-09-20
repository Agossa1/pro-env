"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportsByCategoryService = void 0;
class GetReportsByCategoryService {
    constructor(dashboardRepository, logger) {
        this.dashboardRepository = dashboardRepository;
        this.logger = logger;
    }
    async getReportsByCategory(filters) {
        try {
            return await this.dashboardRepository.getReportsByCategory(filters);
        }
        catch (error) {
            this.logger.error(`Erreur getReportsByCategory (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetReportsByCategoryService = GetReportsByCategoryService;
//# sourceMappingURL=getReportsByCategory.service.js.map