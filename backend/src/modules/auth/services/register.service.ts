/*
|--------------------------------------------------------------------------
| REGISTER SERVICE
|--------------------------------------------------------------------------
| Service métier gérant la création d'utilisateurs.
| Applique les règles de contrôle d'accès hiérarchique et territorial.
|--------------------------------------------------------------------------
*/

import type { Logger } from 'winston';
import { BadRequestError, ForbiddenError } from '../../../shared/errors/appErrors';
import { AuthRepository } from '../repositories/auth.repositories';
import { RoleTier } from '../types/auth.enums';
import type { AuthUser, TokenPayload, CreateUserPayload, RegisterUserDTO } from '../types/auth.types';
import { OtpType } from '../types/auth.enums';
import { PasswordService } from "../../../config/passwords/passwordServices";
import { authMailer } from '../../../utils/mailer/authMailer';


export class RegisterService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logger: Logger,
    private readonly password: PasswordService,
  ) {}

  public async registerUser( dto: RegisterUserDTO, creatorContext: TokenPayload): Promise<AuthUser> {
   try {
     
    // 1. Vérifier si l'utilisateur existe déjà
    const existenceCheck = await this.authRepository.checkUserExistence(dto.email, dto.phone);
    if (existenceCheck.exists) {
      throw new BadRequestError(existenceCheck.reason);
    }

    // 2. Validation du rôle demandé
    const targetRole = await this.authRepository.getRoleByCode(dto.roleCode);
    if (!targetRole) {
      throw new BadRequestError(`Le rôle demandé n'existe pas : ${dto.roleCode}`);
    }

    // 3. Application des Règles Métier (RBAC & Héritage)
    const { territoryId, organizationId } = this.applyCreationRules(dto, targetRole, creatorContext);

    // 4. Hachage du mot de passe
    // Si aucun mot de passe n'est fourni, on pourrait en générer un aléatoirement.
    const rawPassword = dto.password || this.password.generateRandomPassword();
    const passwordHash = await this.password.hashPassword(rawPassword);

    // 5. Préparation du payload pour le Repository
    const createPayload: CreateUserPayload = {
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      passwordHash,
      roleId: targetRole.id,
      territoryId,
      organizationId,
      createdBy: creatorContext.userId
    };

    // 6. Exécution via le Repository
    const createdUser = await this.authRepository.createUser(createPayload);

    // Hydratation complète du rôle pour le retour
    createdUser.role = {
      id: targetRole.id,
      code: targetRole.code,
      name: targetRole.name,
      tier: targetRole.tier,
      canManageUsers: targetRole.canManageUsers
    };

    this.logger.info(`Nouvel utilisateur créé: ${createdUser.email} (Role: ${targetRole.code}) par ${creatorContext.userId}`);

    // Génération et envoi de l'OTP via authMailer (utils)
    const rawOtp = this.generateOtp();
    const codeHash = await this.password.hashPassword(rawOtp);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.authRepository.saveOtp({
      authId: createdUser.id,
      codeHash,
      type: OtpType.EMAIL_VERIFICATION,
      expiresAt,
    });

    // Lien d'activation : l'utilisateur active son compte et crée son mot de passe
    const frontendBase = process.env.APP_FRONTEND_URL || 'http://localhost:5173';
    const activateLink = `${frontendBase}/activate?email=${encodeURIComponent(dto.email)}`;
    try {
      await authMailer.sendSigieOtp(dto.email, dto.fullName, rawOtp, activateLink);
    } catch (mailError: any) {
      // L'échec d'envoi d'email ne doit pas bloquer la création du compte :
      // l'OTP est déjà en base (saveOtp) et l'admin peut renvoyer le code.
      this.logger.error(`Erreur envoi OTP pour ${dto.email}: ${mailError.message}`);
    }

    return createdUser;
   } catch (error) {
    // Préserver les erreurs métier connues (BadRequestError → 400, ForbiddenError → 403)
    if (error instanceof BadRequestError || error instanceof ForbiddenError) {
      throw error;
    }
    this.logger.error(`Erreur lors de la création de l'utilisateur: ${(error as any)?.message ?? error}`);
    throw new BadRequestError('Erreur lors de la création de l\'utilisateur');
   }
  }

  /**
   * Vérifie les droits de création et applique l'héritage territorial / organisationnel.
   */
  private applyCreationRules( dto: RegisterUserDTO, targetRole: any,  creatorContext: TokenPayload): { territoryId: string | null; organizationId: string | null } {
    
    // Si le créateur est un Super Admin (Platform)
    if (creatorContext.roleTier === RoleTier.PLATFORM) {
      // Il peut créer n'importe qui et assigner n'importe quel territoire/organisation
      return {
        territoryId: dto.territoryId || null,
        organizationId: dto.organizationId || null
      };
    }

    // Si le créateur est un Administrateur Territorial (ex: Mairie)
    if (creatorContext.roleTier === RoleTier.TERRITORIAL) {
      if (!creatorContext.territoryId) {
        throw new ForbiddenError('Votre compte territorial est mal configuré (aucun territoire assigné).');
      }
      
      // Un admin territorial ne peut pas créer un rôle 'platform'
      if (targetRole.tier === RoleTier.PLATFORM) {
        throw new ForbiddenError('Vous ne pouvez pas créer d\'administrateur système.');
      }

      // Règles spécifiques selon le profil cible
      if (targetRole.code === 'technicien') {
        if (dto.organizationId) {
          // Création d'un Technicien Prestataire
          // Optionnel : Vérifier si l'organizationId fait partie du territoire de la mairie.
          return {
            territoryId: null,
            organizationId: dto.organizationId
          };
        } else {
          // Création d'un Technicien Mairie (hérite du territoire du créateur)
          return {
            territoryId: creatorContext.territoryId,
            organizationId: null
          };
        }
      }
      
      // Par défaut pour les autres rôles territoriaux créés par la mairie
      return {
        territoryId: creatorContext.territoryId,
        organizationId: null
      };
    }

    // Auto-inscription publique (citoyen uniquement)
    if (!creatorContext.userId && !creatorContext.organizationId && !creatorContext.territoryId) {
      if (targetRole.code !== 'citoyen') {
        throw new ForbiddenError('Inscription publique limitée au rôle citoyen.');
      }
      return { territoryId: null, organizationId: null };
    }

    // Si le créateur est un Prestataire (Field ou Territorial rattaché à une orga)
    if (creatorContext.organizationId) {
      if (targetRole.code !== 'technicien') {
        throw new ForbiddenError('Un prestataire ne peut créer que des techniciens.');
      }
      // Hérite de l'organisation du créateur
      return {
        territoryId: null,
        organizationId: creatorContext.organizationId
      };
    }

    throw new ForbiddenError('Vous n\'avez pas les droits pour créer des utilisateurs.');
  }

  private generateOtp(): string {
    // crypto.randomInt est cryptographiquement sûr (contrairement à Math.random)
    const { randomInt } = require('crypto');
    return Array.from({ length: 6 }, () => randomInt(0, 10)).join('');
  }
}
