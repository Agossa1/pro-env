"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPermissionsByRoleController = void 0;
const zod_1 = require("zod");
const permission_validations_1 = require("../validations/permission.validations");
class GetPermissionsByRoleController {
    constructor(getPermissionsByRoleService) {
        this.getPermissionsByRoleService = getPermissionsByRoleService;
        this.getPermissionsByRole = async (req, res, next) => {
            try {
                const { roleId } = permission_validations_1.RoleIdParamSchema.parse(req.params);
                const permissions = await this.getPermissionsByRoleService.getPermissionsByRole(roleId);
                res.status(200).json({
                    success: true,
                    message: 'Permissions du rôle récupérées avec succès.',
                    data: permissions,
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        success: false,
                        message: 'Erreur de validation des paramètres.',
                        errors: error.issues,
                    });
                    return;
                }
                next(error);
            }
        };
    }
}
exports.GetPermissionsByRoleController = GetPermissionsByRoleController;
//# sourceMappingURL=getPermissionsByRole.controller.js.map