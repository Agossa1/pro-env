"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRoleController = void 0;
const zod_1 = require("zod");
const role_validations_1 = require("../validations/role.validations");
class CreateRoleController {
    constructor(createRoleService) {
        this.createRoleService = createRoleService;
        this.createRole = async (req, res, next) => {
            try {
                const payload = role_validations_1.CreateRoleSchema.parse(req.body);
                const role = await this.createRoleService.createRole(payload);
                res.status(201).json({
                    success: true,
                    message: 'Rôle créé avec succès.',
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
exports.CreateRoleController = CreateRoleController;
//# sourceMappingURL=createRole.controller.js.map