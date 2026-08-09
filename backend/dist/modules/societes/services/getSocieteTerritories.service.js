"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET SOCIETE TERRITORIES SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération des territoires de compétence d'une société.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSocieteTerritoriesService = void 0;
class GetSocieteTerritoriesService {
    constructor(societeRepository, logger) {
        this.societeRepository = societeRepository;
        this.logger = logger;
    }
    /**
     * Récupère les territoires de compétence d'une société.
     * @param societeId Identifiant UUID de la société
     */
    async getSocieteTerritories(societeId) {
        try {
            const territories = await this.societeRepository.getSocieteTerritories(societeId);
            this.logger.info(`Territoires de la société ${societeId} récupérés : ${territories.length}`);
            return territories;
        }
        catch (error) {
            this.logger.error(`Erreur getSocieteTerritories (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetSocieteTerritoriesService = GetSocieteTerritoriesService;
//# sourceMappingURL=getSocieteTerritories.service.js.map