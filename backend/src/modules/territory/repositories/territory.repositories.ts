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

  // territory_types and territory tables are deprecated. These methods will return static/mocked values or fail safely.

  public async getAllTerritoryTypes(query: PaginationQuery = {}): Promise<PaginatedResult<TerritoryType>> {
    return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }

  public async getTerritoryTypeByCode(code: string): Promise<TerritoryType | null> {
    return null;
  }

  public async getTerritoryTypeById(id: string): Promise<TerritoryType | null> {
    return null;
  }

  public async createTerritoryType(payload: CreateTerritoryTypePayload): Promise<TerritoryType> {
    throw new BadRequestError('Not supported in new 4-tier model');
  }

  public async updateTerritoryType(id: string, payload: UpdateTerritoryTypePayload): Promise<TerritoryType | null> {
    throw new BadRequestError('Not supported in new 4-tier model');
  }

  public async deleteTerritoryType(id: string): Promise<void> {
    throw new BadRequestError('Not supported in new 4-tier model');
  }

  // ───────────────────────────────────────────────────────────────────────────
  // TERRITORIES — lecture & création
  // ───────────────────────────────────────────────────────────────────────────

  /** Récupère un territoire par son id (UUID), géométries en GeoJSON. */
  public async getTerritoryById(id: string): Promise<Territory | null> {
    try {
      const key = `territory:id:${id}`;
      return await redisCache.getOrSet(key, async () => {
        const cte = `
          WITH all_territories AS (
            SELECT id, 'DEPARTMENT' as "territoryTypeCode", 'Département' as "territoryTypeName", NULL::uuid as "parentTerritoryId", code, name, 'ACTIVE' as status, ST_AsGeoJSON(geometry) as geometry FROM regions
            UNION ALL
            SELECT id, 'COMMUNE' as "territoryTypeCode", 'Commune' as "territoryTypeName", region_id as "parentTerritoryId", code, name, 'ACTIVE' as status, ST_AsGeoJSON(geometry) as geometry FROM municipalities
            UNION ALL
            SELECT id, 'ARRONDISSEMENT' as "territoryTypeCode", 'Arrondissement' as "territoryTypeName", municipality_id as "parentTerritoryId", code, name, 'ACTIVE' as status, ST_AsGeoJSON(geometry) as geometry FROM districts
            UNION ALL
            SELECT id, 'QUARTIER' as "territoryTypeCode", 'Quartier' as "territoryTypeName", district_id as "parentTerritoryId", code, name, 'ACTIVE' as status, NULL as geometry FROM neighborhoods
          )
        `;
        const res = await this.db.query(
          `${cte} SELECT * FROM all_territories WHERE id = $1 LIMIT 1`,
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
      const cte = `
        WITH all_territories AS (
          SELECT id, code FROM regions
          UNION ALL
          SELECT id, code FROM municipalities
          UNION ALL
          SELECT id, code FROM districts
          UNION ALL
          SELECT id, code FROM neighborhoods
        )
      `;
      const res = await this.db.query(
        `${cte} SELECT 1 FROM all_territories WHERE code = $1 LIMIT 1`,
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
        const cte = `
          WITH all_territories AS (
            SELECT id, 'DEPARTMENT' as "territoryTypeCode", 'Département' as "territoryTypeName", NULL::uuid as "parentTerritoryId", code, name, 'ACTIVE' as status, ST_AsGeoJSON(geometry) as geometry FROM regions
            UNION ALL
            SELECT id, 'COMMUNE' as "territoryTypeCode", 'Commune' as "territoryTypeName", region_id as "parentTerritoryId", code, name, 'ACTIVE' as status, ST_AsGeoJSON(geometry) as geometry FROM municipalities
            UNION ALL
            SELECT id, 'ARRONDISSEMENT' as "territoryTypeCode", 'Arrondissement' as "territoryTypeName", municipality_id as "parentTerritoryId", code, name, 'ACTIVE' as status, ST_AsGeoJSON(geometry) as geometry FROM districts
            UNION ALL
            SELECT id, 'QUARTIER' as "territoryTypeCode", 'Quartier' as "territoryTypeName", district_id as "parentTerritoryId", code, name, 'ACTIVE' as status, NULL as geometry FROM neighborhoods
          )
        `;
        const res = await this.db.query(
          `${cte} SELECT * FROM all_territories WHERE code = $1 LIMIT 1`,
          [code]
        );
        return res.rowCount > 0 ? (res.rows[0] as Territory) : null;
      }, 600);
    } catch (error: any) {
      this.logger.error(`Erreur getTerritoryByCode: ${error.message}`);
      throw error;
    }
  }

  public async getAllTerritories(
    query: PaginationQuery & { search?: string; territoryTypeId?: string; parentTerritoryId?: string; territoryTypeCode?: string; filters?: { forcedTerritoryId?: string; forcedCreatedBy?: string; forcedUserIdForTeamScopes?: string } } = {}
  ): Promise<PaginatedResult<Territory>> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(5000, Math.max(1, query.limit ?? 50));
      const offset = (page - 1) * limit;

      const conditions: string[] = ['1=1'];
      const params: any[] = [];

      if (query.territoryTypeCode) {
        params.push(query.territoryTypeCode);
        conditions.push(`"territoryTypeCode" = $${params.length}`);
      }
      if (query.parentTerritoryId) {
        params.push(query.parentTerritoryId);
        conditions.push(`"parentTerritoryId" = $${params.length}`);
      }
      if (query.search) {
        params.push(`%${query.search}%`);
        conditions.push(`(name ILIKE $${params.length} OR code ILIKE $${params.length})`);
      }

      const where = conditions.join(' AND ');

      const key = `territory:all:${page}:${limit}:${query.territoryTypeId ?? ''}:${query.territoryTypeCode ?? ''}:${query.parentTerritoryId ?? ''}:${query.search ?? ''}:${JSON.stringify(query.filters || {})}`;
      return await redisCache.getOrSet(key, async () => {
        const cte = `
          WITH all_territories AS (
            SELECT id, 'DEPARTMENT' as "territoryTypeCode", 'Département' as "territoryTypeName", NULL::uuid as "parentTerritoryId", code, name, 'ACTIVE' as status, ST_AsGeoJSON(geometry) as geometry FROM regions
            UNION ALL
            SELECT id, 'COMMUNE' as "territoryTypeCode", 'Commune' as "territoryTypeName", region_id as "parentTerritoryId", code, name, 'ACTIVE' as status, ST_AsGeoJSON(geometry) as geometry FROM municipalities
            UNION ALL
            SELECT id, 'ARRONDISSEMENT' as "territoryTypeCode", 'Arrondissement' as "territoryTypeName", municipality_id as "parentTerritoryId", code, name, 'ACTIVE' as status, ST_AsGeoJSON(geometry) as geometry FROM districts
            UNION ALL
            SELECT id, 'QUARTIER' as "territoryTypeCode", 'Quartier' as "territoryTypeName", district_id as "parentTerritoryId", code, name, 'ACTIVE' as status, NULL as geometry FROM neighborhoods
          )
        `;

        const countRes = await this.db.query(
          `${cte} SELECT COUNT(*)::int AS total FROM all_territories WHERE ${where}`,
          params
        );
        const total = countRes.rows[0].total as number;

        params.push(limit, offset);
        const res = await this.db.query(
          `${cte}
           SELECT * FROM all_territories
           WHERE ${where}
           ORDER BY name ASC
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
      }, 10);
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
  public async createTerritory(_payload: CreateTerritoryPayload): Promise<Territory> {
    // Depuis le refactoring territorial (migration 02), le découpage administratif
    // du Bénin est porté par les 4 tables regions → municipalities → districts →
    // neighborhoods, alimentées par le seed territorial. La création libre d'un
    // territoire via l'API n'est donc plus supportée (comme pour les types).
    throw new BadRequestError('Not supported in new 4-tier model');
  }
}