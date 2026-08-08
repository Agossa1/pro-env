"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReportController = void 0;
const zod_1 = require("zod");
const report_validations_1 = require("../validations/report.validations");
class CreateReportController {
    constructor(createReportService) {
        this.createReportService = createReportService;
        this.createReport = async (req, res, next) => {
            try {
                const payload = report_validations_1.CreateReportSchema.parse(req.body);
                // Injecte l'utilisateur connecté comme créateur du rapport
                const creator = {
                    userId: req.user?.userId ?? undefined,
                };
                const report = await this.createReportService.createReport(payload, creator);
                res.status(201).json({
                    success: true,
                    message: 'Rapport créé avec succès.',
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
exports.CreateReportController = CreateReportController;
//# sourceMappingURL=createReport.controller.js.map