"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET ROLES SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des rôles.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRolesService = void 0;
class GetRolesService {
    constructor(roleRepository, logger) {
        this.roleRepository = roleRepository;
        this.logger = logger;
    }
    /**
     * Récupère la liste paginée des rôles.
     * @param query Paramètres de pagination (page, limit)
     */
    async getRoles(query = {}) {
        try {
            const result = await this.roleRepository.getAllRoles(query);
            this.logger.info(`Liste des rôles récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur getRoles (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetRolesService = GetRolesService;
//# sourceMappingURL=getRoles.service.js.map