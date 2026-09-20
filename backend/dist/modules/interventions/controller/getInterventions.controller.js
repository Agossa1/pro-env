"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterventionsController = void 0;
const scopeFilters_helper_1 = require("../../../shared/helpers/scopeFilters.helper");
class GetInterventionsController {
    constructor(getInterventionsService) {
        this.getInterventionsService = getInterventionsService;
        this.getInterventions = async (req, res, next) => {
            try {
                const { forcedRegionId, forcedMunicipalityId, forcedDistrictId, forcedNeighborhoodId, forcedCreatedBy, forcedUserIdForTeamScopes } = (0, scopeFilters_helper_1.getScopeFilters)(req);
                const query = {
                    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                    missionId: req.query.missionId,
                    teamId: req.query.teamId,
                    status: req.query.status,
                    regionId: forcedRegionId ?? req.query.regionId,
                    municipalityId: forcedMunicipalityId ?? req.query.municipalityId,
                    districtId: forcedDistrictId ?? req.query.districtId,
                    neighborhoodId: forcedNeighborhoodId ?? req.query.neighborhoodId,
                    createdBy: forcedCreatedBy ?? req.query.createdBy,
                    // Pour le technicien : uniquement les interventions où il est membre d'équipe assignée
                    memberUserId: forcedUserIdForTeamScopes,
                };
                const result = await this.getInterventionsService.getInterventions(query);
                res.status(200).json({
                    success: true,
                    message: 'Liste des interventions récupérée avec succès.',
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
exports.GetInterventionsController = GetInterventionsController;
//# sourceMappingURL=getInterventions.controller.js.map