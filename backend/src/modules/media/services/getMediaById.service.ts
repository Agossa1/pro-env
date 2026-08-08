/*
 * |--------------------------------------------------------------------------
 * | GET MEDIA BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un media par son identifiant UUID.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { MediaRepository } from '../repositories/media.repositories';
import { NotFoundError } from '../../../shared/errors/appErrors';
import type { Media } from '../types/media.types';

export class GetMediaByIdService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly logger: Logger,
  ) {}

  /** Récupère un media par son identifiant UUID. */
  public async getMediaById(id: string): Promise<Media> {
    try {
      const media = await this.mediaRepository.getMediaById(id);
      if (!media) {
        throw new NotFoundError('Media introuvable.');
      }
      this.logger.info(`Media récupéré par ID : ${media.fileName}`);
      return media;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur getMediaById (service): ${error.message}`);
      throw error;
    }
  }
}