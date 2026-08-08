"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInterventionController = void 0;
const zod_1 = require("zod");
const intervention_validations_1 = require("../validations/intervention.validations");
class UpdateInterventionController {
    constructor(updateInterventionService) {
        this.updateInterventionService = updateInterventionService;
        this.updateIntervention = async (req, res, next) => {
            try {
                const { id } = intervention_validations_1.IdParamSchema.parse(req.params);
                const payload = intervention_validations_1.UpdateInterventionSchema.parse(req.body);
                const intervention = await this.updateInterventionService.updateIntervention(id, payload);
                res.status(200).json({
                    success: true,
                    message: 'Intervention mise à jour avec succès.',
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
exports.UpdateInterventionController = UpdateInterventionController;
//# sourceMappingURL=updateIntervention.controller.js.map