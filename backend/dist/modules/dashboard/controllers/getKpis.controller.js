"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetKpisController = void 0;
const scopeFilters_helper_1 = require("../../../shared/helpers/scopeFilters.helper");
class GetKpisController {
    constructor(getKpisService) {
        this.getKpisService = getKpisService;
        this.getKpis = async (req, res, next) => {
            try {
                const user = req.user;
                const filters = (0, scopeFilters_helper_1.getScopeFilters)(req);
                const data = await this.getKpisService.getKpis(user.roleCode, user.organizationId ?? undefined, filters);
                res.status(200).json({ success: true, data });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetKpisController = GetKpisController;
//# sourceMappingURL=getKpis.controller.js.map