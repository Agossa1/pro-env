/*
|--------------------------------------------------------------------------
| DELETE USER SERVICE
|--------------------------------------------------------------------------
| Service métier pour la suppression définitive d'un utilisateur.
|--------------------------------------------------------------------------
*/

import type { Logger } from 'winston';
import { AuthRepository } from '../repositories/auth.repositories';

export class DeleteUserService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logger: Logger,
  ) {}

  public async execute(userId: string): Promise<void> {
    try {
      await this.authRepository.deleteUser(userId);
      this.logger.info(`Utilisateur ${userId} supprimé définitivement.`);
    } catch (error: any) {
      this.logger.error(`Erreur deleteUser (service): ${error.message}`);
      throw error;
    }
  }
}
