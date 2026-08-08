"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET PERMISSIONS BY ROLE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération des permissions associées à un rôle.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPermissionsByRoleService = void 0;
class GetPermissionsByRoleService {
    constructor(permissionRepository, logger) {
        this.permissionRepository = permissionRepository;
        this.logger = logger;
    }
    /**
     * Récupère les permissions d'un rôle.
     * @param roleId Identifiant UUID du rôle
     */
    async getPermissionsByRole(roleId) {
        try {
            // Vérifie que le rôle existe via les permissions (retourne [] si inexistant
            // car l'administration ne distingue pas rôle vide vs rôle absent ici)
            const permissions = await this.permissionRepository.getPermissionsByRoleId(roleId);
            this.logger.info(`Permissions du rôle ${roleId} : ${permissions.length}`);
            return permissions;
        }
        catch (error) {
            this.logger.error(`Erreur getPermissionsByRole (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetPermissionsByRoleService = GetPermissionsByRoleService;
//# sourceMappingURL=getPermissionsByRole.service.js.map