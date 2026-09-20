"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMissionsController = void 0;
const scopeFilters_helper_1 = require("../../../shared/helpers/scopeFilters.helper");
class GetMissionsController {
    constructor(getMissionsService) {
        this.getMissionsService = getMissionsService;
        this.getMissions = async (req, res, next) => {
            try {
                const { forcedRegionId, forcedMunicipalityId, forcedDistrictId, forcedNeighborhoodId, forcedCreatedBy, forcedUserIdForTeamScopes } = (0, scopeFilters_helper_1.getScopeFilters)(req);
                const query = {
                    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                    // Les restrictions de rôle écrasent les filtres passés en query string
                    regionId: forcedRegionId ?? req.query.regionId,
                    municipalityId: forcedMunicipalityId ?? req.query.municipalityId,
                    districtId: forcedDistrictId ?? req.query.districtId,
                    neighborhoodId: forcedNeighborhoodId ?? req.query.neighborhoodId,
                    createdBy: forcedCreatedBy ?? req.query.createdBy,
                    // Pour le technicien : uniquement les missions assignées à son équipe
                    memberUserId: forcedUserIdForTeamScopes,
                    status: req.query.status,
                    missionType: req.query.missionType,
                    organizationId: req.query.organizationId,
                };
                const result = await this.getMissionsService.getMissions(query);
                res.status(200).json({
                    success: true,
                    message: 'Liste des missions récupérée avec succès.',
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
exports.GetMissionsController = GetMissionsController;
//# sourceMappingURL=getMissions.controller.js.map