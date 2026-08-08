"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRoleByCodeController = void 0;
const zod_1 = require("zod");
const role_validations_1 = require("../validations/role.validations");
class GetRoleByCodeController {
    constructor(getRoleByCodeService) {
        this.getRoleByCodeService = getRoleByCodeService;
        this.getRoleByCode = async (req, res, next) => {
            try {
                const { code } = role_validations_1.CodeParamSchema.parse(req.params);
                const role = await this.getRoleByCodeService.getRoleByCode(code);
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
exports.GetRoleByCodeController = GetRoleByCodeController;
//# sourceMappingURL=getRoleByCode.controller.js.map