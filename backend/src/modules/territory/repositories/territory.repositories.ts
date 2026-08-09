/*
 * |--------------------------------------------------------------------------
 * | TERRITORY REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Territory, alignée sur le
 * | schéma 01.schema.sql. Gère territory_types, territories (récursif +
 * | PostGIS) et territory_sectors.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import PostgresDatabase from '../../../config/database/postgres';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { redisCache } from '../../../infra/redis/redis.service';

import { TerritoryStatus } from '../types/territory.enums';
import type {
  Territory,
  TerritoryType,
  CreateTerritoryTypePayload,
  UpdateTerritoryTypePayload,
  CreateTerritoryPayload,
  PaginationQuery,
  PaginatedResult,
} from '../types/territory.types';

export class TerritoryRepository {
  constructor(
    private readonly db: PostgresDatabase,
    private readonly logger: Logger,
  ) {}

  // ───────────────────────────────────────────────────────────────────────────
  // TERRITORY TYPES
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Récupère les types de territoires avec pagination, triés par niveau
   * hiérarchique (page 1-based, limit par page — défauts 1 et 50).
   */
  public async getAllTerritoryTypes(
    query: PaginationQuery = {}
  ): Promise<PaginatedResult<TerritoryType>> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 50));
      const offset = (page - 1) * limit;

      const key = `territory:types:all:${page}:${limit}`;
      return await redisCache.getOrSet(key, async () => {
        // Total (pour calculer le nombre de pages)
        const countRes = await this.db.query(
          `SELECT COUNT(*)::int AS total FROM territory_types`
        );
        const total = countRes.rows[0].total as number;

        // Page courante
        const res = await this.db.query(
          `SELECT id, code, name, hierarchy_level AS "hierarchyLevel"
           FROM territory_types
           ORDER BY hierarchy_level ASC
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        );

        return {
          data: res.rows as TerritoryType[],
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }, 3600); // TTL 1 heure
    } catch (error: any) {
      this.logger.error(`Erreur getAllTerritoryTypes: ${error.message}`);
      throw error;
    }
  }

  /** Récupère un type de territoire par son code (ex: 'DEPARTMENT'). */
  public async getTerritoryTypeByCode(code: string): Promise<TerritoryType | null> {
    try {
      const key = `territory:type:code:${code}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT id, code, name, hierarchy_level AS "hierarchyLevel"
           FROM territory_types
           WHERE code = $1
           LIMIT 1`,
          [code]
        );
        return res.rowCount > 0 ? (res.rows[0] as TerritoryType) : null;
      }, 3600);
    } catch (error: any) {
      this.logger.error(`Erreur getTerritoryTypeByCode: ${error.message}`);
      throw error;
    }
  }

  /** Récupère un type de territoire par son id (UUID). */
  public async getTerritoryTypeById(id: string): Promise<TerritoryType | null> {
    try {
      const key = `territory:type:id:${id}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT id, code, name, hierarchy_level AS "hierarchyLevel"
           FROM territory_types
           WHERE id = $1
           LIMIT 1`,
          [id]
        );
        return res.rowCount > 0 ? (res.rows[0] as TerritoryType) : null;
      }, 3600);
    } catch (error: any) {
      this.logger.error(`Erreur getTerritoryTypeById: ${error.message}`);
      throw error;
    }
  }

  /** Crée un type de territoire (transaction). */
  public async createTerritoryType(payload: CreateTerritoryTypePayload): Promise<TerritoryType> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      const res = await client.query(
        `INSERT INTO territory_types (code, name, hierarchy_level)
         VALUES ($1, $2, $3)
         RETURNING id, code, name, hierarchy_level AS "hierarchyLevel"`,
        [payload.code, payload.name, payload.hierarchyLevel]
      );

      await client.query('COMMIT');

      await redisCache.invalidatePattern('territory:types:all:*');

      return res.rows[0] as TerritoryType;
    } catch (error: any) {
      await client.query('ROLLBACK');
      if (error.code === '23505' && error.constraint === 'territory_types_code_key') {
        throw new BadRequestError(`Un type de territoire existe déjà avec le code "${payload.code}".`);
      }
      this.logger.error(`Erreur createTerritoryType: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /** Met à jour un type de territoire. */
  public async updateTerritoryType(
    id: string,
    payload: UpdateTerritoryTypePayload
  ): Promise<TerritoryType | null> {
    try {
      const res = await this.db.query(
        `UPDATE territory_types
         SET name = COALESCE($1, name),
             hierarchy_level = COALESCE($2, hierarchy_level)
         WHERE id = $3
         RETURNING id, code, name, hierarchy_level AS "hierarchyLevel"`,
        [payload.name ?? null, payload.hierarchyLevel ?? null, id]
      );

      if (res.rowCount === 0) {
        throw new NotFoundError('Type de territoire introuvable.');
      }

      await redisCache.invalidatePattern('territory:types:all:*');
      await redisCache.invalidate(`territory:type:id:${id}`);

      return res.rows[0] as TerritoryType;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updateTerritoryType: ${error.message}`);
      throw error;
    }
  }

  /** Supprime un type de territoire (RESTRICT si des territoires y sont rattachés). */
  public async deleteTerritoryType(id: string): Promise<void> {
    try {
      const res = await this.db.query(`DELETE FROM territory_types WHERE id = $1`, [id]);

      if (res.rowCount === 0) {
        throw new NotFoundError('Type de territoire introuvable.');
      }

      await redisCache.invalidatePattern('territory:types:all:*');
      await redisCache.invalidate(`territory:type:id:${id}`);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      if (error.code === '23503') {
        throw new BadRequestError(
          'Impossible de supprimer ce type : des territoires y sont encore rattachés.'
        );
      }
      this.logger.error(`Erreur deleteTerritoryType: ${error.message}`);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TERRITORIES — lecture & création
  // ───────────────────────────────────────────────────────────────────────────

  /** Récupère un territoire par son id (UUID), géométries en GeoJSON. */
  public async getTerritoryById(id: string): Promise<Territory | null> {
    try {
      const key = `territory:id:${id}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT
             t.id,
             t.territory_type_id    AS "territoryTypeId",
             t.parent_territory_id  AS "parentTerritoryId",
             t.organization_id      AS "organizationId",
             t.code, t.name, t.status, t.metadata,
             t.created_by           AS "createdBy",
             t.created_at           AS "createdAt",
             t.updated_at           AS "updatedAt",
             t.deleted_at           AS "deletedAt",
             ST_AsGeoJSON(t.geometry) AS geometry,
             ST_AsGeoJSON(t.centroid) AS centroid,
             ST_AsGeoJSON(t.bbox)      AS bbox
           FROM territories t
           WHERE t.id = $1
             AND t.deleted_at IS NULL
           LIMIT 1`,
          [id]
        );
        return res.rowCount > 0 ? (res.rows[0] as Territory) : null;
      }, 600); // TTL 10 minutes
    } catch (error: any) {
      this.logger.error(`Erreur getTerritoryById: ${error.message}`);
      throw error;
    }
  }

  /** Vérifie si un code de territoire est déjà utilisé. */
  public async existsTerritoryByCode(code: string): Promise<boolean> {
    try {
      const res = await this.db.query(
        `SELECT 1 FROM territories
         WHERE code = $1
           AND deleted_at IS NULL
         LIMIT 1`,
        [code]
      );
      return res.rowCount > 0;
    } catch (error: any) {
      this.logger.error(`Erreur existsTerritoryByCode: ${error.message}`);
      throw error;
    }
  }

  /** Récupère un territoire par son code (ex: 'BJ-OU-DON'). */
  public async getTerritoryByCode(code: string): Promise<Territory | null> {
    try {
      const key = `territory:code:${code}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT
             t.id,
             t.territory_type_id    AS "territoryTypeId",
             t.parent_territory_id  AS "parentTerritoryId",
             t.organization_id      AS "organizationId",
             t.code, t.name, t.status, t.metadata,
             t.created_by           AS "createdBy",
             t.created_at           AS "createdAt",
             t.updated_at           AS "updatedAt",
             t.deleted_at           AS "deletedAt",
             ST_AsGeoJSON(t.geometry) AS geometry,
             ST_AsGeoJSON(t.centroid) AS centroid,
             ST_AsGeoJSON(t.bbox)      AS bbox
           FROM territories t
           WHERE t.code = $1
             AND t.deleted_at IS NULL
           LIMIT 1`,
          [code]
        );
        return res.rowCount > 0 ? (res.rows[0] as Territory) : null;
      }, 600);
    } catch (error: any) {
      this.logger.error(`Erreur getTerritoryByCode: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère les territoires avec pagination (page 1-based, limit par page —
   * défauts 1 et 50). Filtres optionnels : type (territoryTypeId) et parent
   * (parentTerritoryId). Géométries retournées en GeoJSON.
   */
  public async getAllTerritories(
    query: PaginationQuery & { territoryTypeId?: string; parentTerritoryId?: string; territoryTypeCode?: string } = {}
  ): Promise<PaginatedResult<Territory>> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(5000, Math.max(1, query.limit ?? 50));
      const offset = (page - 1) * limit;

      const conditions: string[] = [`t.deleted_at IS NULL`];
      const params: any[] = [];

      if (query.territoryTypeId) {
        params.push(query.territoryTypeId);
        conditions.push(`t.territory_type_id = $${params.length}`);
      }
      if (query.territoryTypeCode) {
        params.push(query.territoryTypeCode);
        conditions.push(`tt.code = $${params.length}`);
      }
      if (query.parentTerritoryId) {
        params.push(query.parentTerritoryId);
        conditions.push(`t.parent_territory_id = $${params.length}`);
      }

      const where = conditions.join(' AND ');

      const key = `territory:all:${page}:${limit}:${query.territoryTypeId ?? ''}:${query.territoryTypeCode ?? ''}:${query.parentTerritoryId ?? ''}`;
      return await redisCache.getOrSet(key, async () => {
        const countRes = await this.db.query(
          `SELECT COUNT(*)::int AS total
           FROM territories t
           LEFT JOIN territory_types tt ON t.territory_type_id = tt.id
           WHERE ${where}`,
          params
        );
        const total = countRes.rows[0].total as number;

        params.push(limit, offset);
        const res = await this.db.query(
          `SELECT
             t.id,
             t.territory_type_id    AS "territoryTypeId",
             tt.code                AS "territoryTypeCode",
             tt.name                AS "territoryTypeName",
             t.parent_territory_id  AS "parentTerritoryId",
             t.organization_id      AS "organizationId",
             t.code, t.name, t.status, t.metadata,
             t.created_by           AS "createdBy",
             t.created_at           AS "createdAt",
             t.updated_at           AS "updatedAt",
             t.deleted_at           AS "deletedAt",
             ST_AsGeoJSON(t.geometry) AS geometry,
             ST_AsGeoJSON(t.centroid) AS centroid,
             ST_AsGeoJSON(t.bbox)      AS bbox
           FROM territories t
           LEFT JOIN territory_types tt ON tt.id = t.territory_type_id
           WHERE ${where}
           ORDER BY t.name ASC
           LIMIT $${params.length - 1} OFFSET $${params.length}`,
          params
        );

        return {
          data: res.rows as Territory[],
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }, 600); // TTL 10 minutes
    } catch (error: any) {
      this.logger.error(`Erreur getAllTerritories: ${error.message}`);
      throw error;
    }
  }

  /**
   * Crée un territoire de bout en bout dans une transaction.
   * - INSERT dans `territories` (géométrie convertie en MultiPolygon 4326)
   * - INSERT éventuel dans `territory_sectors` (si initialSector fourni)
   * - INSERT éventuel dans `organization_territories` (si assignOrganizationId fourni)
   *
   * Aucune logique métier ici : les conditions d'insertion sont portées par le SQL.
   */
  public async createTerritory(payload: CreateTerritoryPayload): Promise<Territory> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // 1. INSERT principal dans territories (conversion GeoJSON → MultiPolygon 4326)
      const terrRes = await client.query(
        `INSERT INTO territories (
           territory_type_id, parent_territory_id, organization_id,
           code, name, status, metadata, created_by,
           geometry, centroid, bbox
         )
         SELECT $1, $2, $3, $4, $5, $6, $7, $8,
                ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($9)), 4326),
                ST_PointOnSurface(ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($9)), 4326)),
                ST_Envelope(ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($9)), 4326))
         RETURNING
           id,
           territory_type_id    AS "territoryTypeId",
           parent_territory_id  AS "parentTerritoryId",
           organization_id      AS "organizationId",
           code, name, status,
           metadata,
           created_by           AS "createdBy",
           created_at           AS "createdAt",
           updated_at           AS "updatedAt",
           deleted_at           AS "deletedAt",
           ST_AsGeoJSON(geometry) AS geometry,
           ST_AsGeoJSON(centroid) AS centroid,
           ST_AsGeoJSON(bbox)      AS bbox`,
        [
          payload.territoryTypeId,
          payload.parentTerritoryId ?? null,
          payload.organizationId ?? null,
          payload.code ?? null,
          payload.name,
          payload.status ?? TerritoryStatus.ACTIVE,
          JSON.stringify(payload.metadata ?? {}),
          payload.createdBy ?? null,
          payload.geometry ? JSON.stringify(payload.geometry) : null,
        ]
      );
      const territory = terrRes.rows[0] as Territory;
      const territoryId = territory.id;

      // 2. INSERT éventuel dans territory_sectors (condition dans le SQL)
      await client.query(
        `INSERT INTO territory_sectors (territory_id, name, geometry, centroid)
         SELECT $1, $2,
                ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($3)), 4326),
                ST_PointOnSurface(ST_SetSRID(ST_Multi(ST_GeomFromGeoJSON($3)), 4326))
         WHERE $1::uuid IS NOT NULL
           AND $2::text IS NOT NULL
           AND $3::text IS NOT NULL`,
        [
          territoryId,
          payload.initialSector?.name ?? null,
          payload.initialSector?.geometry ? JSON.stringify(payload.initialSector.geometry) : null,
        ]
      );

      // 3. INSERT éventuel dans organization_territories (condition dans le SQL)
      await client.query(
        `INSERT INTO organization_territories (organization_id, territory_id, is_active)
         SELECT $1, $2, TRUE
         WHERE $1::uuid IS NOT NULL`,
        [payload.assignOrganizationId ?? null, territoryId]
      );

      await client.query('COMMIT');

      // Invalidation des caches territoriaux (pattern pour toutes les pages)
      await redisCache.invalidatePattern('territory:all:*');
      if (payload.parentTerritoryId) {
        await redisCache.invalidate(`territory:children:${payload.parentTerritoryId}`);
      }

      return territory;
    } catch (error: any) {
      await client.query('ROLLBACK');
      if (error.code === '23505' && error.constraint === 'territories_code_key') {
        throw new BadRequestError(`Un territoire existe déjà avec le code "${payload.code}".`);
      }
      if (error.code === '23503') {
        throw new BadRequestError('Référence invalide : type, parent ou organisation introuvable.');
      }
      if (error.code === 'P0001') {
        throw new BadRequestError(error.message);
      }
      this.logger.error(`Erreur createTerritory: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }
}