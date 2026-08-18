"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetKpisController = void 0;
class GetKpisController {
    constructor(getKpisService) {
        this.getKpisService = getKpisService;
        this.getKpis = async (req, res, next) => {
            try {
                const user = req.user;
                const data = await this.getKpisService.getKpis(user.roleCode, user.organizationId ?? undefined);
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