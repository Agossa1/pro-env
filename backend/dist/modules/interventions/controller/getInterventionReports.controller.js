"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterventionReportsController = void 0;
const zod_1 = require("zod");
const intervention_validations_1 = require("../validations/intervention.validations");
class GetInterventionReportsController {
    constructor(getInterventionReportsService) {
        this.getInterventionReportsService = getInterventionReportsService;
        this.getInterventionReports = async (req, res, next) => {
            try {
                const { id } = intervention_validations_1.IdParamSchema.parse(req.params);
                const reports = await this.getInterventionReportsService.getInterventionReports(id);
                res.status(200).json({
                    success: true,
                    message: 'Rapports d\'intervention récupérés avec succès.',
                    data: reports,
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
exports.GetInterventionReportsController = GetInterventionReportsController;
//# sourceMappingURL=getInterventionReports.controller.js.map