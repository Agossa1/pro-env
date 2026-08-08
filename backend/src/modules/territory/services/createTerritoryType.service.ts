/*
 * |--------------------------------------------------------------------------
 * | CREATE TERRITORY TYPE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'un type de territoire.
 * | Vérifie l'unicité du code avant insertion.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TerritoryRepository } from '../repositories/territory.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import type { TerritoryType, CreateTerritoryTypePayload } from '../types/territory.types';

export class CreateTerritoryTypeService {
  constructor(
    private readonly territoryRepository: TerritoryRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Crée un nouveau type de territoire après validation de l'unicité du code.
   * @param payload Données du type de territoire (code, name, hierarchyLevel)
   */
  public async createTerritoryType(
    payload: CreateTerritoryTypePayload
  ): Promise<TerritoryType> {
    try {
      const code = payload.code.trim().toUpperCase();
      if (!code) {
        throw new BadRequestError('Le code du type de territoire est requis.');
      }

      const existing = await this.territoryRepository.getTerritoryTypeByCode(code);
      if (existing) {
        throw new BadRequestError(
          `Un type de territoire existe déjà avec le code "${code}".`
        );
      }

      const created = await this.territoryRepository.createTerritoryType({
        ...payload,
        code,
      });

      this.logger.info(`Type de territoire créé : ${created.code}`);
      return created;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur createTerritoryType (service): ${error.message}`);
      throw error;
    }
  }
}