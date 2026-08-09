/*
 * |--------------------------------------------------------------------------
 * | GET ENTITY MEDIA SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération de tous les médias liés à une entité.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { MediaRepository } from '../repositories/media.repositories';
import type { Media } from '../types/media.types';

export class GetEntityMediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly logger: Logger,
  ) {}

  /** Récupère les médias d'une entité (par entityId). */
  public async getEntityMedia(entityId: string): Promise<Media[]> {
    try {
      const result = await this.mediaRepository.getAllMedia({ entityId });
      this.logger.info(
        `Médias de l'entité ${entityId} : ${result.total} résultat(s)`
      );
      return result.data;
    } catch (error: any) {
      this.logger.error(`Erreur getEntityMedia (service): ${error.message}`);
      throw error;
    }
  }
}