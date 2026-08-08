"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTeamsController = void 0;
class GetTeamsController {
    constructor(getTeamsService) {
        this.getTeamsService = getTeamsService;
        this.getTeams = async (req, res, next) => {
            try {
                const query = {
                    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                    teamType: req.query.teamType,
                    organizationId: req.query.organizationId,
                };
                const result = await this.getTeamsService.getTeams(query);
                res.status(200).json({
                    success: true,
                    message: 'Liste des équipes récupérée avec succès.',
                    data: result.data,
                    pagination: { total: result.total, page: result.page, limit: result.limit, totalPages: result.totalPages },
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetTeamsController = GetTeamsController;
//# sourceMappingURL=getTeams.controller.js.map