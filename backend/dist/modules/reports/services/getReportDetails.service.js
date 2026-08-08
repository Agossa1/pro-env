"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET REPORT DETAILS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération des détails 1:1 d'un rapport
 * | selon sa catégorie (drainage, route, déchets, biodiversité, environnement).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportDetailsService = void 0;
class GetReportDetailsService {
    constructor(reportRepository, logger) {
        this.reportRepository = reportRepository;
        this.logger = logger;
    }
    /**
     * Récupère le détail d'un rapport selon sa catégorie.
     * @param reportId Identifiant UUID du rapport
     */
    async getReportDetails(reportId) {
        try {
            const details = await this.reportRepository.getReportDetails(reportId);
            this.logger.info(`Détails du rapport ${reportId} récupérés`);
            return details;
        }
        catch (error) {
            this.logger.error(`Erreur getReportDetails (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetReportDetailsService = GetReportDetailsService;
//# sourceMappingURL=getReportDetails.service.js.map