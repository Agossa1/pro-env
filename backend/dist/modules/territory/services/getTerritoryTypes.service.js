"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET TERRITORY TYPES SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération de la liste des types de territoires.
 * | Retourne les résultats paginés, triés par niveau hiérarchique.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTerritoryTypesService = void 0;
class GetTerritoryTypesService {
    constructor(territoryRepository, logger) {
        this.territoryRepository = territoryRepository;
        this.logger = logger;
    }
    /**
     * Récupère la liste paginée des types de territoires.
     * @param query Paramètres de pagination (page, limit)
     */
    async getTerritoryTypes(query = {}) {
        try {
            const result = await this.territoryRepository.getAllTerritoryTypes(query);
            this.logger.info(`Liste des types de territoires récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur getTerritoryTypes (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetTerritoryTypesService = GetTerritoryTypesService;
//# sourceMappingURL=getTerritoryTypes.service.js.map