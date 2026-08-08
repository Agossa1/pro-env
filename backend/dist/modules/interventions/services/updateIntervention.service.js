"use strict";
/*
 * |--------------------------------------------------------------------------
 * | UPDATE INTERVENTION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de mise à jour d'une intervention.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInterventionService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class UpdateInterventionService {
    constructor(interventionRepository, logger) {
        this.interventionRepository = interventionRepository;
        this.logger = logger;
    }
    /** Met à jour une intervention existante (statut, notes, dates...). */
    async updateIntervention(id, payload) {
        try {
            const updated = await this.interventionRepository.updateIntervention(id, payload);
            if (!updated) {
                throw new appErrors_1.NotFoundError('Intervention introuvable.');
            }
            this.logger.info(`Intervention mise à jour : ${updated.interventionType}`);
            return updated;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur updateIntervention (service): ${error.message}`);
            throw error;
        }
    }
}
exports.UpdateInterventionService = UpdateInterventionService;
//# sourceMappingURL=updateIntervention.service.js.map