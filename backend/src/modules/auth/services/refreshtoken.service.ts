import type { Logger } from 'winston';
import { UnauthorizedError, ForbiddenError } from '../../../shared/errors/appErrors';
import { AuthRepository } from '../repositories/auth.repositories';
import { TokenManager } from '../../../config/tokens/tokenManager';

export class RefreshTokenService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logger: Logger,
    private readonly tokenManager: TokenManager,
  ) {}

  /**
   * Vérifie le Refresh Token et renvoie une nouvelle paire de tokens (Rotation).
   */
  public async refresh(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!oldRefreshToken) {
      throw new UnauthorizedError('Refresh Token manquant.');
    }

    // 1. Vérification cryptographique
    let payload: any;
    try {
      payload = this.tokenManager.verifyRefreshToken(oldRefreshToken);
    } catch (error) {
      this.logger.warn('Tentative de refresh avec token invalide ou expiré.');
      throw new UnauthorizedError('Refresh Token invalide ou expiré.');
    }

    // 2. Vérification de la session en base de données
    const session = await this.authRepository.findSession(oldRefreshToken);
    if (!session) {
      this.logger.warn(`Tentative de refresh avec un token non enregistré en base (possiblement volé): ${oldRefreshToken.substring(0, 15)}...`);
      // Sécurité: Si un token valide cryptographiquement n'est pas en base, c'est qu'il a été révoqué.
      throw new UnauthorizedError('Session invalide ou expirée.');
    }

    // 3. Récupération des informations à jour de l'utilisateur
    const user = await this.authRepository.findAuthByIdForToken(session.authId);
    if (!user) {
      throw new UnauthorizedError('Utilisateur introuvable.');
    }

    // 4. Vérification du statut (au cas où il a été désactivé entre temps)
    if (!user.isActive) {
      throw new ForbiddenError('Votre compte a été désactivé.');
    }

    // 5. Génération des nouveaux tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      roleCode: user.roleCode,
      tier: user.roleTier,
      territoryId: user.territoryId,
      organizationId: user.organizationId
    };

    const newAccessToken = this.tokenManager.generateAccessToken(tokenPayload);
    const newRefreshToken = this.tokenManager.generateRefreshToken({ userId: user.id });

    // 6. Rotation: Mise à jour de la session existante avec le nouveau token
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);
    
    await this.authRepository.updateSession(oldRefreshToken, newRefreshToken, newExpiresAt);

    this.logger.info(`Session rafraîchie avec succès pour l'utilisateur: ${user.email}`);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
}
