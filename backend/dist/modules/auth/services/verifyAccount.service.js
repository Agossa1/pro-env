"use strict";
/*
|--------------------------------------------------------------------------
| VERIFY ACCOUNT SERVICE
|--------------------------------------------------------------------------
| Gère la vérification du compte utilisateur via le code OTP reçu par email.
| Après vérification réussie, active le compte et envoie l'email de bienvenue.
|--------------------------------------------------------------------------
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyAccountService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const appErrors_1 = require("../../../shared/errors/appErrors");
const auth_enums_1 = require("../types/auth.enums");
const authMailer_1 = require("../../../utils/mailer/authMailer");
class VerifyAccountService {
    constructor(authRepository, logger) {
        this.authRepository = authRepository;
        this.logger = logger;
    }
    /**
     * Vérifie le code OTP soumis par l'utilisateur.
     * Si valide : active le compte + envoie l'email de bienvenue.
     */
    async verify(authId, submittedCode) {
        // 1. Récupérer l'OTP valide (non expiré) en base
        const otpRecord = await this.authRepository.getValidOtp(authId, auth_enums_1.OtpType.EMAIL_VERIFICATION);
        if (!otpRecord) {
            throw new appErrors_1.BadRequestError('Code invalide ou expiré. Veuillez demander un nouveau code.');
        }
        // 2. Comparer le code soumis avec le hash stocké
        const isMatch = await bcryptjs_1.default.compare(submittedCode, otpRecord.codeHash);
        if (!isMatch) {
            throw new appErrors_1.BadRequestError('Code incorrect.');
        }
        // 3. Activer le compte + supprimer le code OTP
        const user = await this.authRepository.findAuthByEmail(authId);
        await this.authRepository.verifyAccountAndDeleteOtp(authId);
        this.logger.info(`Compte ${authId} vérifié et activé.`);
        // 4. Envoyer l'email de bienvenue SIGIE
        if (user) {
            await authMailer_1.authMailer.sendSigieWelcome(user.email, user.fullName, user.roleName ?? 'Utilisateur');
        }
    }
}
exports.VerifyAccountService = VerifyAccountService;
//# sourceMappingURL=verifyAccount.service.js.map