"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTerritoryTypesController = void 0;
class GetTerritoryTypesController {
    constructor(getTerritoryTypesService) {
        this.getTerritoryTypesService = getTerritoryTypesService;
        this.getTerritoryTypes = async (req, res, next) => {
            try {
                const query = {
                    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                };
                const result = await this.getTerritoryTypesService.getTerritoryTypes(query);
                res.status(200).json({
                    success: true,
                    message: 'Liste des types de territoires récupérée avec succès.',
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
exports.GetTerritoryTypesController = GetTerritoryTypesController;
//# sourceMappingURL=getTerritoryTypes.controller.js.map