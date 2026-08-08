"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET TERRITORY TYPE BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un type de territoire par son
 * | identifiant UUID.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTerritoryTypeByIdService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetTerritoryTypeByIdService {
    constructor(territoryRepository, logger) {
        this.territoryRepository = territoryRepository;
        this.logger = logger;
    }
    /**
     * Récupère un type de territoire par son identifiant UUID.
     * @param id Identifiant UUID du type de territoire
     */
    async getTerritoryTypeById(id) {
        try {
            const type = await this.territoryRepository.getTerritoryTypeById(id);
            if (!type) {
                throw new appErrors_1.NotFoundError('Type de territoire introuvable.');
            }
            this.logger.info(`Type de territoire récupéré par ID : ${type.code}`);
            return type;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getTerritoryTypeById (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetTerritoryTypeByIdService = GetTerritoryTypeByIdService;
//# sourceMappingURL=getTerritoryTypeById.service.js.map