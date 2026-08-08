"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportsController = void 0;
class GetReportsController {
    constructor(getReportsService) {
        this.getReportsService = getReportsService;
        this.getReports = async (req, res, next) => {
            try {
                const query = {
                    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                    territoryId: req.query.territoryId,
                    status: req.query.status,
                    issueCategory: req.query.issueCategory,
                };
                const result = await this.getReportsService.getReports(query);
                res.status(200).json({
                    success: true,
                    message: 'Liste des rapports récupérée avec succès.',
                    data: result.data,
                    pagination: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: result.totalPages,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetReportsController = GetReportsController;
//# sourceMappingURL=getReports.controller.js.map