"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET SOCIETES SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des sociétés.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSocietesService = void 0;
class GetSocietesService {
    constructor(societeRepository, logger) {
        this.societeRepository = societeRepository;
        this.logger = logger;
    }
    /**
     * Récupère la liste paginée des sociétés avec filtre optionnel par type.
     * @param query Paramètres de pagination et filtre type
     */
    async getSocietes(query = {}) {
        try {
            const result = await this.societeRepository.getAllSocietes(query);
            this.logger.info(`Liste des sociétés récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur getSocietes (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetSocietesService = GetSocietesService;
//# sourceMappingURL=getSocietes.service.js.map