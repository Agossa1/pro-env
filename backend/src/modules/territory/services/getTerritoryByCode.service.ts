/*
 * |--------------------------------------------------------------------------
 * | GET TERRITORY BY CODE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un territoire par son code unique
 * | (ex: 'BJ-OU-DON').
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TerritoryRepository } from '../repositories/territory.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { Territory } from '../types/territory.types';

export class GetTerritoryByCodeService {
  constructor(
    private readonly territoryRepository: TerritoryRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère un territoire par son code unique.
   * Inclut les géométries (geometry, centroid, bbox) en GeoJSON.
   * @param code Code unique du territoire (ex: 'BJ-OU-DON')
   */
  public async getTerritoryByCode(code: string): Promise<Territory> {
    try {
      const territory = await this.territoryRepository.getTerritoryByCode(code);
      if (!territory) {
        throw new NotFoundError(`Territoire introuvable avec le code : ${code}`);
      }
      this.logger.info(`Territoire récupéré par code : ${territory.name} (${territory.code})`);
      return territory;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getTerritoryByCode (service): ${error.message}`);
      throw error;
    }
  }
}