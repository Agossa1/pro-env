"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserController = void 0;
class UpdateUserController {
    constructor(updateUserService) {
        this.updateUserService = updateUserService;
        this.update = this.update.bind(this);
    }
    async update(req, res, next) {
        try {
            const id = req.params.id;
            const { fullName, phone, roleId, regionId, municipalityId, districtId, neighborhoodId } = req.body;
            await this.updateUserService.execute(id, { fullName, phone, roleId, regionId, municipalityId, districtId, neighborhoodId });
            res.status(200).json({
                success: true,
                message: 'Utilisateur mis à jour avec succès.',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UpdateUserController = UpdateUserController;
//# sourceMappingURL=updateUser.controller.js.map