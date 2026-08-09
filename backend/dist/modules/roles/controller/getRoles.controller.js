"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRolesController = void 0;
class GetRolesController {
    constructor(getRolesService) {
        this.getRolesService = getRolesService;
        this.getRoles = async (req, res, next) => {
            try {
                const query = {
                    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                };
                const result = await this.getRolesService.getRoles(query);
                res.status(200).json({
                    success: true,
                    message: 'Liste des rôles récupérée avec succès.',
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
exports.GetRolesController = GetRolesController;
//# sourceMappingURL=getRoles.controller.js.map