import type { Logger } from 'winston';
import { BadRequestError } from '../../../shared/errors/appErrors';
import { AuthRepository } from '../repositories/auth.repositories';
import { PasswordService } from '../../../config/passwords/passwordServices';
import { authMailer } from '../../../utils/mailer/authMailer';
import { OtpType } from '../types/auth.enums';

export class ResendCodeService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logger: Logger,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Génère un nouvel OTP et l'envoie à l'utilisateur (s'il n'est pas déjà vérifié).
   */
  public async resend(email: string): Promise<void> {
    // 1. Chercher l'utilisateur
    const user = await this.authRepository.findAuthByEmail(email);
    if (!user) {
      // Pour éviter le user enumeration, on retourne succès (ou on lève une erreur générique)
      // Ici, le comportement standard est souvent de lever une erreur claire pour un resend.
      throw new BadRequestError('Aucun compte trouvé pour cet email.');
    }

    // 2. Vérifier si le compte est déjà activé/vérifié
    const status = await this.authRepository.findAuthStatus(user.id);
    if (!status) {
      throw new BadRequestError('Statut du compte introuvable.');
    }
    
    if (status.isVerified) {
      throw new BadRequestError('Ce compte est déjà vérifié. Vous pouvez vous connecter.');
    }

    // 3. Générer le nouveau code OTP
    const rawOtp = this.generateOtp();
    const codeHash = await this.passwordService.hashPassword(rawOtp);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // 4. Sauvegarder (écrase l'ancien code grâce au ON CONFLICT dans le repo)
    await this.authRepository.saveOtp({
      authId: user.id,
      codeHash,
      type: OtpType.EMAIL_VERIFICATION,
      expiresAt,
    });

    // 5. Envoyer l'email
    await authMailer.sendSigieOtp(user.email, user.fullName, rawOtp);
    
    this.logger.info(`Nouveau code OTP envoyé à l'utilisateur: ${user.email}`);
  }

  private generateOtp(): string {
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
  }
}
