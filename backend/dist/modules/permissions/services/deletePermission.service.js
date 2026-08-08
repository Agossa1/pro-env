"use strict";
/*
 * |--------------------------------------------------------------------------
 * | DELETE PERMISSION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression d'une permission.
 * | La suppression propage en CASCADE sur role_permissions (FK).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePermissionService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class DeletePermissionService {
    constructor(permissionRepository, logger) {
        this.permissionRepository = permissionRepository;
        this.logger = logger;
    }
    /**
     * Supprime une permission par son identifiant UUID.
     * @param id Identifiant UUID de la permission à supprimer
     */
    async deletePermission(id) {
        try {
            await this.permissionRepository.deletePermission(id);
            this.logger.info(`Permission supprimée : ${id}`);
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur deletePermission (service): ${error.message}`);
            throw error;
        }
    }
}
exports.DeletePermissionService = DeletePermissionService;
//# sourceMappingURL=deletePermission.service.js.map