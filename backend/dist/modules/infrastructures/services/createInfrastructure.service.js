"use strict";
/*
 * |--------------------------------------------------------------------------
 * | CREATE INFRASTRUCTURE SERVICE
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInfrastructureService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreateInfrastructureService {
    constructor(infrastructureRepository, logger) {
        this.infrastructureRepository = infrastructureRepository;
        this.logger = logger;
    }
    /** Crée une nouvelle infrastructure (équipement physique urbain). */
    async createInfrastructure(payload) {
        try {
            if (!payload.municipalityId || !payload.name || !payload.type) {
                throw new appErrors_1.BadRequestError('Le territoire, le nom et le type sont requis.');
            }
            const created = await this.infrastructureRepository.createInfrastructure(payload);
            this.logger.info(`Infrastructure créée : ${created.name} (${created.type}) dans la territoire ${created.municipalityId}`);
            return created;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur createInfrastructure (service): ${error.message}`);
            throw error;
        }
    }
}
exports.CreateInfrastructureService = CreateInfrastructureService;
//# sourceMappingURL=createInfrastructure.service.js.map