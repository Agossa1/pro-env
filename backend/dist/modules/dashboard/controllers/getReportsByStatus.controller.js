"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportsByStatusController = void 0;
const scopeFilters_helper_1 = require("../../../shared/helpers/scopeFilters.helper");
class GetReportsByStatusController {
    constructor(getReportsByStatusService) {
        this.getReportsByStatusService = getReportsByStatusService;
        this.getReportsByStatus = async (req, res, next) => {
            try {
                const filters = (0, scopeFilters_helper_1.getScopeFilters)(req);
                const data = await this.getReportsByStatusService.getReportsByStatus(filters);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetReportsByStatusController = GetReportsByStatusController;
//# sourceMappingURL=getReportsByStatus.controller.js.map