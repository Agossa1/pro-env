"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET REPORTS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des rapports.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportsService = void 0;
class GetReportsService {
    constructor(reportRepository, logger) {
        this.reportRepository = reportRepository;
        this.logger = logger;
    }
    /**
     * Récupère la liste paginée des rapports avec filtres optionnels.
     * @param query Paramètres de pagination + filtres (territoire, statut, catégorie)
     */
    async getReports(query = {}) {
        try {
            const result = await this.reportRepository.getAllReports(query);
            this.logger.info(`Liste des rapports récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur getReports (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetReportsService = GetReportsService;
//# sourceMappingURL=getReports.service.js.map