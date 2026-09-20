"use strict";
/*
 * |--------------------------------------------------------------------------
 * | SOCIETE REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Societes.
 * | Alignée sur le schéma 01.schema.sql — la table SQL reste `organizations`.
 * | Gère le CRUD des sociétés + la lecture des territoires de compétence.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocieteRepository = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const redis_service_1 = require("../../../infra/redis/redis.service");
class SocieteRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    // ───────────────────────────────────────────────────────────────────────────
    // CRUD SOCIETES
    // ───────────────────────────────────────────────────────────────────────────
    /**
     * Récupère les sociétés avec pagination (page 1-based, limit par page —
     * défauts 1 et 50). Filtre optionnel par type.
     */
    async getAllSocietes(query = {}) {
        try {
            const page = Math.max(1, query.page ?? 1);
            const limit = Math.min(100, Math.max(1, query.limit ?? 50));
            const offset = (page - 1) * limit;
            const { filters } = query;
            const conditions = [];
            const params = [];
            /** Conditions (AND) sur organization_territories.municipality_id */
            const scopeConditions = [];
            if (query.type) {
                params.push(query.type);
                conditions.push(`type = $${params.length}`);
            }
            if (filters?.forcedRegionId) {
                params.push(filters.forcedRegionId);
                scopeConditions.push(`municipality_id IN (
          SELECT mun.id FROM municipalities mun WHERE mun.region_id = $${params.length}
        )`);
            }
            if (filters?.forcedMunicipalityId) {
                params.push(filters.forcedMunicipalityId);
                scopeConditions.push(`municipality_id = $${params.length}`);
            }
            if (filters?.forcedDistrictId) {
                params.push(filters.forcedDistrictId);
                scopeConditions.push(`municipality_id IN (
          SELECT d.municipality_id FROM districts d WHERE d.id = $${params.length}
        )`);
            }
            if (filters?.forcedNeighborhoodId) {
                params.push(filters.forcedNeighborhoodId);
                scopeConditions.push(`municipality_id IN (
          SELECT d2.municipality_id
          FROM neighborhoods nb
          INNER JOIN districts d2 ON d2.id = nb.district_id
          WHERE nb.id = $${params.length}
        )`);
            }
            // La société doit être habilitée sur au moins une commune du périmètre
            if (scopeConditions.length > 0) {
                conditions.push(`id IN (
          SELECT organization_id
          FROM organization_territories
          WHERE ${scopeConditions.join(' AND ')}
        )`);
            }
            const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
            const key = `societes:all:${page}:${limit}:${query.type ?? ''}:${JSON.stringify(filters || {})}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const countRes = await this.db.query(`SELECT COUNT(*)::int AS total FROM organizations ${where}`, params);
                const total = countRes.rows[0].total;
                params.push(limit, offset);
                const res = await this.db.query(`SELECT id, name, type,
             registration_number AS "registrationNumber",
             contact_email AS "contactEmail",
             contact_phone AS "contactPhone",
             is_active AS "isActive",
             created_at AS "createdAt",
             updated_at AS "updatedAt"
           FROM organizations
           ${where}
           ORDER BY name ASC
           LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
                return {
                    data: res.rows,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                };
            }, 3600);
        }
        catch (error) {
            this.logger.error(`Erreur getAllSocietes: ${error.message}`);
            throw error;
        }
    }
    /** Récupère une société par son id (UUID). */
    async getSocieteById(id) {
        try {
            const key = `societes:id:${id}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const res = await this.db.query(`SELECT id, name, type,
             registration_number AS "registrationNumber",
             contact_email AS "contactEmail",
             contact_phone AS "contactPhone",
             is_active AS "isActive",
             created_at AS "createdAt",
             updated_at AS "updatedAt"
           FROM organizations
           WHERE id = $1
           LIMIT 1`, [id]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 3600);
        }
        catch (error) {
            this.logger.error(`Erreur getSocieteById: ${error.message}`);
            throw error;
        }
    }
    /** Récupère une société par son numéro d'enregistrement. */
    async getSocieteByRegistrationNumber(registrationNumber) {
        try {
            const key = `societes:registration:${registrationNumber}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const res = await this.db.query(`SELECT id, name, type,
             registration_number AS "registrationNumber",
             contact_email AS "contactEmail",
             contact_phone AS "contactPhone",
             is_active AS "isActive",
             created_at AS "createdAt",
             updated_at AS "updatedAt"
           FROM organizations
           WHERE registration_number = $1
           LIMIT 1`, [registrationNumber]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 3600);
        }
        catch (error) {
            this.logger.error(`Erreur getSocieteByRegistrationNumber: ${error.message}`);
            throw error;
        }
    }
    /** Crée une société (transaction + invalidation cache). */
    async createSociete(payload) {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            const res = await client.query(`INSERT INTO organizations (
           name, type, registration_number, contact_email, contact_phone, is_active
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING
           id, name, type,
           registration_number AS "registrationNumber",
           contact_email AS "contactEmail",
           contact_phone AS "contactPhone",
           is_active AS "isActive",
           created_at AS "createdAt",
           updated_at AS "updatedAt"`, [
                payload.name,
                payload.type,
                payload.registrationNumber ?? null,
                payload.contactEmail ?? null,
                payload.contactPhone ?? null,
                payload.isActive ?? true,
            ]);
            const societe = res.rows[0];
            const societeId = societe.id;
            // Association optionnelle à une commune (zone de compétence de la société)
            // — table organization_territories
            if (payload.municipalityId) {
                await client.query(`INSERT INTO organization_territories (organization_id, municipality_id, is_active)
           VALUES ($1, $2, TRUE)
           ON CONFLICT (organization_id, municipality_id) DO NOTHING`, [societeId, payload.municipalityId]);
            }
            await client.query('COMMIT');
            await redis_service_1.redisCache.invalidatePattern('societes:all:*');
            if (payload.municipalityId) {
                await redis_service_1.redisCache.invalidate(`societes:territories:${societeId}`);
            }
            return societe;
        }
        catch (error) {
            await client.query('ROLLBACK');
            if (error.code === '23505' && error.constraint === 'organizations_registration_number_key') {
                throw new appErrors_1.BadRequestError(`Une société existe déjà avec le n° d'enregistrement "${payload.registrationNumber}".`);
            }
            if (error.code === '23503') {
                throw new appErrors_1.BadRequestError('Territoire d\'association introuvable ou invalide.');
            }
            this.logger.error(`Erreur createSociete: ${error.message}`);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /** Met à jour une société. */
    async updateSociete(id, payload) {
        try {
            const res = await this.db.query(`UPDATE organizations
         SET name = COALESCE($1, name),
             type = COALESCE($2, type),
             registration_number = COALESCE($3, registration_number),
             contact_email = COALESCE($4, contact_email),
             contact_phone = COALESCE($5, contact_phone),
             is_active = COALESCE($6, is_active)
         WHERE id = $7
         RETURNING
           id, name, type,
           registration_number AS "registrationNumber",
           contact_email AS "contactEmail",
           contact_phone AS "contactPhone",
           is_active AS "isActive",
           created_at AS "createdAt",
           updated_at AS "updatedAt"`, [
                payload.name ?? null,
                payload.type ?? null,
                payload.registrationNumber ?? null,
                payload.contactEmail ?? null,
                payload.contactPhone ?? null,
                payload.isActive ?? null,
                id,
            ]);
            if (res.rowCount === 0) {
                throw new appErrors_1.NotFoundError('Société introuvable.');
            }
            await redis_service_1.redisCache.invalidatePattern('societes:all:*');
            await redis_service_1.redisCache.invalidate(`societes:id:${id}`);
            if (payload.registrationNumber) {
                await redis_service_1.redisCache.invalidate(`societes:registration:${payload.registrationNumber}`);
            }
            return res.rows[0];
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur updateSociete: ${error.message}`);
            throw error;
        }
    }
    async deleteSociete(id) {
        try {
            // Désactivation (soft delete) au lieu d'une suppression physique
            // pour éviter les erreurs de clés étrangères (missions, interventions...)
            const res = await this.db.query(`UPDATE organizations SET is_active = false, updated_at = NOW() WHERE id = $1`, [id]);
            if ((res.rowCount ?? 0) === 0) {
                throw new appErrors_1.NotFoundError('Société introuvable.');
            }
            await redis_service_1.redisCache.invalidatePattern('societes:all:*');
            await redis_service_1.redisCache.invalidate(`societes:id:${id}`);
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur deleteSociete: ${error.message}`);
            throw error;
        }
    }
    // ───────────────────────────────────────────────────────────────────────────
    // TERRITOIRES DE COMPÉTENCE
    // ───────────────────────────────────────────────────────────────────────────
    /** Récupère les territoires de compétence d'une société. */
    async getSocieteTerritories(societeId) {
        try {
            const key = `societes:territories:${societeId}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const res = await this.db.query(`SELECT ot.id,
             ot.organization_id AS "societeId",
             ot.municipality_id AS "municipalityId",
             ot.is_active AS "isActive"
           FROM organization_territories ot
           WHERE ot.organization_id = $1
           ORDER BY ot.created_at ASC`, [societeId]);
                return res.rows;
            }, 3600);
        }
        catch (error) {
            this.logger.error(`Erreur getSocieteTerritories: ${error.message}`);
            throw error;
        }
    }
}
exports.SocieteRepository = SocieteRepository;
//# sourceMappingURL=societe.repositories.js.map