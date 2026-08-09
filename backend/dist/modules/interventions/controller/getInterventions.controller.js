"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterventionsController = void 0;
class GetInterventionsController {
    constructor(getInterventionsService) {
        this.getInterventionsService = getInterventionsService;
        this.getInterventions = async (req, res, next) => {
            try {
                const query = {
                    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                    missionId: req.query.missionId,
                    teamId: req.query.teamId,
                    status: req.query.status,
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