"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET TERRITORY TYPE BY CODE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un type de territoire par son code
 * | unique (ex: 'DEPARTMENT', 'COMMUNE').
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTerritoryTypeByCodeService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetTerritoryTypeByCodeService {
    constructor(territoryRepository, logger) {
        this.territoryRepository = territoryRepository;
        this.logger = logger;
    }
    /**
     * Récupère un type de territoire par son code.
     * @param code Code unique du type (ex: 'DEPARTMENT')
     */
    async getTerritoryTypeByCode(code) {
        try {
            const type = await this.territoryRepository.getTerritoryTypeByCode(code);
            if (!type) {
                throw new appErrors_1.NotFoundError(`Type de territoire introuvable : ${code}`);
            }
            this.logger.info(`Type de territoire récupéré par code : ${type.code}`);
            return type;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getTerritoryTypeByCode (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetTerritoryTypeByCodeService = GetTerritoryTypeByCodeService;
//# sourceMappingURL=getTerritoryTypeByCode.service.js.map