"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginService = void 0;
const appErrors_1 = require("@/shared/errors/appErrors");
class LoginService {
    authRepository;
    logger;
    passwordService;
    tokenManager;
    constructor(authRepository, logger, passwordService, tokenManager) {
        this.authRepository = authRepository;
        this.logger = logger;
        this.passwordService = passwordService;
        this.tokenManager = tokenManager;
    }
    async login(email, passwordString) {
        // 1. Chercher l'utilisateur avec toutes les infos nécessaires
        const user = await this.authRepository.findAuthForLogin(email);
        if (!user) {
            this.logger.warn(`Tentative de login échouée (email introuvable): ${email}`);
            throw new appErrors_1.UnauthorizedError('Identifiants incorrects.');
        }
        // 2. Vérifier le mot de passe
        const isPasswordValid = await this.passwordService.comparePassword(passwordString, user.passwordHash);
        if (!isPasswordValid) {
            this.logger.warn(`Tentative de login échouée (mot de passe incorrect): ${email}`);
            throw new appErrors_1.UnauthorizedError('Identifiants incorrects.');
        }
        // 3. Vérifier le statut du compte
        if (!user.isVerified) {
            throw new appErrors_1.ForbiddenError('Votre compte n\'est pas encore vérifié. Veuillez valider votre code OTP.');
        }
        if (!user.isActive) {
            throw new appErrors_1.ForbiddenError('Votre compte a été désactivé. Veuillez contacter un administrateur.');
        }
        // 4. Préparer le payload du token
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            roleCode: user.roleCode,
            tier: user.roleTier,
            territoryId: user.territoryId,
            organizationId: user.organizationId
        };
        // 5. Générer les tokens
        const accessToken = this.tokenManager.generateAccessToken(tokenPayload);
        const refreshToken = this.tokenManager.generateRefreshToken({ userId: user.id });
        // 6. Sauvegarder la session (Refresh Token) en base (expiration 7 jours par défaut)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Doit correspondre à la config de tokenManager
        await this.authRepository.createSession({
            authId: user.id,
            token: refreshToken,
            expiresAt
        });
        this.logger.info(`Connexion réussie pour l'utilisateur: ${user.email}`);
        // 7. Nettoyer les données sensibles avant le retour
        delete user.passwordHash;
        return {
            user,
            accessToken,
            refreshToken
        };
    }
}
exports.LoginService = LoginService;
//# sourceMappingURL=login.service.js.map