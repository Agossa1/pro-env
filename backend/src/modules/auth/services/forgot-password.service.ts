import type { Logger } from 'winston';
import { AuthRepository } from '../repositories/auth.repositories';
import { OtpType } from '../types/auth.enums';
import { PasswordService } from "../../../config/passwords/passwordServices";
import { authMailer } from '../../../utils/mailer/authMailer';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class ForgotPasswordService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logger: Logger,
    private readonly passwordService: PasswordService,
  ) {}

  public async forgotPassword(email: string): Promise<void> {
    try {
      // 1. Chercher l'utilisateur
      const user = await this.authRepository.findAuthByEmail(email);
      if (!user) {
        throw new NotFoundError("Aucun compte n'est associé à cette adresse email.");
      }

      // 2. Générer OTP (6 chiffres)
      const rawOtp = this.generateOtp();
      const codeHash = await this.passwordService.hashPassword(rawOtp);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      
      // 3. Sauvegarder OTP
      await this.authRepository.saveOtp({
        authId: user.id,
        codeHash,
        type: OtpType.PASSWORD_RESET,
        expiresAt,
      });

      // 4. Générer lien
      const frontendBase = process.env.APP_FRONTEND_URL || 'http://localhost:5173';
      const resetLink = `${frontendBase}/reset-password?email=${encodeURIComponent(email)}`;

      // 5. Envoyer Email
      await authMailer.sendSigiePasswordReset(email, user.fullName, rawOtp, resetLink);
      
      this.logger.info(`Mot de passe oublié initié pour ${email}`);
    } catch (error: any) {
      this.logger.error(`Erreur forgotPassword: ${error.message}`);
      throw error;
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
