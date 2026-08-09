"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyAccountController = void 0;
const zod_1 = require("zod");
const auth_validations_1 = require("../validations/auth.validations");
class VerifyAccountController {
    constructor(verifyAccountService) {
        this.verifyAccountService = verifyAccountService;
        this.verify = async (req, res, next) => {
            try {
                // 1. Validation des données d'entrée
                const { email, code, password } = auth_validations_1.VerifySchema.parse(req.body);
                // 2. Appel au service métier — l'email est résolu vers l'identifiant du compte
                await this.verifyAccountService.verify(email, code, password);
                // 3. Réponse standardisée
                res.status(200).json({
                    success: true,
                    message: 'Compte activé avec succès. Vous pouvez maintenant vous connecter.',
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
}
exports.VerifyAccountController = VerifyAccountController;
//# sourceMappingURL=verifyAccount.controller.js.map