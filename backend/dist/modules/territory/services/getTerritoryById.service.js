"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET TERRITORY BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un territoire par son identifiant UUID.
 * | Retourne la géométrie en GeoJSON (geometry, centroid, bbox).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTerritoryByIdService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetTerritoryByIdService {
    constructor(territoryRepository, logger) {
        this.territoryRepository = territoryRepository;
        this.logger = logger;
    }
    /**
     * Récupère un territoire par son identifiant UUID.
     * Inclut les géométries (geometry, centroid, bbox) en GeoJSON.
     * @param id Identifiant UUID du territoire
     */
    async getTerritoryById(id) {
        try {
            const territory = await this.territoryRepository.getTerritoryById(id);
            if (!territory) {
                throw new appErrors_1.NotFoundError('Territoire introuvable.');
            }
            this.logger.info(`Territoire récupéré par ID : ${territory.name}`);
            return territory;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getTerritoryById (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetTerritoryByIdService = GetTerritoryByIdService;
//# sourceMappingURL=getTerritoryById.service.js.map