"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignPermissionsToRoleController = void 0;
const zod_1 = require("zod");
const permission_validations_1 = require("../validations/permission.validations");
class AssignPermissionsToRoleController {
    constructor(assignPermissionsToRoleService) {
        this.assignPermissionsToRoleService = assignPermissionsToRoleService;
        this.assignPermissionsToRole = async (req, res, next) => {
            try {
                const { roleId } = permission_validations_1.RoleIdParamSchema.parse(req.params);
                const { permissionIds } = permission_validations_1.AssignPermissionsSchema.parse(req.body);
                const assigned = await this.assignPermissionsToRoleService.assignPermissionsToRole(roleId, permissionIds);
                res.status(200).json({
                    success: true,
                    message: 'Permissions assignées au rôle avec succès.',
                    data: assigned,
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        success: false,
                        message: 'Erreur de validation des données.',
                        errors: error.issues,
                    });
                    return;
                }
                next(error);
            }
        };
    }
}
exports.AssignPermissionsToRoleController = AssignPermissionsToRoleController;
//# sourceMappingURL=assignPermissionsToRole.controller.js.map