"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordController = void 0;
const auth_validations_1 = require("../validations/auth.validations");
class ForgotPasswordController {
    constructor(forgotPasswordService) {
        this.forgotPasswordService = forgotPasswordService;
    }
    async forgotPassword(req, res, next) {
        try {
            // 1. Validation Zod
            const { email } = auth_validations_1.ForgotPasswordSchema.parse(req.body);
            // 2. Appel du service
            await this.forgotPasswordService.forgotPassword(email);
            // 3. Réponse
            res.status(200).json({
                success: true,
                message: "Un email de réinitialisation de mot de passe a été envoyé (si le compte existe).",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ForgotPasswordController = ForgotPasswordController;
//# sourceMappingURL=forgot-password.controller.js.map