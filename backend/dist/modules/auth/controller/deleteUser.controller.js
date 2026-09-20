"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserController = void 0;
class DeleteUserController {
    constructor(deleteUserService) {
        this.deleteUserService = deleteUserService;
        this.delete = this.delete.bind(this);
    }
    async delete(req, res, next) {
        try {
            const id = req.params.id;
            await this.deleteUserService.execute(id);
            res.status(200).json({
                success: true,
                message: 'Utilisateur supprimé avec succès.',
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DeleteUserController = DeleteUserController;
//# sourceMappingURL=deleteUser.controller.js.map