/*
 * |--------------------------------------------------------------------------
 * | GET SOCIETE TERRITORIES SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération des territoires de compétence d'une société.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { SocieteRepository } from '../repositories/societe.repositories';
import type { SocieteTerritory } from '../types/societe.types';

export class GetSocieteTerritoriesService {
  constructor(
    private readonly societeRepository: SocieteRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Récupère les territoires de compétence d'une société.
   * @param societeId Identifiant UUID de la société
   */
  public async getSocieteTerritories(societeId: string): Promise<SocieteTerritory[]> {
    try {
      const territories = await this.societeRepository.getSocieteTerritories(societeId);
      this.logger.info(
        `Territoires de la société ${societeId} récupérés : ${territories.length}`
      );
      return territories;
    } catch (error: any) {
      this.logger.error(`Erreur getSocieteTerritories (service): ${error.message}`);
      throw error;
    }
  }
}