/*
|--------------------------------------------------------------------------
| UPDATE USER SERVICE
|--------------------------------------------------------------------------
| Service métier pour la mise à jour d'un utilisateur.
|--------------------------------------------------------------------------
*/

import type { Logger } from 'winston';
import { AuthRepository } from '../repositories/auth.repositories';

export interface UpdateUserPayload {
  fullName?: string;
  phone?: string;
  roleId?: string;
  regionId?: string | null;
  municipalityId?: string | null;
  districtId?: string | null;
  neighborhoodId?: string | null;
}

export class UpdateUserService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logger: Logger,
  ) {}

  public async execute(userId: string, payload: UpdateUserPayload): Promise<void> {
    try {
      if (Object.keys(payload).length === 0) {
        this.logger.warn(`updateUser: aucun champ à mettre à jour pour l'utilisateur ${userId}`);
        return;
      }
      await this.authRepository.updateUser(userId, payload);
      this.logger.info(`Utilisateur ${userId} mis à jour avec succès.`);
    } catch (error: any) {
      this.logger.error(`Erreur updateUser (service): ${error.message}`);
      throw error;
    }
  }
}
