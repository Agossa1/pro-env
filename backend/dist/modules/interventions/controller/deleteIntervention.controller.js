"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteInterventionController = void 0;
const zod_1 = require("zod");
const intervention_validations_1 = require("../validations/intervention.validations");
class DeleteInterventionController {
    constructor(deleteInterventionService) {
        this.deleteInterventionService = deleteInterventionService;
        this.deleteIntervention = async (req, res, next) => {
            try {
                const { id } = intervention_validations_1.IdParamSchema.parse(req.params);
                await this.deleteInterventionService.deleteIntervention(id);
                res.status(200).json({
                    success: true,
                    message: 'Intervention supprimée avec succès.',
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
exports.DeleteInterventionController = DeleteInterventionController;
//# sourceMappingURL=deleteIntervention.controller.js.map