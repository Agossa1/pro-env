"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRecentReportsService = void 0;
class GetRecentReportsService {
    constructor(dashboardRepository, logger) {
        this.dashboardRepository = dashboardRepository;
        this.logger = logger;
    }
    async getRecentReports(page = 1, limit = 10, search = '', status = '', filters) {
        try {
            const offset = (page - 1) * limit;
            const { data, total } = await this.dashboardRepository.getRecentReports(offset, limit, search, status, filters);
            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            this.logger.error(`Erreur getRecentReports (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetRecentReportsService = GetRecentReportsService;
//# sourceMappingURL=getRecentReports.service.js.map