"use strict";
/*
 * |--------------------------------------------------------------------------
 * | UPDATE INFRASTRUCTURE SERVICE
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInfrastructureService = void 0;
class UpdateInfrastructureService {
    constructor(infrastructureRepository, logger) {
        this.infrastructureRepository = infrastructureRepository;
        this.logger = logger;
    }
    /** Met à jour une infrastructure. */
    async updateInfrastructure(id, payload) {
        try {
            const updated = await this.infrastructureRepository.updateInfrastructure(id, payload);
            this.logger.info(`Infrastructure mise à jour : ${id}`);
            return updated;
        }
        catch (error) {
            this.logger.error(`Erreur updateInfrastructure (service): ${error.message}`);
            throw error;
        }
    }
}
exports.UpdateInfrastructureService = UpdateInfrastructureService;
//# sourceMappingURL=updateInfrastructure.service.js.map