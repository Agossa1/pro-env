"use strict";
/*
 * |--------------------------------------------------------------------------
 * | UPDATE REPORT SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de mise à jour d'un rapport de signalement.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateReportService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class UpdateReportService {
    constructor(reportRepository, logger) {
        this.reportRepository = reportRepository;
        this.logger = logger;
    }
    /**
     * Met à jour un rapport existant.
     * @param id Identifiant UUID du rapport
     * @param payload Champs modifiables (titre, statut, priorité...)
     */
    async updateReport(id, payload) {
        try {
            const updated = await this.reportRepository.updateReport(id, payload);
            if (!updated) {
                throw new appErrors_1.NotFoundError('Rapport introuvable.');
            }
            this.logger.info(`Rapport mis à jour : ${updated.title}`);
            return updated;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur updateReport (service): ${error.message}`);
            throw error;
        }
    }
}
exports.UpdateReportService = UpdateReportService;
//# sourceMappingURL=updateReport.service.js.map