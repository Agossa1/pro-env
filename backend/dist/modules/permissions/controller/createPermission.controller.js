"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePermissionController = void 0;
const zod_1 = require("zod");
const permission_validations_1 = require("../validations/permission.validations");
class CreatePermissionController {
    constructor(createPermissionService) {
        this.createPermissionService = createPermissionService;
        this.createPermission = async (req, res, next) => {
            try {
                const payload = permission_validations_1.CreatePermissionSchema.parse(req.body);
                const permission = await this.createPermissionService.createPermission(payload);
                res.status(201).json({
                    success: true,
                    message: 'Permission créée avec succès.',
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
exports.CreatePermissionController = CreatePermissionController;
//# sourceMappingURL=createPermission.controller.js.map