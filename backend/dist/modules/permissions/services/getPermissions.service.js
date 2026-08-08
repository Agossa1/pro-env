"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET PERMISSIONS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des permissions.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPermissionsService = void 0;
class GetPermissionsService {
    constructor(permissionRepository, logger) {
        this.permissionRepository = permissionRepository;
        this.logger = logger;
    }
    /**
     * Récupère la liste paginée des permissions.
     * @param query Paramètres de pagination (page, limit)
     */
    async getPermissions(query = {}) {
        try {
            const result = await this.permissionRepository.getAllPermissions(query);
            this.logger.info(`Liste des permissions récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur getPermissions (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetPermissionsService = GetPermissionsService;
//# sourceMappingURL=getPermissions.service.js.map