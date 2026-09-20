"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInfrastructuresController = void 0;
const scopeFilters_helper_1 = require("../../../shared/helpers/scopeFilters.helper");
class GetInfrastructuresController {
    constructor(getInfrastructuresService) {
        this.getInfrastructuresService = getInfrastructuresService;
        this.getInfrastructures = async (req, res, next) => {
            try {
                const { forcedRegionId, forcedMunicipalityId, forcedDistrictId, forcedNeighborhoodId, forcedUserIdForTeamScopes } = (0, scopeFilters_helper_1.getScopeFilters)(req);
                const query = {
                    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                    regionId: forcedRegionId ?? req.query.regionId,
                    municipalityId: forcedMunicipalityId ?? req.query.municipalityId,
                    districtId: forcedDistrictId ?? req.query.districtId,
                    neighborhoodId: forcedNeighborhoodId ?? req.query.neighborhoodId,
                    type: req.query.type,
                    status: req.query.status,
                    condition: req.query.condition,
                    search: req.query.search,
                    // Pour le technicien : uniquement les infrastructures liées à ses missions
                    memberUserId: forcedUserIdForTeamScopes,
                };
                const result = await this.getInfrastructuresService.getInfrastructures(query);
                res.status(200).json({
                    success: true,
                    message: 'Liste des infrastructures récupérée avec succès.',
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
exports.GetInfrastructuresController = GetInfrastructuresController;
//# sourceMappingURL=getInfrastructures.controller.js.map