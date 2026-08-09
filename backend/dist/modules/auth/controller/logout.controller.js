"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutController = void 0;
class LogoutController {
    constructor(logoutService) {
        this.logoutService = logoutService;
        this.logout = async (req, res, next) => {
            try {
                // Le Refresh Token à révoquer peut venir du cookie ou du body
                const token = req.cookies?.refreshToken || req.body?.refreshToken;
                if (token) {
                    // Révocation de la session en base de données
                    await this.logoutService.logout(token);
                }
                // Nettoyage du cookie HttpOnly
                res.clearCookie('refreshToken', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                });
                // Réponse standardisée (même si le token était absent, on renvoie 200 par idempotence)
                res.status(200).json({
                    success: true,
                    message: 'Déconnexion réussie.',
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.LogoutController = LogoutController;
//# sourceMappingURL=logout.controller.js.map