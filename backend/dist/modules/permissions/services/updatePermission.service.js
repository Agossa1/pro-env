"use strict";
/*
 * |--------------------------------------------------------------------------
 * | UPDATE PERMISSION SERVICE
 *--------------------------------------------------------------------------
 * | Service métier de mise à jour d'une permission (description).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePermissionService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class UpdatePermissionService {
    constructor(permissionRepository, logger) {
        this.permissionRepository = permissionRepository;
        this.logger = logger;
    }
    /**
     * Met à jour une permission existante.
     * @param id Identifiant UUID de la permission
     * @param payload Champs modifiables (description)
     */
    async updatePermission(id, payload) {
        try {
            const updated = await this.permissionRepository.updatePermission(id, payload);
            if (!updated) {
                throw new appErrors_1.NotFoundError('Permission introuvable.');
            }
            this.logger.info(`Permission mise à jour : ${updated.module}/${updated.action}`);
            return updated;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur updatePermission (service): ${error.message}`);
            throw error;
        }
    }
}
exports.UpdatePermissionService = UpdatePermissionService;
//# sourceMappingURL=updatePermission.service.js.map