"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetActivityChartController = void 0;
class GetActivityChartController {
    constructor(getActivityChartService) {
        this.getActivityChartService = getActivityChartService;
        this.getActivityChart = async (req, res, next) => {
            try {
                const period = req.query.period || 'monthly';
                const data = await this.getActivityChartService.getActivityChart(period);
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