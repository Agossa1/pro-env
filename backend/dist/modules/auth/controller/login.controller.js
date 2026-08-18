"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginController = void 0;
const zod_1 = require("zod");
const auth_validations_1 = require("../validations/auth.validations");
class LoginController {
    constructor(loginService) {
        this.loginService = loginService;
        this.login = async (req, res, next) => {
            try {
                // 1. Validation des données d'entrée
                const { email, password } = auth_validations_1.LoginSchema.parse(req.body);
                // 2. Appel au service métier
                const result = await this.loginService.login(email, password);
                // 3. Sécurité : Placer le Refresh Token dans un cookie HttpOnly sécurisé
                // 7 jours en millisecondes
                const isProduction = process.env.NODE_ENV === 'production';
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? 'none' : 'lax',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
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
}
exports.LoginController = LoginController;
//# sourceMappingURL=login.controller.js.map