"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteRoleController = void 0;
const zod_1 = require("zod");
const role_validations_1 = require("../validations/role.validations");
class DeleteRoleController {
    constructor(deleteRoleService) {
        this.deleteRoleService = deleteRoleService;
        this.deleteRole = async (req, res, next) => {
            try {
                const { id } = role_validations_1.IdParamSchema.parse(req.params);
                await this.deleteRoleService.deleteRole(id);
                res.status(200).json({
                    success: true,
                    message: 'Rôle supprimé avec succès.',
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
exports.DeleteRoleController = DeleteRoleController;
//# sourceMappingURL=deleteRole.controller.js.map