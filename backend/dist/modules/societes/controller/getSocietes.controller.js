"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSocietesController = void 0;
const scopeFilters_helper_1 = require("../../../shared/helpers/scopeFilters.helper");
class GetSocietesController {
    constructor(getSocietesService) {
        this.getSocietesService = getSocietesService;
        this.getSocietes = async (req, res, next) => {
            try {
                const filters = (0, scopeFilters_helper_1.getScopeFilters)(req);
                const query = {
                    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                    type: req.query.type,
                    filters,
                };
                const result = await this.getSocietesService.getSocietes(query);
                res.status(200).json({
                    success: true,
                    message: 'Liste des sociétés récupérée avec succès.',
                    data: result.data,
                    pagination: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: result.totalPages,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetSocietesController = GetSocietesController;
//# sourceMappingURL=getSocietes.controller.js.map