"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutService = void 0;
class LogoutService {
    constructor(authRepository, logger) {
        this.authRepository = authRepository;
        this.logger = logger;
    }
    /**
     * Invalide la session de l'utilisateur en supprimant son Refresh Token de la base.
     */
    async logout(refreshToken) {
        if (!refreshToken) {
            this.logger.warn('Logout appelé sans Refresh Token.');
            return;
        }
        try {
            // On supprime la session correspondant à ce token.
            // Cela déconnecte cet appareil spécifiquement, sans toucher aux autres sessions potentielles de l'utilisateur.
            await this.authRepository.deleteSession(refreshToken);
            this.logger.info(`Session supprimée avec succès pour le token: ${refreshToken.substring(0, 15)}...`);
        }
        catch (error) {
            this.logger.error(`Erreur lors du logout : ${error}`);
            // On ne jette pas d'erreur, même si la session n'existait pas (idempotence).
        }
    }
}
exports.LogoutService = LogoutService;
//# sourceMappingURL=logout.service.js.map