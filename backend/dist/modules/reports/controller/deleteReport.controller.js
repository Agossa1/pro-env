"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteReportController = void 0;
const zod_1 = require("zod");
const report_validations_1 = require("../validations/report.validations");
class DeleteReportController {
    constructor(deleteReportService) {
        this.deleteReportService = deleteReportService;
        this.deleteReport = async (req, res, next) => {
            try {
                const { id } = report_validations_1.IdParamSchema.parse(req.params);
                await this.deleteReportService.deleteReport(id);
                res.status(200).json({
                    success: true,
                    message: 'Rapport supprimé avec succès.',
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
exports.DeleteReportController = DeleteReportController;
//# sourceMappingURL=deleteReport.controller.js.map