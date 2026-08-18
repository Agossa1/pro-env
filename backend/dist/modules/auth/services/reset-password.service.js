"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordService = void 0;
const auth_enums_1 = require("../types/auth.enums");
const appErrors_1 = require("../../../shared/errors/appErrors");
class ResetPasswordService {
    constructor(authRepository, logger, passwordService) {
        this.authRepository = authRepository;
        this.logger = logger;
        this.passwordService = passwordService;
    }
    async resetPassword(email, submittedCode, newPassword) {
        try {
            // 1. Trouver l'utilisateur
            const user = await this.authRepository.findAuthByEmail(email);
            if (!user) {
                throw new appErrors_1.NotFoundError("Aucun compte n'est associé à cette adresse email.");
            }
            // 2. Vérifier l'existence d'un code valide
            const otpRecord = await this.authRepository.getValidOtp(user.id, auth_enums_1.OtpType.PASSWORD_RESET);
            if (!otpRecord) {
                throw new appErrors_1.BadRequestError("Le code de vérification est invalide ou a expiré.");
            }
            // 3. Comparer le code fourni avec le code hashé en base
            const isMatch = await this.passwordService.comparePassword(submittedCode, otpRecord.codeHash);
            if (!isMatch) {
                throw new appErrors_1.BadRequestError("Le code de vérification est incorrect.");
            }
            // 4. Hacher le nouveau mot de passe
            const passwordHash = await this.passwordService.hashPassword(newPassword);
            // 5. Mettre à jour le mot de passe (et activer le compte au cas où)
            await this.authRepository.activateAccountWithPassword(user.id, passwordHash);
            this.logger.info(`Mot de passe réinitialisé avec succès pour ${email}`);
        }
        catch (error) {
            this.logger.error(`Erreur resetPassword: ${error.message}`);
            throw error;
        }
    }
}
exports.ResetPasswordService = ResetPasswordService;
//# sourceMappingURL=reset-password.service.js.map