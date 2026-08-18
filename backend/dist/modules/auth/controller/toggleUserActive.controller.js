"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleUserActiveController = void 0;
class ToggleUserActiveController {
    constructor(toggleUserActiveService) {
        this.toggleUserActiveService = toggleUserActiveService;
        this.toggle = this.toggle.bind(this);
    }
    async toggle(req, res, next) {
        try {
            const { id } = req.params;
            const isActive = await this.toggleUserActiveService.execute(id);
            res.status(200).json({
                success: true,
                message: `Utilisateur ${isActive ? 'activé' : 'désactivé'} avec succès.`,
                data: { isActive }
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ToggleUserActiveController = ToggleUserActiveController;
//# sourceMappingURL=toggleUserActive.controller.js.map