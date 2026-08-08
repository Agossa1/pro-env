"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET ROLES WITH PERMISSIONS SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération de tous les rôles avec leurs
 * | permissions agrégées.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRolesWithPermissionsService = void 0;
class GetRolesWithPermissionsService {
    constructor(permissionRepository, logger) {
        this.permissionRepository = permissionRepository;
        this.logger = logger;
    }
    /**
     * Récupère tous les rôles avec leurs permissions agrégées.
     */
    async getRolesWithPermissions() {
        try {
            const roles = await this.permissionRepository.getRolesWithPermissions();
            this.logger.info(`Rôles avec permissions récupérés : ${roles.length}`);
            return roles;
        }
        catch (error) {
            this.logger.error(`Erreur getRolesWithPermissions (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetRolesWithPermissionsService = GetRolesWithPermissionsService;
//# sourceMappingURL=getRolesWithPermissions.service.js.map