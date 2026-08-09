/*
 * |--------------------------------------------------------------------------
 * | DELETE MEDIA SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression d'un media :
 * | 1. Supprime la métadonnée en base
 * 2. Supprime le fichier Cloudinary
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { MediaRepository } from '../repositories/media.repositories';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';
import { NotFoundError } from '../../../shared/errors/appErrors';

export class DeleteMediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logger: Logger,
  ) {}

  /** Supprime un media (BDD + Cloudinary). */
  public async deleteMedia(id: string): Promise<void> {
    try {
      const media = await this.mediaRepository.getMediaById(id);
      if (!media) {
        throw new NotFoundError('Media introuvable.');
      }

      // Supprime en base
      await this.mediaRepository.deleteMedia(id);

      // Supprime le fichier Cloudinary (best-effort : ne bloque pas si échec Cloudinary)
      try {
        await this.cloudinaryService.remove(media.publicId);
      } catch {
        // Ignorer l'échec Cloudinary : la métadonnée est déjà supprimée
      }

      this.logger.info(`Media supprimé : ${media.fileName}`);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur deleteMedia (service): ${error.message}`);
      throw error;
    }
  }
}