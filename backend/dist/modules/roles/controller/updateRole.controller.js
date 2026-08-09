"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRoleController = void 0;
const zod_1 = require("zod");
const role_validations_1 = require("../validations/role.validations");
class UpdateRoleController {
    constructor(updateRoleService) {
        this.updateRoleService = updateRoleService;
        this.updateRole = async (req, res, next) => {
            try {
                const { id } = role_validations_1.IdParamSchema.parse(req.params);
                const payload = role_validations_1.UpdateRoleSchema.parse(req.body);
                const role = await this.updateRoleService.updateRole(id, payload);
                res.status(200).json({
                    success: true,
                    message: 'Rôle mis à jour avec succès.',
                    data: role,
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
exports.UpdateRoleController = UpdateRoleController;
//# sourceMappingURL=updateRole.controller.js.map