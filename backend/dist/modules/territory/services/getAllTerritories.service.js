"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET ALL TERRITORIES SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des territoires.
 * | Filtres optionnels : type (territoryTypeId) et parent (parentTerritoryId).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllTerritoriesService = void 0;
class GetAllTerritoriesService {
    constructor(territoryRepository, logger) {
        this.territoryRepository = territoryRepository;
        this.logger = logger;
    }
    /**
     * Récupère la liste paginée des territoires avec filtres optionnels.
     * @param query Paramètres de pagination et filtres (territoryTypeId, parentTerritoryId)
     */
    async getAllTerritories(query = {}) {
        try {
            const result = await this.territoryRepository.getAllTerritories(query);
            this.logger.info(`Liste des territoires récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur getAllTerritories (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetAllTerritoriesService = GetAllTerritoriesService;
//# sourceMappingURL=getAllTerritories.service.js.map