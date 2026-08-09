"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRoleByIdController = void 0;
const zod_1 = require("zod");
const role_validations_1 = require("../validations/role.validations");
class GetRoleByIdController {
    constructor(getRoleByIdService) {
        this.getRoleByIdService = getRoleByIdService;
        this.getRoleById = async (req, res, next) => {
            try {
                const { id } = role_validations_1.IdParamSchema.parse(req.params);
                const role = await this.getRoleByIdService.getRoleById(id);
                res.status(200).json({
                    success: true,
                    message: 'Rôle récupéré avec succès.',
                    data: role,
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
exports.GetRoleByIdController = GetRoleByIdController;
//# sourceMappingURL=getRoleById.controller.js.map