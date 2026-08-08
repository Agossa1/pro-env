/*
 * |--------------------------------------------------------------------------
 * | DELETE SOCIETE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression d'une société.
 * | La suppression est bloquée si des références existent (FK).
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { SocieteRepository } from '../repositories/societe.repositories';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';

export class DeleteSocieteService {
  constructor(
    private readonly societeRepository: SocieteRepository,
    private readonly logger: Logger,
  ) {}

  /**
   * Supprime une société par son identifiant UUID.
   * @param id Identifiant UUID de la société à supprimer
   */
  public async deleteSociete(id: string): Promise<void> {
    try {
      await this.societeRepository.deleteSociete(id);
      this.logger.info(`Société supprimée : ${id}`);
    } catch (error: any) {
      if (error instanceof BadRequestError || error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur deleteSociete (service): ${error.message}`);
      throw error;
    }
  }
}