import type { Logger } from 'winston';
import { BadRequestError, UnauthorizedError, ForbiddenError } from '../../../shared/errors/appErrors';
import { AuthRepository } from '../repositories/auth.repositories';
import { PasswordService } from '../../../config/passwords/passwordServices';
import { TokenManager } from '../../../config/tokens/tokenManager';

export class LoginService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logger: Logger,
    private readonly passwordService: PasswordService,
    private readonly tokenManager: TokenManager,
  ) {}

  public async login(email: string, passwordString: string): Promise<any> {
    // 1. Chercher l'utilisateur avec toutes les infos nécessaires
    const user = await this.authRepository.findAuthForLogin(email);
    if (!user) {
      this.logger.warn(`Tentative de login échouée (email introuvable): ${email}`);
      throw new UnauthorizedError('Identifiants incorrects.');
    }

    // 2. Vérifier le mot de passe
    const isPasswordValid = await this.passwordService.comparePassword(passwordString, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Tentative de login échouée (mot de passe incorrect): ${email}`);
      throw new UnauthorizedError('Identifiants incorrects.');
    }

    // 3. Vérifier le statut du compte
    if (!user.isVerified) {
      throw new ForbiddenError('Votre compte n\'est pas encore vérifié. Veuillez valider votre code OTP.');
    }
    if (!user.isActive) {
      throw new ForbiddenError('Votre compte a été désactivé. Veuillez contacter un administrateur.');
    }

    // 4. Préparer le payload du token
    // Le payload suit le format TokenPayload attendu par le authMiddleware :
    // roleTier (et non tier) + roles (liste) pour les vérifications RBAC.
    const tokenPayload = {
      id: '',
      userId: user.id,
      email: user.email,
      roleCode: user.roleCode,
      roleTier: user.roleTier,
      regionId: user.regionId,
      municipalityId: user.municipalityId,
      districtId: user.districtId,
      neighborhoodId: user.neighborhoodId,
      organizationId: user.organizationId,
      roles: [user.roleCode]
    };

    // 5. Générer les tokens
    const accessToken = this.tokenManager.generateAccessToken(tokenPayload);
    const refreshToken = this.tokenManager.generateRefreshToken({ userId: user.id });

    // 6. Sauvegarder la session (Refresh Token) en base (expiration 7 jours par défaut)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Doit correspondre à la config de tokenManager
    
    await this.authRepository.createSession({
      authId: user.id,
      token: refreshToken,
      expiresAt
    });

    this.logger.info(`Connexion réussie pour l'utilisateur: ${user.email}`);

    // 7. Nettoyer les données sensibles avant le retour
    delete user.passwordHash;
    
    return {
      user,
      accessToken,
      refreshToken
    };
  }
}
