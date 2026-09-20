"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRecentInterventionsController = void 0;
const scopeFilters_helper_1 = require("../../../shared/helpers/scopeFilters.helper");
class GetRecentInterventionsController {
    constructor(getRecentInterventionsService) {
        this.getRecentInterventionsService = getRecentInterventionsService;
        this.getRecentInterventions = async (req, res, next) => {
            try {
                const user = req.user;
                const filters = (0, scopeFilters_helper_1.getScopeFilters)(req);
                const limit = req.query.limit ? parseInt(req.query.limit, 10) : 6;
                const orgId = user.roleCode === 'societe' ? (user.organizationId ?? undefined) : undefined;
                const data = await this.getRecentInterventionsService.getRecentInterventions(limit, orgId, filters);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetRecentInterventionsController = GetRecentInterventionsController;
//# sourceMappingURL=getRecentInterventions.controller.js.map