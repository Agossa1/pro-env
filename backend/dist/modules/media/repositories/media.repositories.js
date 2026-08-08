"use strict";
/*
 * |--------------------------------------------------------------------------
 * | MEDIA REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Media.
 * | Gère la table `media` (métadonnées Cloudinary).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaRepository = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const redis_service_1 = require("../../../infra/redis/redis.service");
class MediaRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    /** Récupère les médias avec pagination + filtres. */
    async getAllMedia(query = {}) {
        try {
            const page = Math.max(1, query.page ?? 1);
            const limit = Math.min(100, Math.max(1, query.limit ?? 50));
            const offset = (page - 1) * limit;
            const conditions = [];
            const params = [];
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
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const countRes = await this.db.query(`SELECT COUNT(*)::int AS total FROM media ${where}`, params);
                const total = countRes.rows[0].total;
                params.push(limit, offset);
                const res = await this.db.query(`SELECT
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
           LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
                return {
                    data: res.rows,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                };
            }, 600);
        }
        catch (error) {
            this.logger.error(`Erreur getAllMedia: ${error.message}`);
            throw error;
        }
    }
    /** Récupère un media par son id (UUID). */
    async getMediaById(id) {
        try {
            const key = `media:id:${id}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const res = await this.db.query(`SELECT
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
           LIMIT 1`, [id]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 600);
        }
        catch (error) {
            this.logger.error(`Erreur getMediaById: ${error.message}`);
            throw error;
        }
    }
    /** Enregistre les métadonnées d'un media après upload Cloudinary. */
    async saveMedia(payload) {
        try {
            const res = await this.db.query(`INSERT INTO media (
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
           created_at         AS "createdAt"`, [
                payload.module ?? null,
                payload.entityId ?? null,
                payload.fileName,
                payload.mimeType,
                payload.sizeBytes,
                payload.storagePath,
                payload.publicId,
                payload.uploadedBy ?? null,
            ]);
            await redis_service_1.redisCache.invalidatePattern('media:all:*');
            return res.rows[0];
        }
        catch (error) {
            this.logger.error(`Erreur saveMedia: ${error.message}`);
            throw error;
        }
    }
    /** Supprime un media de la BDD. */
    async deleteMedia(id) {
        try {
            const res = await this.db.query(`DELETE FROM media WHERE id = $1 RETURNING *`, [id]);
            if ((res.rowCount ?? 0) === 0) {
                throw new appErrors_1.NotFoundError('Media introuvable.');
            }
            await redis_service_1.redisCache.invalidate(`media:id:${id}`);
            await redis_service_1.redisCache.invalidatePattern('media:all:*');
            return res.rows[0];
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur deleteMedia: ${error.message}`);
            throw error;
        }
    }
}
exports.MediaRepository = MediaRepository;
//# sourceMappingURL=media.repositories.js.map