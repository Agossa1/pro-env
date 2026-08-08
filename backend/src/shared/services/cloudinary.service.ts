/*
 * |--------------------------------------------------------------------------
 * | CLOUDINARY SERVICE
 * |--------------------------------------------------------------------------
 * | Service central d'upload/suppression Cloudinary.
 * | Configure l'SDK depuis les variables d'environnement et expose
 * | uploadBuffer()/remove() pour le module Media.
 * |--------------------------------------------------------------------------
 */

import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { BadRequestError } from '../errors/appErrors';
import { logger } from '../../config/loggers/logger';

// Configuration Cloudinary depuis le .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadOptions {
  folder?: string;
  publicId?: string;
}

export class CloudinaryService {
  /**
   * Upload un buffer binaire (venant de multer memoryStorage) vers Cloudinary.
   * @param buffer Contenu binaire du fichier
   * @param options Options d'upload (folder, publicId)
   */
  public async uploadBuffer(
    buffer: Buffer,
    options: UploadOptions = {}
  ): Promise<{ url: string; publicId: string }> {
    try {
      const folder = options.folder ?? 'sigie';
      const publicId = options.publicId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            public_id: publicId,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as UploadApiResponse);
          }
        );
        stream.end(buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      logger.error(`Erreur Cloudinary uploadBuffer: ${error.message}`);
      throw new BadRequestError('Échec de l\'upload vers Cloudinary.');
    }
  }

  /**
   * Supprime un fichier Cloudinary par son public_id.
   * @param publicId Identifiant public Cloudinary (format 'folder/file')
   */
  public async remove(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
      logger.error(`Erreur Cloudinary remove: ${error.message}`);
      throw new BadRequestError('Échec de la suppression Cloudinary.');
    }
  }
}