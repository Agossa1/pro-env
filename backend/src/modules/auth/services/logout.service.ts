import type { Logger } from 'winston';
import { AuthRepository } from '../repositories/auth.repositories';

export class LogoutService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Invalide la session de l'utilisateur en supprimant son Refresh Token de la base.
   */
  public async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      this.logger.warn('Logout appelé sans Refresh Token.');
      return;
    }

    try {
      // On supprime la session correspondant à ce token.
      // Cela déconnecte cet appareil spécifiquement, sans toucher aux autres sessions potentielles de l'utilisateur.
      await this.authRepository.deleteSession(refreshToken);
      this.logger.info(`Session supprimée avec succès pour le token: ${refreshToken.substring(0, 15)}...`);
    } catch (error) {
      this.logger.error(`Erreur lors du logout : ${error}`);
      // On ne jette pas d'erreur, même si la session n'existait pas (idempotence).
    }
  }
}
