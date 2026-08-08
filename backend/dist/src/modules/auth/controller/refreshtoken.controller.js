"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenController = void 0;
const zod_1 = require("zod");
const appErrors_1 = require("@/shared/errors/appErrors");
class RefreshTokenController {
    refreshTokenService;
    constructor(refreshTokenService) {
        this.refreshTokenService = refreshTokenService;
    }
    refresh = async (req, res, next) => {
        try {
            // Le Refresh Token peut venir soit d'un Cookie HttpOnly (recommandé), soit du corps de la requête
            const token = req.cookies?.refreshToken || req.body?.refreshToken;
            if (!token) {
                throw new appErrors_1.UnauthorizedError('Refresh Token manquant.');
            }
            // Appel au service métier (qui vérifie la validité cryptographique et en base de données)
            const result = await this.refreshTokenService.refresh(token);
            // Sécurité : Remplacer l'ancien cookie par le nouveau (Rotation du Refresh Token)
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            };
            res.cookie('refreshToken', result.refreshToken, cookieOptions);
            // Réponse standardisée
            res.status(200).json({
                success: true,
                message: 'Token rafraîchi avec succès.',
                data: {
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
exports.RefreshTokenController = RefreshTokenController;
//# sourceMappingURL=refreshtoken.controller.js.map