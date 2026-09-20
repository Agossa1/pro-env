"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRecentReportsController = void 0;
const scopeFilters_helper_1 = require("../../../shared/helpers/scopeFilters.helper");
class GetRecentReportsController {
    constructor(getRecentReportsService) {
        this.getRecentReportsService = getRecentReportsService;
        this.getRecentReports = async (req, res, next) => {
            try {
                const filters = (0, scopeFilters_helper_1.getScopeFilters)(req);
                const page = req.query.page ? parseInt(req.query.page, 10) : 1;
                const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
                const search = req.query.search || '';
                const status = req.query.status || '';
                const result = await this.getRecentReportsService.getRecentReports(page, limit, search, status, filters);
                res.status(200).json({
                    success: true,
                    data: result.data,
                    pagination: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetRecentReportsController = GetRecentReportsController;
//# sourceMappingURL=getRecentReports.controller.js.map