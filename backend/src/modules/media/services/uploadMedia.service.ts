/*
 * |--------------------------------------------------------------------------
 * | UPLOAD MEDIA SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier d'upload d'un fichier :
 * | 1. Redimensionne les images avec Sharp
 * | 2. Upload vers Cloudinary
 * | 3. Enregistre les métadonnées en base
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import { MediaRepository } from '../repositories/media.repositories';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';
import { BadRequestError } from '../../../shared/errors/appErrors';
import type { Media } from '../types/media.types';
import sharp from 'sharp';

export interface UploadMediaInput {
  buffer: Buffer;
  originalName: string;
  mimetype: string;
  size: number;
  module?: string | null;
  entityId?: string | null;
  uploadedBy?: string | null;
}

export class UploadMediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logger: Logger,
  ) {}

  /** Upload un fichier : optimisation image + Cloudinary + métadonnées BDD. */
  public async uploadMedia(input: UploadMediaInput): Promise<Media> {
    try {
      if (!input.buffer || input.buffer.length === 0) {
        throw new BadRequestError('Fichier vide ou manquant.');
      }

      // 1. Optimisation de l'image avec Sharp (si c'est une image)
      let bufferToUpload = input.buffer;
      const isImage = input.mimetype.startsWith('image/');
      if (isImage) {
        try {
          bufferToUpload = await sharp(input.buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();
        } catch {
          // Si Sharp échoue, on garde le buffer original
          bufferToUpload = input.buffer;
        }
      }

      // 2. Upload vers Cloudinary
      const { url, publicId } = await this.cloudinaryService.uploadBuffer(bufferToUpload, {
        folder: 'sigie',
      });

      // 3. Enregistrement des métadonnées
      return await this.mediaRepository.saveMedia({
        module: input.module ?? null,
        entityId: input.entityId ?? null,
        fileName: input.originalName,
        mimeType: input.mimetype,
        sizeBytes: bufferToUpload.length,
        storagePath: url,
        publicId,
        uploadedBy: input.uploadedBy ?? null,
      });
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      this.logger.error(`Erreur uploadMedia (service): ${error.message}`);
      throw error;
    }
  }
}