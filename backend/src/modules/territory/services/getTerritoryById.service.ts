/*
 * |--------------------------------------------------------------------------
 * | GET TERRITORY BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un territoire par son identifiant UUID.
 * | Retourne la géométrie en GeoJSON (geometry, centroid, bbox).
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TerritoryRepository } from '../repositories/territory.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { Territory } from '../types/territory.types';

export class GetTerritoryByIdService {
  constructor(
    private readonly territoryRepository: TerritoryRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère un territoire par son identifiant UUID.
   * Inclut les géométries (geometry, centroid, bbox) en GeoJSON.
   * @param id Identifiant UUID du territoire
   */
  public async getTerritoryById(id: string): Promise<Territory> {
    try {
      const territory = await this.territoryRepository.getTerritoryById(id);
      if (!territory) {
        throw new NotFoundError('Territoire introuvable.');
      }
      this.logger.info(`Territoire récupéré par ID : ${territory.name}`);
      return territory;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getTerritoryById (service): ${error.message}`);
      throw error;
    }
  }
}