"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportByIdController = void 0;
const zod_1 = require("zod");
const report_validations_1 = require("../validations/report.validations");
class GetReportByIdController {
    constructor(getReportByIdService) {
        this.getReportByIdService = getReportByIdService;
        this.getReportById = async (req, res, next) => {
            try {
                const { id } = report_validations_1.IdParamSchema.parse(req.params);
                const report = await this.getReportByIdService.getReportById(id);
                res.status(200).json({
                    success: true,
                    message: 'Rapport récupéré avec succès.',
                    data: report,
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
exports.GetReportByIdController = GetReportByIdController;
//# sourceMappingURL=getReportById.controller.js.map