"use strict";
/*
 * |--------------------------------------------------------------------------
 * | CREATE FIELD REPORT SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'un rapport d'intervention terrain.
 * | Injecte l'utilisateur connecté comme créateur.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFieldReportService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreateFieldReportService {
    constructor(interventionRepository, logger) {
        this.interventionRepository = interventionRepository;
        this.logger = logger;
    }
    /** Crée un rapport d'intervention terrain (auteur = utilisateur connecté). */
    async createFieldReport(payload, creator) {
        try {
            if (!payload.interventionId) {
                throw new appErrors_1.BadRequestError('L\'intervention est requise.');
            }
            const report = await this.interventionRepository.createFieldReport({
                ...payload,
                createdBy: creator?.userId ?? payload.createdBy ?? null,
            });
            this.logger.info(`Rapport d'intervention créé : intervention ${payload.interventionId}`);
            return report;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur createFieldReport (service): ${error.message}`);
            throw error;
        }
    }
}
exports.CreateFieldReportService = CreateFieldReportService;
//# sourceMappingURL=createFieldReport.service.js.map