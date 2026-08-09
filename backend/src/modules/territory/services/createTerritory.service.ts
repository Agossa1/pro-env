/*
 * |--------------------------------------------------------------------------
 * | CREATE TERRITORY SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'un territoire.
 * | Applique les règles de contrôle : type existant, code unique, cohérence
 * | hiérarchique du parent, organisation valide — avant d'appeler le
 * | repository (qui reste 100% SQL).
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { TerritoryRepository } from '../repositories/territory.repositories';
import { BadRequestError } from '../../../shared/errors/appErrors';
import type { Territory, CreateTerritoryPayload } from '../types/territory.types';

export class CreateTerritoryService {
  constructor(
    private readonly territoryRepository: TerritoryRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Crée un territoire avec toutes les validations métier.
   * @param dto Données du territoire (avec GeoJSON uploadé)
   * @param creatorId Identifiant de l'utilisateur connecté (optionnel)
   */
  public async createTerritory(
    dto: CreateTerritoryPayload,
    creatorId?: string
  ): Promise<Territory> {
    try {
      // 1. Vérifier que le type de territoire existe
      if (!dto.territoryTypeId) {
        throw new BadRequestError("L'identifiant du type de territoire est requis.");
      }
      const type = await this.territoryRepository.getTerritoryTypeById(dto.territoryTypeId);
      if (!type) {
        throw new BadRequestError('Type de territoire introuvable.');
      }

      // 2. Vérifier l'unicité du code (si fourni, table `territories`)
      if (dto.code) {
        const trimmedCode = dto.code.trim().toUpperCase();
        dto.code = trimmedCode;
        const codeExists = await this.territoryRepository.existsTerritoryByCode(trimmedCode);
        if (codeExists) {
          throw new BadRequestError(`Un territoire existe déjà avec le code "${trimmedCode}".`);
        }
      }

      // 3. Si un parent est fourni, valider la cohérence hiérarchique
      if (dto.parentTerritoryId) {
        const parent = await this.territoryRepository.getTerritoryById(dto.parentTerritoryId);
        if (!parent) {
          throw new BadRequestError('Territoire parent introuvable.');
        }
        if (parent.deletedAt) {
          throw new BadRequestError('Le territoire parent est supprimé.');
        }

        // Le niveau hiérarchique du parent doit être strictement inférieur
        const parentType = parent.territoryTypeId
          ? await this.territoryRepository.getTerritoryTypeById(parent.territoryTypeId)
          : null;
        if (parentType && parentType.hierarchyLevel >= type.hierarchyLevel) {
          throw new BadRequestError(
            `Le type "${type.code}" (niveau ${type.hierarchyLevel}) ne peut pas être enfant du type "${parentType.code}" (niveau ${parentType.hierarchyLevel}).`
          );
        }
      }

      // 4. Vérifier que la géométrie est présente (un territoire doit être cartographié)
      if (!dto.geometry) {
        throw new BadRequestError('La géométrie (GeoJSON) du territoire est requise.');
      }

      // 5. Appeler le repository (transaction SQL pure)
      const created = await this.territoryRepository.createTerritory({
        ...dto,
        createdBy: creatorId ?? dto.createdBy ?? null,
      });

      this.logger.info(`Territoire créé : ${created.name} (type ${type.code})`);
      return created;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur createTerritory (service): ${error.message}`);
      throw error;
    }
  }
}