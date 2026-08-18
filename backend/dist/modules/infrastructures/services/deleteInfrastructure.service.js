"use strict";
/*
 * |--------------------------------------------------------------------------
 * | DELETE INFRASTRUCTURE SERVICE
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteInfrastructureService = void 0;
class DeleteInfrastructureService {
    constructor(infrastructureRepository, logger) {
        this.infrastructureRepository = infrastructureRepository;
        this.logger = logger;
    }
    /** Suppression logique d'une infrastructure. */
    async deleteInfrastructure(id) {
        try {
            await this.infrastructureRepository.deleteInfrastructure(id);
            this.logger.info(`Infrastructure supprimée (logique) : ${id}`);
        }
        catch (error) {
            this.logger.error(`Erreur deleteInfrastructure (service): ${error.message}`);
            throw error;
        }
    }
}
exports.DeleteInfrastructureService = DeleteInfrastructureService;
//# sourceMappingURL=deleteInfrastructure.service.js.map