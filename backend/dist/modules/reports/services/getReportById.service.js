"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET REPORT BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un rapport par son identifiant UUID.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportByIdService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetReportByIdService {
    constructor(reportRepository, logger) {
        this.reportRepository = reportRepository;
        this.logger = logger;
    }
    /**
     * Récupère un rapport par son identifiant UUID.
     * @param id Identifiant UUID du rapport
     */
    async getReportById(id) {
        try {
            const report = await this.reportRepository.getReportById(id);
            if (!report) {
                throw new appErrors_1.NotFoundError('Rapport introuvable.');
            }
            this.logger.info(`Rapport récupéré par ID : ${report.title}`);
            return report;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getReportById (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetReportByIdService = GetReportByIdService;
//# sourceMappingURL=getReportById.service.js.map