"use strict";
/*
 * |--------------------------------------------------------------------------
 * | DELETE TERRITORY TYPE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression d'un type de territoire.
 * | La suppression échoue si des territoires y sont encore rattachés (FK).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTerritoryTypeService = void 0;
class DeleteTerritoryTypeService {
    constructor(territoryRepository, logger) {
        this.territoryRepository = territoryRepository;
        this.logger = logger;
    }
    /**
     * Supprime un type de territoire par son identifiant UUID.
     * @param id Identifiant UUID du type de territoire à supprimer
     */
    async deleteTerritoryType(id) {
        try {
            await this.territoryRepository.deleteTerritoryType(id);
            this.logger.info(`Type de territoire supprimé : ${id}`);
        }
        catch (error) {
            this.logger.error(`Erreur deleteTerritoryType (service): ${error.message}`);
            throw error;
        }
    }
}
exports.DeleteTerritoryTypeService = DeleteTerritoryTypeService;
//# sourceMappingURL=deleteTerritoryType.service.js.map