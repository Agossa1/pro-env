"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportStatusHistoryController = void 0;
const zod_1 = require("zod");
const report_validations_1 = require("../validations/report.validations");
class GetReportStatusHistoryController {
    constructor(getReportStatusHistoryService) {
        this.getReportStatusHistoryService = getReportStatusHistoryService;
        this.getReportStatusHistory = async (req, res, next) => {
            try {
                const { id } = report_validations_1.IdParamSchema.parse(req.params);
                const history = await this.getReportStatusHistoryService.getReportStatusHistory(id);
                res.status(200).json({
                    success: true,
                    message: 'Historique des statuts récupéré avec succès.',
                    data: history,
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
exports.GetReportStatusHistoryController = GetReportStatusHistoryController;
//# sourceMappingURL=getReportStatusHistory.controller.js.map