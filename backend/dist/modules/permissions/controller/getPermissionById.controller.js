"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPermissionByIdController = void 0;
const zod_1 = require("zod");
const permission_validations_1 = require("../validations/permission.validations");
class GetPermissionByIdController {
    constructor(getPermissionByIdService) {
        this.getPermissionByIdService = getPermissionByIdService;
        this.getPermissionById = async (req, res, next) => {
            try {
                const { id } = permission_validations_1.IdParamSchema.parse(req.params);
                const permission = await this.getPermissionByIdService.getPermissionById(id);
                res.status(200).json({
                    success: true,
                    message: 'Permission récupérée avec succès.',
                    data: permission,
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
exports.GetPermissionByIdController = GetPermissionByIdController;
//# sourceMappingURL=getPermissionById.controller.js.map