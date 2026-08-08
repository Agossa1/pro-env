"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET INTERVENTION BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'une intervention par son UUID.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterventionByIdService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetInterventionByIdService {
    constructor(interventionRepository, logger) {
        this.interventionRepository = interventionRepository;
        this.logger = logger;
    }
    /** Récupère une intervention par son identifiant UUID. */
    async getInterventionById(id) {
        try {
            const intervention = await this.interventionRepository.getInterventionById(id);
            if (!intervention) {
                throw new appErrors_1.NotFoundError('Intervention introuvable.');
            }
            this.logger.info(`Intervention récupérée par ID : ${intervention.interventionType}`);
            return intervention;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getInterventionById (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetInterventionByIdService = GetInterventionByIdService;
//# sourceMappingURL=getInterventionById.service.js.map