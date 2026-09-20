"use strict";
/*
 * |--------------------------------------------------------------------------
 * | INFRASTRUCTURE REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Infrastructures, alignée sur le
 * | schéma 01.schema.sql (table `infrastructures`).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureRepository = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const redis_service_1 = require("../../../infra/redis/redis.service");
class InfrastructureRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        this.infrastructureSelect = `
    SELECT
      i.id,
      i.municipality_id          AS "municipalityId",
      COALESCE(m.name, 'Territoire Inconnu') AS "territoryName",
      i.mapped_area_id        AS "mappedAreaId",
      i.name,
      i.reference_code        AS "referenceCode",
      i.type,
      i.condition,
      i.status,
      i.description,
      i.material,
      i.dimensions,
      i.installation_date     AS "installationDate",
      i.last_maintained_at    AS "lastMaintainedAt",
      i.location,
      i.geometry,
      i.latitude,
      i.longitude,
      i.metadata,
      i.created_by            AS "createdBy",
      i.created_at            AS "createdAt",
      i.updated_at            AS "updatedAt",
      i.deleted_at            AS "deletedAt"
  `;
        this.joinFrom = `
  FROM infrastructures i
  LEFT JOIN municipalities m  ON m.id  = i.municipality_id
  LEFT JOIN regions rg        ON rg.id = m.region_id
`;
    }
    /** Récupère les infrastructures avec pagination + filtres + recherche */
    async getAllInfrastructures(query = {}) {
        try {
            const page = Math.max(1, query.page ?? 1);
            const limit = Math.min(100, Math.max(1, query.limit ?? 50));
            const offset = (page - 1) * limit;
            const conditions = [`i.deleted_at IS NULL`];
            const params = [];
            if (query.regionId) {
                params.push(query.regionId);
                // Filtrer par région via la commune
                conditions.push(`m.region_id = $${params.length}`);
            }
            if (query.municipalityId) {
                params.push(query.municipalityId);
                conditions.push(`i.municipality_id = $${params.length}`);
            }
            // districtId ignoré : la table infrastructures ne stocke pas district_id
            if (query.type) {
                params.push(query.type);
                conditions.push(`i.type = $${params.length}`);
            }
            if (query.status) {
                params.push(query.status);
                conditions.push(`i.status = $${params.length}`);
            }
            if (query.condition) {
                params.push(query.condition);
                conditions.push(`i.condition = $${params.length}`);
            }
            if (query.search) {
                params.push(`%${query.search}%`);
                conditions.push(`(i.name ILIKE $${params.length} OR i.reference_code ILIKE $${params.length})`);
            }
            // Scoping technicien : uniquement les structures liées à ses missions (via équipes)
            if (query.memberUserId) {
                params.push(query.memberUserId);
                conditions.push(`EXISTS (
          SELECT 1 FROM interventions inv
          INNER JOIN missions ms ON ms.id = inv.mission_id
          INNER JOIN field_team_members ftm ON ftm.team_id = ms.assigned_team_id
          WHERE inv.mission_id IN (
            SELECT m2.id FROM missions m2
            INNER JOIN field_team_members ftm2 ON ftm2.team_id = m2.assigned_team_id
            WHERE ftm2.user_id = $${params.length} AND ftm2.is_active = TRUE
          )
          AND i.id = inv.mission_id
        ) OR i.created_by = $${params.length}`);
            }
            const where = conditions.join(' AND ');
            const key = `infrastructures:all:${page}:${limit}:${query.regionId ?? ''}:${query.municipalityId ?? ''}:${query.type ?? ''}:${query.status ?? ''}:${query.condition ?? ''}:${query.search ?? ''}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const countRes = await this.db.query(`SELECT COUNT(*)::int AS total ${this.joinFrom} WHERE ${where}`, params);
                const total = countRes.rows[0].total;
                params.push(limit, offset);
                const res = await this.db.query(`${this.infrastructureSelect}
           ${this.joinFrom}
           WHERE ${where}
           ORDER BY i.created_at DESC
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
            this.logger.error(`Erreur getAllInfrastructures: ${error.message}`);
            throw error;
        }
    }
    /** Récupère une infrastructure par son id (UUID). */
    async getInfrastructureById(id) {
        try {
            const key = `infrastructure:id:${id}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const res = await this.db.query(`${this.infrastructureSelect}
           ${this.joinFrom}
           WHERE i.id = $1
             AND i.deleted_at IS NULL
           LIMIT 1`, [id]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 600);
        }
        catch (error) {
            this.logger.error(`Erreur getInfrastructureById: ${error.message}`);
            throw error;
        }
    }
    /** Crée une infrastructure. */
    async createInfrastructure(payload) {
        try {
            const res = await this.db.query(`INSERT INTO infrastructures (
                    municipality_id, mapped_area_id, name, reference_code,
                    type, condition, status, description, material,
                    dimensions, installation_date, last_maintained_at,
                    location, geometry, latitude, longitude, metadata, created_by
                )
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                     RETURNING id`, [
                payload.municipalityId,
                payload.mappedAreaId ?? null,
                payload.name,
                payload.referenceCode ?? null,
                payload.type,
                payload.condition ?? 'good',
                payload.status ?? 'ACTIVE',
                payload.description ?? null,
                payload.material ?? null,
                payload.dimensions ?? null,
                payload.installationDate ?? null,
                payload.lastMaintainedAt ?? null,
                payload.location ?? null,
                payload.geometry ?? null,
                payload.latitude ?? null,
                payload.longitude ?? null,
                JSON.stringify(payload.metadata ?? {}), // <-- CORRECTION ICI
                payload.createdBy ?? null,
            ]);
            const created = res.rows[0];
            await redis_service_1.redisCache.invalidatePattern('infrastructures:all:*');
            return await this.getInfrastructureById(created.id);
        }
        catch (error) {
            if (error.code === '23503') {
                throw new appErrors_1.BadRequestError('Référence invalide : territoire ou zone cartographiée.');
            }
            if (error.code === '23505') {
                throw new appErrors_1.BadRequestError('Le code de référence existe déjà.');
            }
            this.logger.error(`Erreur createInfrastructure: ${error.message}`);
            throw error;
        }
    }
    /** Met à jour une infrastructure. */
    async updateInfrastructure(id, payload) {
        try {
            const res = await this.db.query(`UPDATE infrastructures
         SET name = COALESCE($1, name),
             reference_code = COALESCE($2, reference_code),
             type = COALESCE($3, type),
             condition = COALESCE($4, condition),
             status = COALESCE($5, status),
             description = COALESCE($6, description),
             material = COALESCE($7, material),
             dimensions = COALESCE($8, dimensions),
             installation_date = COALESCE($9, installation_date),
             last_maintained_at = COALESCE($10, last_maintained_at),
             location = COALESCE($11, location),
             geometry = COALESCE($12, geometry),
             latitude = COALESCE($13, latitude),
             longitude = COALESCE($14, longitude),
             metadata = COALESCE($15, metadata)
         WHERE id = $16
           AND deleted_at IS NULL
         RETURNING id`, [
                payload.name ?? null,
                payload.referenceCode ?? null,
                payload.type ?? null,
                payload.condition ?? null,
                payload.status ?? null,
                payload.description ?? null,
                payload.material ?? null,
                payload.dimensions ?? null,
                payload.installationDate ?? null,
                payload.lastMaintainedAt ?? null,
                payload.location ?? null,
                payload.geometry ?? null,
                payload.latitude ?? null,
                payload.longitude ?? null,
                payload.metadata ?? null,
                id,
            ]);
            if (res.rowCount === 0) {
                throw new appErrors_1.NotFoundError('Infrastructure introuvable.');
            }
            await redis_service_1.redisCache.invalidate(`infrastructure:id:${id}`);
            await redis_service_1.redisCache.invalidatePattern('infrastructures:all:*');
            return await this.getInfrastructureById(id);
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur updateInfrastructure: ${error.message}`);
            throw error;
        }
    }
    /** Suppression logique d'une infrastructure. */
    async deleteInfrastructure(id) {
        try {
            const res = await this.db.query(`UPDATE infrastructures SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`, [id]);
            if ((res.rowCount ?? 0) === 0) {
                throw new appErrors_1.NotFoundError('Infrastructure introuvable.');
            }
            await redis_service_1.redisCache.invalidate(`infrastructure:id:${id}`);
            await redis_service_1.redisCache.invalidatePattern('infrastructures:all:*');
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur deleteInfrastructure: ${error.message}`);
            throw error;
        }
    }
}
exports.InfrastructureRepository = InfrastructureRepository;
//# sourceMappingURL=infrastructure.repositories.js.map