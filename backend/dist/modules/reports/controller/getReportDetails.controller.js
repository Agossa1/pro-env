"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportDetailsController = void 0;
const zod_1 = require("zod");
const report_validations_1 = require("../validations/report.validations");
class GetReportDetailsController {
    constructor(getReportDetailsService) {
        this.getReportDetailsService = getReportDetailsService;
        this.getReportDetails = async (req, res, next) => {
            try {
                const { id } = report_validations_1.IdParamSchema.parse(req.params);
                const details = await this.getReportDetailsService.getReportDetails(id);
                res.status(200).json({
                    success: true,
                    message: 'Détails du rapport récupérés avec succès.',
                    data: details,
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
exports.GetReportDetailsController = GetReportDetailsController;
//# sourceMappingURL=getReportDetails.controller.js.map