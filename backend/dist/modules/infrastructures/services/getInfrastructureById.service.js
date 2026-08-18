"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET INFRASTRUCTURE BY ID SERVICE
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInfrastructureByIdService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetInfrastructureByIdService {
    constructor(infrastructureRepository, logger) {
        this.infrastructureRepository = infrastructureRepository;
        this.logger = logger;
    }
    /** Récupère une infrastructure par son UUID. */
    async getInfrastructureById(id) {
        try {
            const infrastructure = await this.infrastructureRepository.getInfrastructureById(id);
            if (!infrastructure) {
                throw new appErrors_1.NotFoundError('Infrastructure introuvable.');
            }
            this.logger.info(`Infrastructure récupérée : ${id}`);
            return infrastructure;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getInfrastructureById (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetInfrastructureByIdService = GetInfrastructureByIdService;
//# sourceMappingURL=getInfrastructureById.service.js.map