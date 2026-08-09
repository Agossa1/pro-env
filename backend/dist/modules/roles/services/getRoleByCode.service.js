"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET ROLE BY CODE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un rôle par son code unique.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRoleByCodeService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetRoleByCodeService {
    constructor(roleRepository, logger) {
        this.roleRepository = roleRepository;
        this.logger = logger;
    }
    /**
     * Récupère un rôle par son code unique (ex: 'super_admin').
     * @param code Code unique du rôle
     */
    async getRoleByCode(code) {
        try {
            const role = await this.roleRepository.getRoleByCode(code);
            if (!role) {
                throw new appErrors_1.NotFoundError(`Rôle introuvable : ${code}`);
            }
            this.logger.info(`Rôle récupéré par code : ${role.code}`);
            return role;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getRoleByCode (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetRoleByCodeService = GetRoleByCodeService;
//# sourceMappingURL=getRoleByCode.service.js.map