"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginController = void 0;
const zod_1 = require("zod");
const auth_validations_1 = require("../validations/auth.validations");
class LoginController {
    loginService;
    constructor(loginService) {
        this.loginService = loginService;
    }
    login = async (req, res, next) => {
        try {
            // 1. Validation des données d'entrée
            const { email, password } = auth_validations_1.LoginSchema.parse(req.body);
            // 2. Appel au service métier
            const result = await this.loginService.login(email, password);
            // 3. Sécurité : Placer le Refresh Token dans un cookie HttpOnly sécurisé
            // 7 jours en millisecondes
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            };
            res.cookie('refreshToken', result.refreshToken, cookieOptions);
            // 4. Réponse standardisée (on ne retourne que l'Access Token dans le JSON)
            res.status(200).json({
                success: true,
                message: 'Connexion réussie.',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                }
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
exports.LoginController = LoginController;
//# sourceMappingURL=login.controller.js.map