"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInfrastructureController = void 0;
const zod_1 = require("zod");
const infrastructure_validations_1 = require("../validations/infrastructure.validations");
class CreateInfrastructureController {
    constructor(createInfrastructureService) {
        this.createInfrastructureService = createInfrastructureService;
        this.createInfrastructure = async (req, res, next) => {
            try {
                const payload = infrastructure_validations_1.CreateInfrastructureSchema.parse(req.body);
                const infrastructure = await this.createInfrastructureService.createInfrastructure(payload);
                res.status(201).json({
                    success: true,
                    message: 'Infrastructure créée avec succès.',
                    data: infrastructure,
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({ success: false, message: 'Erreur de validation des données.', errors: error.issues });
                    return;
                }
                next(error);
            }
        };
    }
}
exports.CreateInfrastructureController = CreateInfrastructureController;
//# sourceMappingURL=createInfrastructure.controller.js.map