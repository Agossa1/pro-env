"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateInterventionController = void 0;
const zod_1 = require("zod");
const intervention_validations_1 = require("../validations/intervention.validations");
class CreateInterventionController {
    constructor(createInterventionService) {
        this.createInterventionService = createInterventionService;
        this.createIntervention = async (req, res, next) => {
            try {
                const payload = intervention_validations_1.CreateInterventionSchema.parse(req.body);
                const intervention = await this.createInterventionService.createIntervention(payload);
                res.status(201).json({
                    success: true,
                    message: 'Intervention créée avec succès.',
                    data: intervention,
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
exports.CreateInterventionController = CreateInterventionController;
//# sourceMappingURL=createIntervention.controller.js.map