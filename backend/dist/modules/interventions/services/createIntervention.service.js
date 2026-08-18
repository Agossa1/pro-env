"use strict";
/*
 * |--------------------------------------------------------------------------
 * | CREATE INTERVENTION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'une intervention (exécution d'une mission).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInterventionService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreateInterventionService {
    constructor(interventionRepository, logger) {
        this.interventionRepository = interventionRepository;
        this.logger = logger;
    }
    /** Crée une nouvelle intervention (exécution d'une mission par une équipe). */
    async createIntervention(payload) {
        try {
            if (!payload.missionId || !payload.assignedSocieteId || !payload.interventionType) {
                throw new appErrors_1.BadRequestError('La mission, la société assignée et le type d\'intervention sont requis.');
            }
            const created = await this.interventionRepository.createIntervention(payload);
            this.logger.info(`Intervention créée : ${created.interventionType} (mission ${created.missionId})`);
            return created;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur createIntervention (service): ${error.message}`);
            throw error;
        }
    }
}
exports.CreateInterventionService = CreateInterventionService;
//# sourceMappingURL=createIntervention.service.js.map