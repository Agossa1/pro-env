"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordService = void 0;
const auth_enums_1 = require("../types/auth.enums");
const authMailer_1 = require("../../../utils/mailer/authMailer");
const appErrors_1 = require("../../../shared/errors/appErrors");
class ForgotPasswordService {
    constructor(authRepository, logger, passwordService) {
        this.authRepository = authRepository;
        this.logger = logger;
        this.passwordService = passwordService;
    }
    async forgotPassword(email) {
        try {
            // 1. Chercher l'utilisateur
            const user = await this.authRepository.findAuthByEmail(email);
            if (!user) {
                throw new appErrors_1.NotFoundError("Aucun compte n'est associé à cette adresse email.");
            }
            // 2. Générer OTP (6 chiffres)
            const rawOtp = this.generateOtp();
            const codeHash = await this.passwordService.hashPassword(rawOtp);
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
            // 3. Sauvegarder OTP
            await this.authRepository.saveOtp({
                authId: user.id,
                codeHash,
                type: auth_enums_1.OtpType.PASSWORD_RESET,
                expiresAt,
            });
            // 4. Générer lien
            const frontendBase = process.env.APP_FRONTEND_URL || 'http://localhost:5173';
            const resetLink = `${frontendBase}/reset-password?email=${encodeURIComponent(email)}`;
            // 5. Envoyer Email
            await authMailer_1.authMailer.sendSigiePasswordReset(email, user.fullName, rawOtp, resetLink);
            this.logger.info(`Mot de passe oublié initié pour ${email}`);
        }
        catch (error) {
            this.logger.error(`Erreur forgotPassword: ${error.message}`);
            throw error;
        }
    }
    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
exports.ForgotPasswordService = ForgotPasswordService;
//# sourceMappingURL=forgot-password.service.js.map