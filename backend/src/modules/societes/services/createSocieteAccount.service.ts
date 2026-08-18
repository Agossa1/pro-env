/*
 * |--------------------------------------------------------------------------
 * | CREATE SOCIETE ACCOUNT SERVICE
 * |--------------------------------------------------------------------------
 * | Fonction dediee a la creation du compte utilisateur d'une societe.
 * | S'appuie sur le pattern de RegisterService.registerUser :
 * |   1. Verification d'existence (email)
 *   2. Recuperation du role 'societe'

 * |   3. Generation d'un mot de passe aleatoire + hash
 * |   4. Creation du compte auth (rattache a l'organisation)
 * |   5. Generation + sauvegarde d'un OTP (EMAIL_VERIFICATION, 15 min)
 * |   6. Envoi de l'email d'activation (non bloquant en cas d'echec)
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { BadRequestError } from '../../../shared/errors/appErrors';
import { AuthRepository } from '../../auth/repositories/auth.repositories';
import { PasswordService } from '../../../config/passwords/passwordServices';
import { authMailer } from '../../../utils/mailer/authMailer';
import { OtpType } from '../../auth/types/auth.enums';

export interface CreateSocieteAccountParams {
  fullName: string;
  email: string;
  organizationId: string;
  createdBy?: string;
}

export class CreateSocieteAccountService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly password: PasswordService,
    private readonly logger: Logger,
  ) {}

  public async createSocieteAccount(params: CreateSocieteAccountParams): Promise<void> {
    try {
      // 1. Verifier que le compte n'existe pas deja
      const existenceCheck = await this.authRepository.checkUserExistence(params.email);
      if (existenceCheck.exists) {
        throw new BadRequestError(existenceCheck.reason ?? 'Un compte existe deja avec cet email.');
      }

      // 2. Recuperer le role 'societe'
      const societeRole = await this.authRepository.getRoleByCode('societe');
      if (!societeRole) {
        throw new BadRequestError("Le role 'societe' n'existe pas. Lancez le seed des roles.");
      }

      // 3. Mot de passe aleatoire + hash
      const rawPassword = this.password.generateRandomPassword();
      const passwordHash = await this.password.hashPassword(rawPassword);

      // 4. Creation du compte auth (rattache a l'organisation)
      const createdUser = await this.authRepository.createUser({
        fullName: params.fullName,
        email: params.email.toLowerCase(),
        phone: undefined,
        passwordHash,
        roleId: societeRole.id,
        territoryId: null,
        organizationId: params.organizationId,
        createdBy: params.createdBy,
      });

      // 5. OTP EMAIL_VERIFICATION (15 min)
      const rawOtp = this.generateOtp();
      const codeHash = await this.password.hashPassword(rawOtp);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await this.authRepository.saveOtp({
        authId: createdUser.id,
        codeHash,
        type: OtpType.EMAIL_VERIFICATION,
        expiresAt,
      });

      // 6. Envoi email non bloquant
      const frontendBase = process.env.APP_FRONTEND_URL || 'http://localhost:5173';
      const activateLink = `${frontendBase}/activate?email=${encodeURIComponent(params.email)}`;
      try {
        await authMailer.sendSigieOtp(params.email, params.fullName, rawOtp, activateLink);
      } catch (mailError: any) {
        this.logger.error(`Erreur envoi OTP societe ${params.email}: ${mailError.message}`);
      }

      this.logger.info(`Compte societe cree : ${params.email} (organisation ${params.organizationId})`);
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur createSocieteAccount (service): ${error.message}`);
      throw error;
    }
  }

  private generateOtp(): string {
    const { randomInt } = require('crypto');
    return Array.from({ length: 6 }, () => randomInt(0, 10)).join('');
  }
}
