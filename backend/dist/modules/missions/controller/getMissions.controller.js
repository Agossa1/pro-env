"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMissionsController = void 0;
class GetMissionsController {
    constructor(getMissionsService) {
        this.getMissionsService = getMissionsService;
        this.getMissions = async (req, res, next) => {
            try {
                const query = {
                    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                    territoryId: req.query.territoryId,
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