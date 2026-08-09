"use strict";
/*
 * |--------------------------------------------------------------------------
 * | DELETE REPORT SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression logique d'un rapport de signalement.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteReportService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class DeleteReportService {
    constructor(reportRepository, logger) {
        this.reportRepository = reportRepository;
        this.logger = logger;
    }
    /**
     * Supprime logiquement un rapport par son identifiant UUID (deleted_at).
     * @param id Identifiant UUID du rapport à supprimer
     */
    async deleteReport(id) {
        try {
            await this.reportRepository.deleteReport(id);
            this.logger.info(`Rapport supprimé : ${id}`);
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur deleteReport (service): ${error.message}`);
            throw error;
        }
    }
}
exports.DeleteReportService = DeleteReportService;
//# sourceMappingURL=deleteReport.service.js.map