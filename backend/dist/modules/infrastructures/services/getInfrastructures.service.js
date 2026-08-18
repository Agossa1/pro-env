"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET INFRASTRUCTURES SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des infrastructures.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInfrastructuresService = void 0;
class GetInfrastructuresService {
    constructor(infrastructureRepository, logger) {
        this.infrastructureRepository = infrastructureRepository;
        this.logger = logger;
    }
    /** Récupère la liste paginée des infrastructures avec filtres optionnels. */
    async getInfrastructures(query = {}) {
        try {
            const result = await this.infrastructureRepository.getAllInfrastructures(query);
            this.logger.info(`Liste des infrastructures récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur getInfrastructures (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetInfrastructuresService = GetInfrastructuresService;
//# sourceMappingURL=getInfrastructures.service.js.map