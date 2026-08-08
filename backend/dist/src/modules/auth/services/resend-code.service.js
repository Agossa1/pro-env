"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendCodeService = void 0;
const appErrors_1 = require("@/shared/errors/appErrors");
const authMailer_1 = require("@/utils/mailer/authMailer");
const auth_enums_1 = require("../types/auth.enums");
class ResendCodeService {
    authRepository;
    logger;
    passwordService;
    constructor(authRepository, logger, passwordService) {
        this.authRepository = authRepository;
        this.logger = logger;
        this.passwordService = passwordService;
    }
    /**
     * Génère un nouvel OTP et l'envoie à l'utilisateur (s'il n'est pas déjà vérifié).
     */
    async resend(email) {
        // 1. Chercher l'utilisateur
        const user = await this.authRepository.findAuthByEmail(email);
        if (!user) {
            // Pour éviter le user enumeration, on retourne succès (ou on lève une erreur générique)
            // Ici, le comportement standard est souvent de lever une erreur claire pour un resend.
            throw new appErrors_1.BadRequestError('Aucun compte trouvé pour cet email.');
        }
        // 2. Vérifier si le compte est déjà activé/vérifié
        const status = await this.authRepository.findAuthStatus(user.id);
        if (!status) {
            throw new appErrors_1.BadRequestError('Statut du compte introuvable.');
        }
        if (status.isVerified) {
            throw new appErrors_1.BadRequestError('Ce compte est déjà vérifié. Vous pouvez vous connecter.');
        }
        // 3. Générer le nouveau code OTP
        const rawOtp = this.generateOtp();
        const codeHash = await this.passwordService.hashPassword(rawOtp);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        // 4. Sauvegarder (écrase l'ancien code grâce au ON CONFLICT dans le repo)
        await this.authRepository.saveOtp({
            authId: user.id,
            codeHash,
            type: auth_enums_1.OtpType.EMAIL_VERIFICATION,
            expiresAt,
        });
        // 5. Envoyer l'email
        await authMailer_1.authMailer.sendSigieOtp(user.email, user.fullName, rawOtp);
        this.logger.info(`Nouveau code OTP envoyé à l'utilisateur: ${user.email}`);
    }
    generateOtp() {
        return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
    }
}
exports.ResendCodeService = ResendCodeService;
//# sourceMappingURL=resend-code.service.js.map