"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllTerritoriesController = void 0;
const scopeFilters_helper_1 = require("../../../shared/helpers/scopeFilters.helper");
class GetAllTerritoriesController {
    constructor(getAllTerritoriesService) {
        this.getAllTerritoriesService = getAllTerritoriesService;
        this.getAllTerritories = async (req, res, next) => {
            try {
                const { forcedRegionId, forcedMunicipalityId, forcedDistrictId, forcedNeighborhoodId } = (0, scopeFilters_helper_1.getScopeFilters)(req);
                const query = {
                    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                    territoryTypeId: req.query.territoryTypeId,
                    territoryTypeCode: req.query.territoryTypeCode,
                    parentTerritoryId: req.query.parentTerritoryId,
                    search: req.query.search,
                    filters: { forcedRegionId, forcedMunicipalityId, forcedDistrictId, forcedNeighborhoodId },
                };
                const result = await this.getAllTerritoriesService.getAllTerritories(query);
                res.status(200).json({
                    success: true,
                    message: 'Liste des territoires récupérée avec succès.',
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
exports.GetAllTerritoriesController = GetAllTerritoriesController;
//# sourceMappingURL=getAllTerritories.controller.js.map