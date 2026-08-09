"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPermissionsController = void 0;
class GetPermissionsController {
    constructor(getPermissionsService) {
        this.getPermissionsService = getPermissionsService;
        this.getPermissions = async (req, res, next) => {
            try {
                const query = {
                    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                };
                const result = await this.getPermissionsService.getPermissions(query);
                res.status(200).json({
                    success: true,
                    message: 'Liste des permissions récupérée avec succès.',
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
exports.GetPermissionsController = GetPermissionsController;
//# sourceMappingURL=getPermissions.controller.js.map