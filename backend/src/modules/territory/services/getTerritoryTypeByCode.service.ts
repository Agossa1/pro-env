/*
 * |--------------------------------------------------------------------------
 * | GET TERRITORY TYPE BY CODE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un type de territoire par son code
 * | unique (ex: 'DEPARTMENT', 'COMMUNE').
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TerritoryRepository } from '../repositories/territory.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { TerritoryType } from '../types/territory.types';

export class GetTerritoryTypeByCodeService {
  constructor(
    private readonly territoryRepository: TerritoryRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère un type de territoire par son code.
   * @param code Code unique du type (ex: 'DEPARTMENT')
   */
  public async getTerritoryTypeByCode(code: string): Promise<TerritoryType> {
    try {
      const type = await this.territoryRepository.getTerritoryTypeByCode(code);
      if (!type) {
        throw new NotFoundError(`Type de territoire introuvable : ${code}`);
      }
      this.logger.info(`Type de territoire récupéré par code : ${type.code}`);
      return type;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getTerritoryTypeByCode (service): ${error.message}`);
      throw error;
    }
  }
}