/*
|--------------------------------------------------------------------------
| VERIFY ACCOUNT SERVICE
|--------------------------------------------------------------------------
| Gère la vérification du compte utilisateur via le code OTP reçu par email.
| Après vérification réussie, active le compte et envoie l'email de bienvenue.
|--------------------------------------------------------------------------
*/

import bcrypt from 'bcryptjs';
import type { Logger } from 'winston';
import { BadRequestError } from '../../../shared/errors/appErrors';
import { OtpType } from '../types/auth.enums';
import { AuthRepository } from '../repositories/auth.repositories';
import { authMailer } from '../../../utils/mailer/authMailer';

export class VerifyAccountService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Vérifie le code OTP soumis par l'utilisateur.
   * Si valide : active le compte + envoie l'email de bienvenue.
   */
  public async verify(authId: string, submittedCode: string): Promise<void> {
    // 1. Récupérer l'OTP valide (non expiré) en base
    const otpRecord = await this.authRepository.getValidOtp(authId, OtpType.EMAIL_VERIFICATION);

    if (!otpRecord) {
      throw new BadRequestError('Code invalide ou expiré. Veuillez demander un nouveau code.');
    }

    // 2. Comparer le code soumis avec le hash stocké
    const isMatch = await bcrypt.compare(submittedCode, otpRecord.codeHash);
    if (!isMatch) {
      throw new BadRequestError('Code incorrect.');
    }

    // 3. Activer le compte + supprimer le code OTP
    const user = await this.authRepository.findAuthByEmail(authId);
    await this.authRepository.verifyAccountAndDeleteOtp(authId);
    this.logger.info(`Compte ${authId} vérifié et activé.`);

    // 4. Envoyer l'email de bienvenue SIGIE
    if (user) {
      await authMailer.sendSigieWelcome(user.email, user.fullName, user.roleName ?? 'Utilisateur');
    }
  }
}
