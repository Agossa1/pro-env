"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetActivityChartController = void 0;
const scopeFilters_helper_1 = require("../../../shared/helpers/scopeFilters.helper");
class GetActivityChartController {
    constructor(getActivityChartService) {
        this.getActivityChartService = getActivityChartService;
        this.getActivityChart = async (req, res, next) => {
            try {
                const filters = (0, scopeFilters_helper_1.getScopeFilters)(req);
                const period = req.query.period || 'monthly';
                const data = await this.getActivityChartService.getActivityChart(period, filters);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetActivityChartController = GetActivityChartController;
//# sourceMappingURL=getActivityChart.controller.js.map