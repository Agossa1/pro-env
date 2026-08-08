"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeletePermissionController = void 0;
const zod_1 = require("zod");
const permission_validations_1 = require("../validations/permission.validations");
class DeletePermissionController {
    constructor(deletePermissionService) {
        this.deletePermissionService = deletePermissionService;
        this.deletePermission = async (req, res, next) => {
            try {
                const { id } = permission_validations_1.IdParamSchema.parse(req.params);
                await this.deletePermissionService.deletePermission(id);
                res.status(200).json({
                    success: true,
                    message: 'Permission supprimée avec succès.',
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
exports.DeletePermissionController = DeletePermissionController;
//# sourceMappingURL=deletePermission.controller.js.map