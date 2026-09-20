"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportsByCategoryController = void 0;
const scopeFilters_helper_1 = require("../../../shared/helpers/scopeFilters.helper");
class GetReportsByCategoryController {
    constructor(getReportsByCategoryService) {
        this.getReportsByCategoryService = getReportsByCategoryService;
        this.getReportsByCategory = async (req, res, next) => {
            try {
                const filters = (0, scopeFilters_helper_1.getScopeFilters)(req);
                const data = await this.getReportsByCategoryService.getReportsByCategory(filters);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetReportsByCategoryController = GetReportsByCategoryController;
//# sourceMappingURL=getReportsByCategory.controller.js.map