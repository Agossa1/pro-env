"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET ROLE BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un rôle par son identifiant UUID.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRoleByIdService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetRoleByIdService {
    constructor(roleRepository, logger) {
        this.roleRepository = roleRepository;
        this.logger = logger;
    }
    /**
     * Récupère un rôle par son identifiant UUID.
     * @param id Identifiant UUID du rôle
     */
    async getRoleById(id) {
        try {
            const role = await this.roleRepository.getRoleById(id);
            if (!role) {
                throw new appErrors_1.NotFoundError('Rôle introuvable.');
            }
            this.logger.info(`Rôle récupéré par ID : ${role.code}`);
            return role;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getRoleById (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetRoleByIdService = GetRoleByIdService;
//# sourceMappingURL=getRoleById.service.js.map