"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRolesWithPermissionsController = void 0;
class GetRolesWithPermissionsController {
    constructor(getRolesWithPermissionsService) {
        this.getRolesWithPermissionsService = getRolesWithPermissionsService;
        this.getRolesWithPermissions = async (req, res, next) => {
            try {
                const roles = await this.getRolesWithPermissionsService.getRolesWithPermissions();
                res.status(200).json({
                    success: true,
                    message: 'Rôles avec permissions récupérés avec succès.',
                    data: roles,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetRolesWithPermissionsController = GetRolesWithPermissionsController;
//# sourceMappingURL=getRolesWithPermissions.controller.js.map