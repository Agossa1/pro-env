/*
 * |--------------------------------------------------------------------------
 * | GET MEDIA SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des médias.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { MediaRepository } from '../repositories/media.repositories';
import type { Media, PaginationQuery, PaginatedResult } from '../types/media.types';

export interface GetAllMediaQuery extends PaginationQuery {
  module?: string;
  entityId?: string;
  uploadedBy?: string;
}

export class GetMediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly logger: Logger,
  ) {}

  /** Récupère la liste paginée des médias avec filtres optionnels. */
  public async getMedia(query: GetAllMediaQuery = {}): Promise<PaginatedResult<Media>> {
    try {
      const result = await this.mediaRepository.getAllMedia(query);
      this.logger.info(
        `Liste des médias récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`
      );
      return result;
    } catch (error: any) {
      this.logger.error(`Erreur getMedia (service): ${error.message}`);
      throw error;
    }
  }
}