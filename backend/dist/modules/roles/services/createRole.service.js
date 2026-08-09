"use strict";
/*
 * |--------------------------------------------------------------------------
 * | CREATE ROLE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'un rôle.
 * | Vérifie l'unicité du code avant insertion.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRoleService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreateRoleService {
    constructor(roleRepository, logger) {
        this.roleRepository = roleRepository;
        this.logger = logger;
    }
    /**
     * Crée un nouveau rôle après validation de l'unicité du code.
     * @param payload Données du rôle (code, name, ...)
     */
    async createRole(payload) {
        try {
            const code = payload.code.trim().toLowerCase();
            if (!code) {
                throw new appErrors_1.BadRequestError('Le code du rôle est requis.');
            }
            const existing = await this.roleRepository.getRoleByCode(code);
            if (existing) {
                throw new appErrors_1.BadRequestError(`Un rôle existe déjà avec le code "${code}".`);
            }
            const created = await this.roleRepository.createRole({
                ...payload,
                code,
            });
            this.logger.info(`Rôle créé : ${created.code}`);
            return created;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur createRole (service): ${error.message}`);
            throw error;
        }
    }
}
exports.CreateRoleService = CreateRoleService;
//# sourceMappingURL=createRole.service.js.map