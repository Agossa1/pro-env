/*
 * |--------------------------------------------------------------------------
 * | UPDATE TERRITORY TYPE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de mise à jour d'un type de territoire.
 * | Délégue la persistance au repository après validation.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TerritoryRepository } from '../repositories/territory.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { TerritoryType, UpdateTerritoryTypePayload } from '../types/territory.types';

export class UpdateTerritoryTypeService {
  constructor(
    private readonly territoryRepository: TerritoryRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Met à jour un type de territoire existant.
   * @param id Identifiant UUID du type de territoire
   * @param payload Champs modifiables (name, hierarchyLevel)
   */
  public async updateTerritoryType(
    id: string,
    payload: UpdateTerritoryTypePayload
  ): Promise<TerritoryType> {
    try {
      const updated = await this.territoryRepository.updateTerritoryType(id, payload);
      if (!updated) {
        throw new NotFoundError('Type de territoire introuvable.');
      }
      this.logger.info(`Type de territoire mis à jour : ${updated.code}`);
      return updated;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updateTerritoryType (service): ${error.message}`);
      throw error;
    }
  }
}