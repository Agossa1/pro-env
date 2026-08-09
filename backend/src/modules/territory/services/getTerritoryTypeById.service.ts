/*
 * |--------------------------------------------------------------------------
 * | GET TERRITORY TYPE BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un type de territoire par son
 * | identifiant UUID.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TerritoryRepository } from '../repositories/territory.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { TerritoryType } from '../types/territory.types';

export class GetTerritoryTypeByIdService {
  constructor(
    private readonly territoryRepository: TerritoryRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère un type de territoire par son identifiant UUID.
   * @param id Identifiant UUID du type de territoire
   */
  public async getTerritoryTypeById(id: string): Promise<TerritoryType> {
    try {
      const type = await this.territoryRepository.getTerritoryTypeById(id);
      if (!type) {
        throw new NotFoundError('Type de territoire introuvable.');
      }
      this.logger.info(`Type de territoire récupéré par ID : ${type.code}`);
      return type;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getTerritoryTypeById (service): ${error.message}`);
      throw error;
    }
  }
}