"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePermissionController = void 0;
const zod_1 = require("zod");
const permission_validations_1 = require("../validations/permission.validations");
class UpdatePermissionController {
    constructor(updatePermissionService) {
        this.updatePermissionService = updatePermissionService;
        this.updatePermission = async (req, res, next) => {
            try {
                const { id } = permission_validations_1.IdParamSchema.parse(req.params);
                const payload = permission_validations_1.UpdatePermissionSchema.parse(req.body);
                const permission = await this.updatePermissionService.updatePermission(id, payload);
                res.status(200).json({
                    success: true,
                    message: 'Permission mise à jour avec succès.',
                    data: permission,
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
exports.UpdatePermissionController = UpdatePermissionController;
//# sourceMappingURL=updatePermission.controller.js.map