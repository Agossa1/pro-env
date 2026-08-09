"use strict";
/*
 * |--------------------------------------------------------------------------
 * | ROLE REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Roles, alignée sur le
 * | schéma 01.schema.sql. Gère la table `roles`.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRepository = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const redis_service_1 = require("../../../infra/redis/redis.service");
class RoleRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    // ───────────────────────────────────────────────────────────────────────────
    // ROLES — CRUD
    // ───────────────────────────────────────────────────────────────────────────
    /**
     * Récupère les rôles avec pagination (page 1-based, limit par page —
     * défauts 1 et 50).
     */
    async getAllRoles(query = {}) {
        try {
            const page = Math.max(1, query.page ?? 1);
            const limit = Math.min(100, Math.max(1, query.limit ?? 50));
            const offset = (page - 1) * limit;
            const key = `roles:all:${page}:${limit}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const countRes = await this.db.query(`SELECT COUNT(*)::int AS total FROM roles`);
                const total = countRes.rows[0].total;
                const res = await this.db.query(`SELECT id, code, name, description, tier,
             route_prefix AS "routePrefix",
             dashboard_path AS "dashboardPath",
             page_ids AS "pageIds",
             can_manage_users AS "canManageUsers",
             can_manage_roles AS "canManageRoles",
             created_at AS "createdAt",
             updated_at AS "updatedAt"
           FROM roles
           ORDER BY name ASC
           LIMIT $1 OFFSET $2`, [limit, offset]);
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
            this.logger.error(`Erreur getAllRoles: ${error.message}`);
            throw error;
        }
    }
    /** Récupère un rôle par son id (UUID). */
    async getRoleById(id) {
        try {
            const key = `roles:id:${id}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const res = await this.db.query(`SELECT id, code, name, description, tier,
             route_prefix AS "routePrefix",
             dashboard_path AS "dashboardPath",
             page_ids AS "pageIds",
             can_manage_users AS "canManageUsers",
             can_manage_roles AS "canManageRoles",
             created_at AS "createdAt",
             updated_at AS "updatedAt"
           FROM roles
           WHERE id = $1
           LIMIT 1`, [id]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 3600);
        }
        catch (error) {
            this.logger.error(`Erreur getRoleById: ${error.message}`);
            throw error;
        }
    }
    /** Récupère un rôle par son code (ex: 'super_admin'). */
    async getRoleByCode(code) {
        try {
            const key = `roles:code:${code}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const res = await this.db.query(`SELECT id, code, name, description, tier,
             route_prefix AS "routePrefix",
             dashboard_path AS "dashboardPath",
             page_ids AS "pageIds",
             can_manage_users AS "canManageUsers",
             can_manage_roles AS "canManageRoles",
             created_at AS "createdAt",
             updated_at AS "updatedAt"
           FROM roles
           WHERE code = $1
           LIMIT 1`, [code]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 3600);
        }
        catch (error) {
            this.logger.error(`Erreur getRoleByCode: ${error.message}`);
            throw error;
        }
    }
    /** Crée un rôle (transaction + invalidation cache). */
    async createRole(payload) {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            const res = await client.query(`INSERT INTO roles (
           code, name, description, tier,
           route_prefix, dashboard_path, page_ids,
           can_manage_users, can_manage_roles
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING
           id, code, name, description, tier,
           route_prefix AS "routePrefix",
           dashboard_path AS "dashboardPath",
           page_ids AS "pageIds",
           can_manage_users AS "canManageUsers",
           can_manage_roles AS "canManageRoles",
           created_at AS "createdAt",
           updated_at AS "updatedAt"`, [
                payload.code,
                payload.name,
                payload.description ?? null,
                payload.tier ?? null,
                payload.routePrefix ?? null,
                payload.dashboardPath ?? null,
                JSON.stringify(payload.pageIds ?? []),
                payload.canManageUsers ?? false,
                payload.canManageRoles ?? false,
            ]);
            await client.query('COMMIT');
            await redis_service_1.redisCache.invalidatePattern('roles:all:*');
            return res.rows[0];
        }
        catch (error) {
            await client.query('ROLLBACK');
            if (error.code === '23505' && error.constraint === 'roles_code_key') {
                throw new appErrors_1.BadRequestError(`Un rôle existe déjà avec le code "${payload.code}".`);
            }
            this.logger.error(`Erreur createRole: ${error.message}`);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /** Met à jour un rôle. */
    async updateRole(id, payload) {
        try {
            const res = await this.db.query(`UPDATE roles
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             tier = COALESCE($3, tier),
             route_prefix = COALESCE($4, route_prefix),
             dashboard_path = COALESCE($5, dashboard_path),
             page_ids = COALESCE($6, page_ids),
             can_manage_users = COALESCE($7, can_manage_users),
             can_manage_roles = COALESCE($8, can_manage_roles)
         WHERE id = $9
         RETURNING
           id, code, name, description, tier,
           route_prefix AS "routePrefix",
           dashboard_path AS "dashboardPath",
           page_ids AS "pageIds",
           can_manage_users AS "canManageUsers",
           can_manage_roles AS "canManageRoles",
           created_at AS "createdAt",
           updated_at AS "updatedAt"`, [
                payload.name ?? null,
                payload.description ?? null,
                payload.tier ?? null,
                payload.routePrefix ?? null,
                payload.dashboardPath ?? null,
                payload.pageIds ? JSON.stringify(payload.pageIds) : null,
                payload.canManageUsers ?? null,
                payload.canManageRoles ?? null,
                id,
            ]);
            if (res.rowCount === 0) {
                throw new appErrors_1.NotFoundError('Rôle introuvable.');
            }
            await redis_service_1.redisCache.invalidatePattern('roles:all:*');
            await redis_service_1.redisCache.invalidate(`roles:id:${id}`);
            // Invalider aussi le cache auth qui stocke le rôle par code
            await redis_service_1.redisCache.invalidatePattern('auth:role:*');
            return res.rows[0];
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur updateRole: ${error.message}`);
            throw error;
        }
    }
    /** Compte le nombre d'utilisateurs rattachés à un rôle. */
    async countUsersByRole(roleId) {
        try {
            const res = await this.db.query(`SELECT COUNT(*)::int AS total FROM auth WHERE role_id = $1`, [roleId]);
            return res.rows[0].total;
        }
        catch (error) {
            this.logger.error(`Erreur countUsersByRole: ${error.message}`);
            throw error;
        }
    }
    /** Supprime un rôle (RESTRICT si des utilisateurs y sont rattachés). */
    async deleteRole(id) {
        try {
            const userCount = await this.countUsersByRole(id);
            if (userCount > 0) {
                throw new appErrors_1.BadRequestError(`Impossible de supprimer ce rôle : ${userCount} utilisateur(s) y sont encore rattachés.`);
            }
            const res = await this.db.query(`DELETE FROM roles WHERE id = $1`, [id]);
            if ((res.rowCount ?? 0) === 0) {
                throw new appErrors_1.NotFoundError('Rôle introuvable.');
            }
            await redis_service_1.redisCache.invalidatePattern('roles:all:*');
            await redis_service_1.redisCache.invalidate(`roles:id:${id}`);
            await redis_service_1.redisCache.invalidatePattern('auth:role:*');
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            if (error.code === '23503') {
                throw new appErrors_1.BadRequestError('Impossible de supprimer ce rôle : des références y sont encore rattachées.');
            }
            this.logger.error(`Erreur deleteRole: ${error.message}`);
            throw error;
        }
    }
}
exports.RoleRepository = RoleRepository;
//# sourceMappingURL=role.repositories.js.map