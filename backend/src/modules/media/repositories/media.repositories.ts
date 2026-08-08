/*
 * |--------------------------------------------------------------------------
 * | MEDIA REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Media.
 * | Gère la table `media` (métadonnées Cloudinary).
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import PostgresDatabase from '../../../config/database/postgres';
import { NotFoundError } from '../../../shared/errors/appErrors';
import { redisCache } from '../../../infra/redis/redis.service';

import type { Media, PaginationQuery, PaginatedResult } from '../types/media.types';

export interface SaveMediaPayload {
  module?: string | null;
  entityId?: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  publicId: string;
  uploadedBy?: string | null;
}

export class MediaRepository {
  constructor(
    private readonly db: PostgresDatabase,
    private readonly logger: Logger,
  ) {}

  /** Récupère les médias avec pagination + filtres. */
  public async getAllMedia(
    query: PaginationQuery & { module?: string; entityId?: string; uploadedBy?: string } = {}
  ): Promise<PaginatedResult<Media>> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 50));
      const offset = (page - 1) * limit;

      const conditions: string[] = [];
      const params: any[] = [];
      if (query.module) {
        params.push(query.module);
        conditions.push(`module = $${params.length}`);
      }
      if (query.entityId) {
        params.push(query.entityId);
        conditions.push(`entity_id = $${params.length}`);
      }
      if (query.uploadedBy) {
        params.push(query.uploadedBy);
        conditions.push(`uploaded_by = $${params.length}`);
      }
      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const key = `media:all:${page}:${limit}:${query.module ?? ''}:${query.entityId ?? ''}:${query.uploadedBy ?? ''}`;
      return await redisCache.getOrSet(key, async () => {
        const countRes = await this.db.query(`SELECT COUNT(*)::int AS total FROM media ${where}`, params);
        const total = countRes.rows[0].total as number;

        params.push(limit, offset);
        const res = await this.db.query(
          `SELECT
             id,
             module,
             entity_id          AS "entityId",
             file_name          AS "fileName",
             mime_type          AS "mimeType",
             size_bytes         AS "sizeBytes",
             storage_path       AS "storagePath",
             public_id          AS "publicId",
             uploaded_by        AS "uploadedBy",
             created_at         AS "createdAt"
           FROM media
           ${where}
           ORDER BY created_at DESC
           LIMIT $${params.length - 1} OFFSET $${params.length}`,
          params
        );

        return {
          data: res.rows as Media[],
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }, 600);
    } catch (error: any) {
      this.logger.error(`Erreur getAllMedia: ${error.message}`);
      throw error;
    }
  }

  /** Récupère un media par son id (UUID). */
  public async getMediaById(id: string): Promise<Media | null> {
    try {
      const key = `media:id:${id}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT
             id, module,
             entity_id          AS "entityId",
             file_name          AS "fileName",
             mime_type          AS "mimeType",
             size_bytes         AS "sizeBytes",
             storage_path       AS "storagePath",
             public_id          AS "publicId",
             uploaded_by        AS "uploadedBy",
             created_at         AS "createdAt"
           FROM media
           WHERE id = $1
           LIMIT 1`,
          [id]
        );
        return res.rowCount > 0 ? (res.rows[0] as Media) : null;
      }, 600);
    } catch (error: any) {
      this.logger.error(`Erreur getMediaById: ${error.message}`);
      throw error;
    }
  }

  /** Enregistre les métadonnées d'un media après upload Cloudinary. */
  public async saveMedia(payload: SaveMediaPayload): Promise<Media> {
    try {
      const res = await this.db.query(
        `INSERT INTO media (
           module, entity_id, file_name, mime_type,
           size_bytes, storage_path, public_id, uploaded_by
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING
           id, module,
           entity_id          AS "entityId",
           file_name          AS "fileName",
           mime_type          AS "mimeType",
           size_bytes         AS "sizeBytes",
           storage_path       AS "storagePath",
           public_id          AS "publicId",
           uploaded_by        AS "uploadedBy",
           created_at         AS "createdAt"`,
        [
          payload.module ?? null,
          payload.entityId ?? null,
          payload.fileName,
          payload.mimeType,
          payload.sizeBytes,
          payload.storagePath,
          payload.publicId,
          payload.uploadedBy ?? null,
        ]
      );

      await redisCache.invalidatePattern('media:all:*');

      return res.rows[0] as Media;
    } catch (error: any) {
      this.logger.error(`Erreur saveMedia: ${error.message}`);
      throw error;
    }
  }

  /** Supprime un media de la BDD. */
  public async deleteMedia(id: string): Promise<Media> {
    try {
      const res = await this.db.query(
        `DELETE FROM media WHERE id = $1 RETURNING *`,
        [id]
      );

      if ((res.rowCount ?? 0) === 0) {
        throw new NotFoundError('Media introuvable.');
      }

      await redisCache.invalidate(`media:id:${id}`);
      await redisCache.invalidatePattern('media:all:*');

      return res.rows[0] as Media;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur deleteMedia: ${error.message}`);
      throw error;
    }
  }
}