"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendCodeController = void 0;
const zod_1 = require("zod");
const auth_validations_1 = require("../validations/auth.validations");
class ResendCodeController {
    resendCodeService;
    constructor(resendCodeService) {
        this.resendCodeService = resendCodeService;
    }
    resend = async (req, res, next) => {
        try {
            // 1. Validation des données d'entrée
            const { email } = auth_validations_1.ResendCodeSchema.parse(req.body);
            // 2. Appel au service métier
            await this.resendCodeService.resend(email);
            // 3. Réponse standardisée
            res.status(200).json({
                success: true,
                message: 'Un nouveau code de vérification a été envoyé à votre adresse email.',
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    message: 'Erreur de validation des données.',
                    errors: error.issues
                });
                return;
            }
            next(error);
        }
    };
}
exports.ResendCodeController = ResendCodeController;
//# sourceMappingURL=resend-code.controller.js.map