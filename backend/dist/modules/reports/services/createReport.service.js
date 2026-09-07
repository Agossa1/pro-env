"use strict";
/*
 * |--------------------------------------------------------------------------
 * | CREATE REPORT SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'un signalement (rapport terrain).
 * | Injecte le créateur (utilisateur connecté) et valide les entrées.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReportService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreateReportService {
    constructor(reportRepository, logger) {
        this.reportRepository = reportRepository;
        this.logger = logger;
    }
    /**
     * Crée un nouveau rapport de signalement.
     * @param payload Données du rapport (territoire, titre, catégorie...)
     * @param creator Contexte de l'utilisateur connecté (userId)
     */
    async createReport(payload, creator) {
        try {
            if (!payload.territoryId || !payload.title || !payload.issueCategory) {
                throw new appErrors_1.BadRequestError('Le territoire, le titre et la catégorie du rapport sont requis.');
            }
            // Vérification de l'unicité du signalement
            const isDuplicate = await this.reportRepository.checkDuplicateReport(payload.title.trim(), payload.issueCategory, payload.territoryId);
            if (isDuplicate) {
                throw new appErrors_1.BadRequestError('Un signalement similaire (même titre et catégorie dans ce territoire) existe déjà.');
            }
            const created = await this.reportRepository.createReport({
                ...payload,
                createdBy: creator?.userId ?? payload.createdBy ?? null,
            });
            this.logger.info(`Rapport créé : ${created.title} (${created.issueCategory})`);
            return created;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur createReport (service): ${error.message}`);
            throw error;
        }
    }
}
exports.CreateReportService = CreateReportService;
//# sourceMappingURL=createReport.service.js.map