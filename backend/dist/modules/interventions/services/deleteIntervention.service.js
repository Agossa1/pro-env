"use strict";
/*
 * |--------------------------------------------------------------------------
 * | DELETE INTERVENTION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression logique d'une intervention.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteInterventionService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class DeleteInterventionService {
    constructor(interventionRepository, logger) {
        this.interventionRepository = interventionRepository;
        this.logger = logger;
    }
    /** Supprime logiquement une intervention (deleted_at). */
    async deleteIntervention(id) {
        try {
            await this.interventionRepository.deleteIntervention(id);
            this.logger.info(`Intervention supprimée : ${id}`);
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur deleteIntervention (service): ${error.message}`);
            throw error;
        }
    }
}
exports.DeleteInterventionService = DeleteInterventionService;
//# sourceMappingURL=deleteIntervention.service.js.map