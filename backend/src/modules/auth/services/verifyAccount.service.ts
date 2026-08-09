/*
|--------------------------------------------------------------------------
| VERIFY ACCOUNT SERVICE
|--------------------------------------------------------------------------
| Gère l'activation du compte utilisateur :
| 1. Validation du code OTP reçu par email
| 2. Création du mot de passe choisi par l'utilisateur (hash bcrypt)
| 3. Activation du compte (is_active = true, is_verified = true)
| 4. Envoi de l'email de bienvenue
|--------------------------------------------------------------------------
*/

import type { Logger } from 'winston';
import { BadRequestError } from '../../../shared/errors/appErrors';
import { OtpType } from '../types/auth.enums';
import { AuthRepository } from '../repositories/auth.repositories';
import { PasswordService } from '../../../config/passwords/passwordServices';
import { authMailer } from '../../../utils/mailer/authMailer';

export class VerifyAccountService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logger: Logger,
    private readonly password: PasswordService,
  ) {}

  /**
   * Active un compte à partir de l'email, du code OTP et du nouveau mot de passe.
   */
  public async verify(email: string, submittedCode: string, newPassword: string): Promise<void> {
    // 1. Résoudre l'email → compte utilisateur
    const user = await this.authRepository.findAuthByEmail(email);
    if (!user) {
      throw new BadRequestError('Aucun compte associé à cette adresse email.');
    }

    // 2. Récupérer l'OTP valide (non expiré) en base
    const otpRecord = await this.authRepository.getValidOtp(user.id, OtpType.EMAIL_VERIFICATION);
    if (!otpRecord) {
      throw new BadRequestError('Code invalide ou expiré. Veuillez demander un nouveau code.');
    }

    // 3. Comparer le code soumis avec le hash stocké
    const isMatch = await this.password.comparePassword(submittedCode, otpRecord.codeHash);
    if (!isMatch) {
      throw new BadRequestError('Code incorrect.');
    }

    // 4. Hacher le nouveau mot de passe
    const passwordHash = await this.password.hashPassword(newPassword);

    // 5. Activer le compte + enregistrer le mot de passe + supprimer l'OTP
    await this.authRepository.activateAccountWithPassword(user.id, passwordHash);
    this.logger.info(`Compte ${user.id} activé avec création du mot de passe.`);

    // 6. Envoyer l'email de bienvenue SIGIE
    await authMailer.sendSigieWelcome(user.email, user.fullName, user.roleName ?? 'Utilisateur');
  }
}