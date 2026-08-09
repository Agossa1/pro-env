"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET INTERVENTION REPORTS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération des rapports terrain d'une intervention.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterventionReportsService = void 0;
class GetInterventionReportsService {
    constructor(interventionRepository, logger) {
        this.interventionRepository = interventionRepository;
        this.logger = logger;
    }
    /** Récupère les rapports terrain d'une intervention. */
    async getInterventionReports(interventionId) {
        try {
            const reports = await this.interventionRepository.getInterventionReports(interventionId);
            this.logger.info(`Rapports de l'intervention ${interventionId} : ${reports.length} rapport(s)`);
            return reports;
        }
        catch (error) {
            this.logger.error(`Erreur getInterventionReports (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetInterventionReportsService = GetInterventionReportsService;
//# sourceMappingURL=getInterventionReports.service.js.map