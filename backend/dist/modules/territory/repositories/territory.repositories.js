"use strict";
/*
 * |--------------------------------------------------------------------------
 * | TERRITORY REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Territory, alignée sur le
 * | schéma 01.schema.sql. Gère territory_types, territories (récursif +
 * | PostGIS) et territory_sectors.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerritoryRepository = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const redis_service_1 = require("../../../infra/redis/redis.service");
class TerritoryRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    // ───────────────────────────────────────────────────────────────────────────
    // TERRITORY TYPES
    // ───────────────────────────────────────────────────────────────────────────
    // territory_types and territory tables are deprecated. These methods will return static/mocked values or fail safely.
    async getAllTerritoryTypes(query = {}) {
        return { data: [], total: 0, page: 1, limit: 50, totalPages: 0 };
    }
    async getTerritoryTypeByCode(code) {
        return null;
    }
    async getTerritoryTypeById(id) {
        return null;
    }
    async createTerritoryType(payload) {
        throw new appErrors_1.BadRequestError('Not supported in new 4-tier model');
    }
    async updateTerritoryType(id, payload) {
        throw new appErrors_1.BadRequestError('Not supported in new 4-tier model');
    }
    async deleteTerritoryType(id) {
        throw new appErrors_1.BadRequestError('Not supported in new 4-tier model');
    }
    // ───────────────────────────────────────────────────────────────────────────
    // TERRITORIES — lecture & création
    // ───────────────────────────────────────────────────────────────────────────
    /** Récupère un territoire par son id (UUID), géométries en GeoJSON. */
    async getTerritoryById(id) {
        try {
            const key = `territory:id:${id}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
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
                const res = await this.db.query(`${cte} SELECT * FROM all_territories WHERE id = $1 LIMIT 1`, [id]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 600); // TTL 10 minutes
        }
        catch (error) {
            this.logger.error(`Erreur getTerritoryById: ${error.message}`);
            throw error;
        }
    }
    /** Vérifie si un code de territoire est déjà utilisé. */
    async existsTerritoryByCode(code) {
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
            const res = await this.db.query(`${cte} SELECT 1 FROM all_territories WHERE code = $1 LIMIT 1`, [code]);
            return res.rowCount > 0;
        }
        catch (error) {
            this.logger.error(`Erreur existsTerritoryByCode: ${error.message}`);
            throw error;
        }
    }
    /** Récupère un territoire par son code (ex: 'BJ-OU-DON'). */
    async getTerritoryByCode(code) {
        try {
            const key = `territory:code:${code}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
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
                const res = await this.db.query(`${cte} SELECT * FROM all_territories WHERE code = $1 LIMIT 1`, [code]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 600);
        }
        catch (error) {
            this.logger.error(`Erreur getTerritoryByCode: ${error.message}`);
            throw error;
        }
    }
    async getAllTerritories(query = {}) {
        try {
            const page = Math.max(1, query.page ?? 1);
            const limit = Math.min(5000, Math.max(1, query.limit ?? 50));
            const offset = (page - 1) * limit;
            const conditions = ['1=1'];
            const params = [];
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
            return await redis_service_1.redisCache.getOrSet(key, async () => {
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
                const countRes = await this.db.query(`${cte} SELECT COUNT(*)::int AS total FROM all_territories WHERE ${where}`, params);
                const total = countRes.rows[0].total;
                params.push(limit, offset);
                const res = await this.db.query(`${cte}
           SELECT * FROM all_territories
           WHERE ${where}
           ORDER BY name ASC
           LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
                return {
                    data: res.rows,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                };
            }, 10);
        }
        catch (error) {
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
    async createTerritory(_payload) {
        // Depuis le refactoring territorial (migration 02), le découpage administratif
        // du Bénin est porté par les 4 tables regions → municipalities → districts →
        // neighborhoods, alimentées par le seed territorial. La création libre d'un
        // territoire via l'API n'est donc plus supportée (comme pour les types).
        throw new appErrors_1.BadRequestError('Not supported in new 4-tier model');
    }
}
exports.TerritoryRepository = TerritoryRepository;
//# sourceMappingURL=territory.repositories.js.map