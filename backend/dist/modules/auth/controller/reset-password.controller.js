"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordController = void 0;
const auth_validations_1 = require("../validations/auth.validations");
class ResetPasswordController {
    constructor(resetPasswordService) {
        this.resetPasswordService = resetPasswordService;
    }
    async resetPassword(req, res, next) {
        try {
            // 1. Validation Zod
            const { email, code, password } = auth_validations_1.ResetPasswordSchema.parse(req.body);
            // 2. Appel du service
            await this.resetPasswordService.resetPassword(email, code, password);
            // 3. Réponse
            res.status(200).json({
                success: true,
                message: "Votre mot de passe a été réinitialisé avec succès.",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ResetPasswordController = ResetPasswordController;
//# sourceMappingURL=reset-password.controller.js.map