"use strict";
/*
 * |--------------------------------------------------------------------------
 * | CREATE PERMISSION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'une permission.
 * | Vérifie l'unicité du couple (module, action) avant insertion.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePermissionService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreatePermissionService {
    constructor(permissionRepository, logger) {
        this.permissionRepository = permissionRepository;
        this.logger = logger;
    }
    /**
     * Crée une nouvelle permission après validation de l'unicité (module, action).
     * @param payload Données de la permission (module, action, description?)
     */
    async createPermission(payload) {
        try {
            const module = String(payload.module).trim().toLowerCase();
            const action = String(payload.action).trim().toLowerCase();
            if (!module || !action) {
                throw new appErrors_1.BadRequestError('Le module et l\'action de la permission sont requis.');
            }
            const existing = await this.permissionRepository.getPermissionByModuleAction(module, action);
            if (existing) {
                throw new appErrors_1.BadRequestError(`Une permission existe déjà pour "${module}" / "${action}".`);
            }
            const created = await this.permissionRepository.createPermission({
                ...payload,
                module,
                action,
            });
            this.logger.info(`Permission créée : ${created.module}/${created.action}`);
            return created;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur createPermission (service): ${error.message}`);
            throw error;
        }
    }
}
exports.CreatePermissionService = CreatePermissionService;
//# sourceMappingURL=createPermission.service.js.map