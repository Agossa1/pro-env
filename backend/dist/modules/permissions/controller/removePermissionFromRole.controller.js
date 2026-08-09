"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemovePermissionFromRoleController = void 0;
const zod_1 = require("zod");
const permission_validations_1 = require("../validations/permission.validations");
class RemovePermissionFromRoleController {
    constructor(removePermissionFromRoleService) {
        this.removePermissionFromRoleService = removePermissionFromRoleService;
        this.removePermissionFromRole = async (req, res, next) => {
            try {
                const params = {
                    roleId: String(req.params.roleId),
                    permissionId: String(req.params.permissionId),
                };
                const { roleId, permissionId } = permission_validations_1.RoleIdParamSchema
                    .extend({ permissionId: permission_validations_1.PermissionIdParamSchema.shape.permissionId })
                    .parse(params);
                await this.removePermissionFromRoleService.removePermissionFromRole(roleId, permissionId);
                res.status(200).json({
                    success: true,
                    message: 'Permission retirée du rôle avec succès.',
                    data: null,
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
exports.RemovePermissionFromRoleController = RemovePermissionFromRoleController;
//# sourceMappingURL=removePermissionFromRole.controller.js.map