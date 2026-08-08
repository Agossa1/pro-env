"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateReportController = void 0;
const zod_1 = require("zod");
const report_validations_1 = require("../validations/report.validations");
class UpdateReportController {
    constructor(updateReportService) {
        this.updateReportService = updateReportService;
        this.updateReport = async (req, res, next) => {
            try {
                const { id } = report_validations_1.IdParamSchema.parse(req.params);
                const payload = report_validations_1.UpdateReportSchema.parse(req.body);
                const report = await this.updateReportService.updateReport(id, payload);
                res.status(200).json({
                    success: true,
                    message: 'Rapport mis à jour avec succès.',
                    data: report,
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
exports.UpdateReportController = UpdateReportController;
//# sourceMappingURL=updateReport.controller.js.map