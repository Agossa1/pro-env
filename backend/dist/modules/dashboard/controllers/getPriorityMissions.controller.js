"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPriorityMissionsController = void 0;
const scopeFilters_helper_1 = require("../../../shared/helpers/scopeFilters.helper");
class GetPriorityMissionsController {
    constructor(getPriorityMissionsService) {
        this.getPriorityMissionsService = getPriorityMissionsService;
        this.getPriorityMissions = async (req, res, next) => {
            try {
                const filters = (0, scopeFilters_helper_1.getScopeFilters)(req);
                const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
                const data = await this.getPriorityMissionsService.getPriorityMissions(limit, filters);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetPriorityMissionsController = GetPriorityMissionsController;
//# sourceMappingURL=getPriorityMissions.controller.js.map