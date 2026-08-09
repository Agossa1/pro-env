"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET PERMISSION BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'une permission par son identifiant UUID.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPermissionByIdService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetPermissionByIdService {
    constructor(permissionRepository, logger) {
        this.permissionRepository = permissionRepository;
        this.logger = logger;
    }
    /**
     * Récupère une permission par son identifiant UUID.
     * @param id Identifiant UUID de la permission
     */
    async getPermissionById(id) {
        try {
            const permission = await this.permissionRepository.getPermissionById(id);
            if (!permission) {
                throw new appErrors_1.NotFoundError('Permission introuvable.');
            }
            this.logger.info(`Permission récupérée par ID : ${permission.module}/${permission.action}`);
            return permission;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getPermissionById (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetPermissionByIdService = GetPermissionByIdService;
//# sourceMappingURL=getPermissionById.service.js.map