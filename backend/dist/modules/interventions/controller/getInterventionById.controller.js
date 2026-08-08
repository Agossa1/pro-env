"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterventionByIdController = void 0;
const zod_1 = require("zod");
const intervention_validations_1 = require("../validations/intervention.validations");
class GetInterventionByIdController {
    constructor(getInterventionByIdService) {
        this.getInterventionByIdService = getInterventionByIdService;
        this.getInterventionById = async (req, res, next) => {
            try {
                const { id } = intervention_validations_1.IdParamSchema.parse(req.params);
                const intervention = await this.getInterventionByIdService.getInterventionById(id);
                res.status(200).json({
                    success: true,
                    message: 'Intervention récupérée avec succès.',
                    data: intervention,
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
exports.GetInterventionByIdController = GetInterventionByIdController;
//# sourceMappingURL=getInterventionById.controller.js.map