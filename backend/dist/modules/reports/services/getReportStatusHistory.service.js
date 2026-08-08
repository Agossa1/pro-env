"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET REPORT STATUS HISTORY SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération de l'historique des statuts d'un rapport.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportStatusHistoryService = void 0;
class GetReportStatusHistoryService {
    constructor(reportRepository, logger) {
        this.reportRepository = reportRepository;
        this.logger = logger;
    }
    /**
     * Récupère l'historique des statuts d'un rapport.
     * @param reportId Identifiant UUID du rapport
     */
    async getReportStatusHistory(reportId) {
        try {
            const history = await this.reportRepository.getReportStatusHistory(reportId);
            this.logger.info(`Historique du rapport ${reportId} : ${history.length} entrée(s)`);
            return history;
        }
        catch (error) {
            this.logger.error(`Erreur getReportStatusHistory (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetReportStatusHistoryService = GetReportStatusHistoryService;
//# sourceMappingURL=getReportStatusHistory.service.js.map