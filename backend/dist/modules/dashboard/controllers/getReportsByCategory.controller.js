"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportsByCategoryController = void 0;
class GetReportsByCategoryController {
    constructor(getReportsByCategoryService) {
        this.getReportsByCategoryService = getReportsByCategoryService;
        this.getReportsByCategory = async (req, res, next) => {
            try {
                const data = await this.getReportsByCategoryService.getReportsByCategory();
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