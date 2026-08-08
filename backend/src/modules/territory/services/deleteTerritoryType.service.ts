/*
 * |--------------------------------------------------------------------------
 * | DELETE TERRITORY TYPE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression d'un type de territoire.
 * | La suppression échoue si des territoires y sont encore rattachés (FK).
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TerritoryRepository } from '../repositories/territory.repositories';

export class DeleteTerritoryTypeService {
  constructor(
    private readonly territoryRepository: TerritoryRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Supprime un type de territoire par son identifiant UUID.
   * @param id Identifiant UUID du type de territoire à supprimer
   */
  public async deleteTerritoryType(id: string): Promise<void> {
    try {
      await this.territoryRepository.deleteTerritoryType(id);
      this.logger.info(`Type de territoire supprimé : ${id}`);
    } catch (error: any) {
      this.logger.error(`Erreur deleteTerritoryType (service): ${error.message}`);
      throw error;
    }
  }
}