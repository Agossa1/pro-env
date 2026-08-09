"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFieldReportController = void 0;
const zod_1 = require("zod");
const intervention_validations_1 = require("../validations/intervention.validations");
class CreateFieldReportController {
    constructor(createFieldReportService) {
        this.createFieldReportService = createFieldReportService;
        this.createFieldReport = async (req, res, next) => {
            try {
                const { id } = intervention_validations_1.IdParamSchema.parse(req.params);
                const body = intervention_validations_1.CreateFieldReportSchema.parse(req.body);
                const payload = {
                    ...body,
                    interventionId: id,
                };
                const creator = {
                    userId: req.user?.userId ?? undefined,
                };
                const report = await this.createFieldReportService.createFieldReport(payload, creator);
                res.status(201).json({
                    success: true,
                    message: 'Rapport d\'intervention créé avec succès.',
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
exports.CreateFieldReportController = CreateFieldReportController;
//# sourceMappingURL=createFieldReport.controller.js.map