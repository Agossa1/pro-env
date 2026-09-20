"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersController = void 0;
const scopeFilters_helper_1 = require("../../../shared/helpers/scopeFilters.helper");
class GetUsersController {
    constructor(getUsersService) {
        this.getUsersService = getUsersService;
        this.getUsers = async (req, res, next) => {
            try {
                const filters = (0, scopeFilters_helper_1.getScopeFilters)(req);
                const query = {
                    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                    filters,
                };
                const result = await this.getUsersService.getUsers(query);
                res.status(200).json({
                    success: true,
                    message: 'Liste des utilisateurs récupérée avec succès.',
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
exports.GetUsersController = GetUsersController;
//# sourceMappingURL=getUsers.controller.js.map