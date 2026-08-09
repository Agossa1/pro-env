"use strict";
/*
 * |--------------------------------------------------------------------------
 * | REMOVE PERMISSION FROM ROLE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de retrait d'une permission d'un rôle.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemovePermissionFromRoleService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class RemovePermissionFromRoleService {
    constructor(permissionRepository, logger) {
        this.permissionRepository = permissionRepository;
        this.logger = logger;
    }
    /**
     * Retire une permission d'un rôle.
     * @param roleId Identifiant UUID du rôle
     * @param permissionId Identifiant UUID de la permission
     */
    async removePermissionFromRole(roleId, permissionId) {
        try {
            await this.permissionRepository.removePermissionFromRole(roleId, permissionId);
            this.logger.info(`Permission ${permissionId} retirée du rôle ${roleId}`);
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur removePermissionFromRole (service): ${error.message}`);
            throw error;
        }
    }
}
exports.RemovePermissionFromRoleService = RemovePermissionFromRoleService;
//# sourceMappingURL=removePermissionFromRole.service.js.map