"use strict";
/*
 * |--------------------------------------------------------------------------
 * | ASSIGN PERMISSIONS TO ROLE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier d'assignation de plusieurs permissions à un rôle.
 * | Détecte les doublons avant l'assignation.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignPermissionsToRoleService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class AssignPermissionsToRoleService {
    constructor(permissionRepository, logger) {
        this.permissionRepository = permissionRepository;
        this.logger = logger;
    }
    /**
     * Assigne plusieurs permissions à un rôle.
     * @param roleId Identifiant UUID du rôle
     * @param permissionIds Liste des UUID de permissions
     */
    async assignPermissionsToRole(roleId, permissionIds) {
        try {
            if (!permissionIds || permissionIds.length === 0) {
                throw new appErrors_1.BadRequestError('Au moins une permission doit être assignée.');
            }
            const uniqueIds = [...new Set(permissionIds)];
            const assigned = await this.permissionRepository.assignPermissionsToRole(roleId, uniqueIds);
            this.logger.info(`${assigned.length}/${uniqueIds.length} permission(s) assignée(s) au rôle ${roleId}`);
            return assigned;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur assignPermissionsToRole (service): ${error.message}`);
            throw error;
        }
    }
}
exports.AssignPermissionsToRoleService = AssignPermissionsToRoleService;
//# sourceMappingURL=assignPermissionsToRole.service.js.map