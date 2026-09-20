/*
|--------------------------------------------------------------------------
| GET USERS SERVICE
|--------------------------------------------------------------------------
| Service métier de récupération paginée de la liste des utilisateurs
| (administration — lecture seule via le module auth).
|--------------------------------------------------------------------------
*/

import type { Logger } from 'winston';
import { AuthRepository } from '../repositories/auth.repositories';

export interface PaginatedUsersResult {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class GetUsersService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère la liste paginée des utilisateurs.
   * @param query Paramètres de pagination (page, limit)
   */
  public async getUsers(query: { page?: number; limit?: number; filters?: any } = {}): Promise<PaginatedUsersResult> {
    try {
      const result = await this.authRepository.getAllUsers(query);
      this.logger.info(
        `Liste des utilisateurs récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`
      );
      return result;
    } catch (error: any) {
      this.logger.error(`Erreur getUsers (service): ${error.message}`);
      throw error;
    }
  }
}