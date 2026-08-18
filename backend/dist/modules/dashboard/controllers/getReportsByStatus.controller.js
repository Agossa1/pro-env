"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportsByStatusController = void 0;
class GetReportsByStatusController {
    constructor(getReportsByStatusService) {
        this.getReportsByStatusService = getReportsByStatusService;
        this.getReportsByStatus = async (req, res, next) => {
            try {
                const data = await this.getReportsByStatusService.getReportsByStatus();
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