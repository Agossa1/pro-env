"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPriorityMissionsService = void 0;
class GetPriorityMissionsService {
    constructor(dashboardRepository, logger) {
        this.dashboardRepository = dashboardRepository;
        this.logger = logger;
    }
    async getPriorityMissions(limit = 5) {
        try {
            return await this.dashboardRepository.getPriorityMissions(limit);
        }
        catch (error) {
            this.logger.error(`Erreur getPriorityMissions (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetPriorityMissionsService = GetPriorityMissionsService;
//# sourceMappingURL=getPriorityMissions.service.js.map