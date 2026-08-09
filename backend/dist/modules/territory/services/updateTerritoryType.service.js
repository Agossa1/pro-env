"use strict";
/*
 * |--------------------------------------------------------------------------
 * | UPDATE TERRITORY TYPE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de mise à jour d'un type de territoire.
 * | Délégue la persistance au repository après validation.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTerritoryTypeService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class UpdateTerritoryTypeService {
    constructor(territoryRepository, logger) {
        this.territoryRepository = territoryRepository;
        this.logger = logger;
    }
    /**
     * Met à jour un type de territoire existant.
     * @param id Identifiant UUID du type de territoire
     * @param payload Champs modifiables (name, hierarchyLevel)
     */
    async updateTerritoryType(id, payload) {
        try {
            const updated = await this.territoryRepository.updateTerritoryType(id, payload);
            if (!updated) {
                throw new appErrors_1.NotFoundError('Type de territoire introuvable.');
            }
            this.logger.info(`Type de territoire mis à jour : ${updated.code}`);
            return updated;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur updateTerritoryType (service): ${error.message}`);
            throw error;
        }
    }
}
exports.UpdateTerritoryTypeService = UpdateTerritoryTypeService;
//# sourceMappingURL=updateTerritoryType.service.js.map