"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET TERRITORY BY CODE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un territoire par son code unique
 * | (ex: 'BJ-OU-DON').
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTerritoryByCodeService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetTerritoryByCodeService {
    constructor(territoryRepository, logger) {
        this.territoryRepository = territoryRepository;
        this.logger = logger;
    }
    /**
     * Récupère un territoire par son code unique.
     * Inclut les géométries (geometry, centroid, bbox) en GeoJSON.
     * @param code Code unique du territoire (ex: 'BJ-OU-DON')
     */
    async getTerritoryByCode(code) {
        try {
            const territory = await this.territoryRepository.getTerritoryByCode(code);
            if (!territory) {
                throw new appErrors_1.NotFoundError(`Territoire introuvable avec le code : ${code}`);
            }
            this.logger.info(`Territoire récupéré par code : ${territory.name} (${territory.code})`);
            return territory;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getTerritoryByCode (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetTerritoryByCodeService = GetTerritoryByCodeService;
//# sourceMappingURL=getTerritoryByCode.service.js.map