"use strict";
/*
 * |--------------------------------------------------------------------------
 * | DELETE ROLE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression d'un rôle.
 * | La suppression est bloquée si des utilisateurs y sont rattachés.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteRoleService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class DeleteRoleService {
    constructor(roleRepository, logger) {
        this.roleRepository = roleRepository;
        this.logger = logger;
    }
    /**
     * Supprime un rôle par son identifiant UUID.
     * @param id Identifiant UUID du rôle à supprimer
     */
    async deleteRole(id) {
        try {
            await this.roleRepository.deleteRole(id);
            this.logger.info(`Rôle supprimé : ${id}`);
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError || error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur deleteRole (service): ${error.message}`);
            throw error;
        }
    }
}
exports.DeleteRoleService = DeleteRoleService;
//# sourceMappingURL=deleteRole.service.js.map