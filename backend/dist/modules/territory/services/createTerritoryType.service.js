"use strict";
/*
 * |--------------------------------------------------------------------------
 * | CREATE TERRITORY TYPE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'un type de territoire.
 * | Vérifie l'unicité du code avant insertion.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTerritoryTypeService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreateTerritoryTypeService {
    constructor(territoryRepository, logger) {
        this.territoryRepository = territoryRepository;
        this.logger = logger;
    }
    /**
     * Crée un nouveau type de territoire après validation de l'unicité du code.
     * @param payload Données du type de territoire (code, name, hierarchyLevel)
     */
    async createTerritoryType(payload) {
        try {
            const code = payload.code.trim().toUpperCase();
            if (!code) {
                throw new appErrors_1.BadRequestError('Le code du type de territoire est requis.');
            }
            const existing = await this.territoryRepository.getTerritoryTypeByCode(code);
            if (existing) {
                throw new appErrors_1.BadRequestError(`Un type de territoire existe déjà avec le code "${code}".`);
            }
            const created = await this.territoryRepository.createTerritoryType({
                ...payload,
                code,
            });
            this.logger.info(`Type de territoire créé : ${created.code}`);
            return created;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur createTerritoryType (service): ${error.message}`);
            throw error;
        }
    }
}
exports.CreateTerritoryTypeService = CreateTerritoryTypeService;
//# sourceMappingURL=createTerritoryType.service.js.map