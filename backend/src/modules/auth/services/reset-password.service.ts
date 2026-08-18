import type { Logger } from 'winston';
import { AuthRepository } from '../repositories/auth.repositories';
import { OtpType } from '../types/auth.enums';
import { PasswordService } from "../../../config/passwords/passwordServices";
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';

export class ResetPasswordService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logger: Logger,
    private readonly passwordService: PasswordService,
  ) {}

  public async resetPassword(email: string, submittedCode: string, newPassword: string): Promise<void> {
    try {
      // 1. Trouver l'utilisateur
      const user = await this.authRepository.findAuthByEmail(email);
      if (!user) {
        throw new NotFoundError("Aucun compte n'est associé à cette adresse email.");
      }

      // 2. Vérifier l'existence d'un code valide
      const otpRecord = await this.authRepository.getValidOtp(user.id, OtpType.PASSWORD_RESET);
      if (!otpRecord) {
        throw new BadRequestError("Le code de vérification est invalide ou a expiré.");
      }

      // 3. Comparer le code fourni avec le code hashé en base
      const isMatch = await this.passwordService.comparePassword(submittedCode, otpRecord.codeHash);
      if (!isMatch) {
        throw new BadRequestError("Le code de vérification est incorrect.");
      }

      // 4. Hacher le nouveau mot de passe
      const passwordHash = await this.passwordService.hashPassword(newPassword);

      // 5. Mettre à jour le mot de passe (et activer le compte au cas où)
      await this.authRepository.activateAccountWithPassword(user.id, passwordHash);

      this.logger.info(`Mot de passe réinitialisé avec succès pour ${email}`);
    } catch (error: any) {
      this.logger.error(`Erreur resetPassword: ${error.message}`);
      throw error;
    }
  }
}
