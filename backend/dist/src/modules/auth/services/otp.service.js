"use strict";
/*
|--------------------------------------------------------------------------
| OTP SERVICE
|--------------------------------------------------------------------------
| Génère, sauvegarde et vérifie les codes OTP pour la validation de comptes.
|--------------------------------------------------------------------------
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const appErrors_1 = require("@/shared/errors/appErrors");
const auth_enums_1 = require("../types/auth.enums");
const otp_template_1 = require("@/config/mailer/templates/otp.template");
const welcome_template_1 = require("@/config/mailer/templates/welcome.template");
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 15;
class OtpService {
    authRepository;
    mailer;
    logger;
    constructor(authRepository, mailer, logger) {
        this.authRepository = authRepository;
        this.mailer = mailer;
        this.logger = logger;
    }
    /**
     * Génère un code OTP numérique, le hache et l'envoie par email.
     */
    async sendVerificationOtp(authId, fullName, email) {
        const rawCode = this.generateNumericCode(OTP_LENGTH);
        const codeHash = await bcryptjs_1.default.hash(rawCode, 10);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);
        // Sauvegarde en base (ON CONFLICT remplace le précédent)
        await this.authRepository.saveOtp({
            authId,
            codeHash,
            type: auth_enums_1.OtpType.EMAIL_VERIFICATION,
            expiresAt,
        });
        // Envoi de l'email
        const { subject, html } = (0, otp_template_1.otpEmailTemplate)({
            fullName,
            otp: rawCode,
            expiresInMinutes: OTP_EXPIRY_MINUTES,
        });
        await this.mailer.send({ to: email, subject, html });
        this.logger.info(`OTP de vérification envoyé à ${email}`);
    }
    /**
     * Vérifie un code OTP soumis par l'utilisateur.
     * Active le compte si le code est valide.
     */
    async verifyOtp(authId, fullName, email, roleName, submittedCode) {
        const otpRecord = await this.authRepository.getValidOtp(authId, auth_enums_1.OtpType.EMAIL_VERIFICATION);
        if (!otpRecord) {
            throw new appErrors_1.BadRequestError('Code invalide ou expiré. Demandez un nouveau code.');
        }
        const isMatch = await bcryptjs_1.default.compare(submittedCode, otpRecord.codeHash);
        if (!isMatch) {
            throw new appErrors_1.BadRequestError('Code incorrect.');
        }
        // Code valide → activation du compte et suppression du code
        await this.authRepository.verifyAccountAndDeleteOtp(authId);
        this.logger.info(`Compte ${authId} vérifié et activé.`);
        // ✨ Envoi de l'email de bienvenue après activation réussie
        const { subject, html } = (0, welcome_template_1.welcomeEmailTemplate)({
            fullName,
            email,
            roleName,
            loginUrl: process.env.APP_FRONTEND_URL || 'http://localhost:3000/login',
        });
        await this.mailer.send({ to: email, subject, html });
    }
    /**
     * Renvoie un OTP (si l'utilisateur ne l'a pas reçu).
     */
    async resendOtp(email) {
        const user = await this.authRepository.findAuthByEmail(email);
        if (!user) {
            // On ne révèle pas si l'email existe ou non (sécurité)
            return;
        }
        await this.sendVerificationOtp(user.id, user.fullName, email);
    }
    generateNumericCode(length) {
        const bytes = crypto_1.default.randomBytes(length);
        return Array.from(bytes)
            .map(b => b % 10)
            .join('')
            .slice(0, length);
    }
}
exports.OtpService = OtpService;
//# sourceMappingURL=otp.service.js.map