"use strict";
/*
 * |--------------------------------------------------------------------------
 * | UPDATE ROLE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de mise à jour d'un rôle.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRoleService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class UpdateRoleService {
    constructor(roleRepository, logger) {
        this.roleRepository = roleRepository;
        this.logger = logger;
    }
    /**
     * Met à jour un rôle existant.
     * @param id Identifiant UUID du rôle
     * @param payload Champs modifiables (name, description, tier, ...)
     */
    async updateRole(id, payload) {
        try {
            const updated = await this.roleRepository.updateRole(id, payload);
            if (!updated) {
                throw new appErrors_1.NotFoundError('Rôle introuvable.');
            }
            this.logger.info(`Rôle mis à jour : ${updated.code}`);
            return updated;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur updateRole (service): ${error.message}`);
            throw error;
        }
    }
}
exports.UpdateRoleService = UpdateRoleService;
//# sourceMappingURL=updateRole.service.js.map