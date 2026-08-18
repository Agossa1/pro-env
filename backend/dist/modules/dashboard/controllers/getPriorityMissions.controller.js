"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPriorityMissionsController = void 0;
class GetPriorityMissionsController {
    constructor(getPriorityMissionsService) {
        this.getPriorityMissionsService = getPriorityMissionsService;
        this.getPriorityMissions = async (req, res, next) => {
            try {
                const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
                const data = await this.getPriorityMissionsService.getPriorityMissions(limit);
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