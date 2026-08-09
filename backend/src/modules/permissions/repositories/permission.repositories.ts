/*
 * |--------------------------------------------------------------------------
 * | PERMISSION REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Permissions, alignée sur le
 * | schéma 01.schema.sql. Gère `permissions` et `role_permissions` (N:N).
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import PostgresDatabase from '../../../config/database/postgres';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { redisCache } from '../../../infra/redis/redis.service';

import type {
  Permission,
  RolePermission,
  RoleWithPermissions,
  CreatePermissionPayload,
  UpdatePermissionPayload,
  PaginationQuery,
  PaginatedResult,
} from '../types/permission.types';

export class PermissionRepository {
  constructor(
    private readonly db: PostgresDatabase,
    private readonly logger: Logger,
  ) {}

  // ───────────────────────────────────────────────────────────────────────────
  // PERMISSIONS — CRUD
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Récupère les permissions avec pagination (page 1-based, limit par page —
   * défauts 1 et 50).
   */
  public async getAllPermissions(
    query: PaginationQuery = {}
  ): Promise<PaginatedResult<Permission>> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 50));
      const offset = (page - 1) * limit;

      const key = `permission:all:${page}:${limit}`;
      return await redisCache.getOrSet(key, async () => {
        const countRes = await this.db.query(
          `SELECT COUNT(*)::int AS total FROM permissions`
        );
        const total = countRes.rows[0].total as number;

        const res = await this.db.query(
          `SELECT id, module, action, description
           FROM permissions
           ORDER BY module ASC, action ASC
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        );

        return {
          data: res.rows as Permission[],
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }, 3600);
    } catch (error: any) {
      this.logger.error(`Erreur getAllPermissions: ${error.message}`);
      throw error;
    }
  }

  /** Récupère une permission par son id (UUID). */
  public async getPermissionById(id: string): Promise<Permission | null> {
    try {
      const key = `permission:id:${id}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT id, module, action, description
           FROM permissions
           WHERE id = $1
           LIMIT 1`,
          [id]
        );
        return res.rowCount > 0 ? (res.rows[0] as Permission) : null;
      }, 3600);
    } catch (error: any) {
      this.logger.error(`Erreur getPermissionById: ${error.message}`);
      throw error;
    }
  }

  /** Récupère une permission par son couple unique (module, action). */
  public async getPermissionByModuleAction(
    module: string,
    action: string
  ): Promise<Permission | null> {
    try {
      const key = `permission:module:${module}:action:${action}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT id, module, action, description
           FROM permissions
           WHERE module = $1 AND action = $2
           LIMIT 1`,
          [module, action]
        );
        return res.rowCount > 0 ? (res.rows[0] as Permission) : null;
      }, 3600);
    } catch (error: any) {
      this.logger.error(`Erreur getPermissionByModuleAction: ${error.message}`);
      throw error;
    }
  }

  /** Crée une permission (transaction + invalidation cache). */
  public async createPermission(payload: CreatePermissionPayload): Promise<Permission> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      const res = await client.query(
        `INSERT INTO permissions (module, action, description)
         VALUES ($1, $2, $3)
         RETURNING id, module, action, description`,
        [payload.module, payload.action, payload.description ?? null]
      );

      await client.query('COMMIT');

      await redisCache.invalidatePattern('permission:all:*');

      return res.rows[0] as Permission;
    } catch (error: any) {
      await client.query('ROLLBACK');
      if (error.code === '23505' && error.constraint === 'permissions_module_action_key') {
        throw new BadRequestError(
          `Une permission existe déjà pour "${payload.module}" / "${payload.action}".`
        );
      }
      this.logger.error(`Erreur createPermission: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /** Met à jour une permission (description uniquement). */
  public async updatePermission(
    id: string,
    payload: UpdatePermissionPayload
  ): Promise<Permission | null> {
    try {
      const res = await this.db.query(
        `UPDATE permissions
         SET description = COALESCE($1, description)
         WHERE id = $2
         RETURNING id, module, action, description`,
        [payload.description ?? null, id]
      );

      if (res.rowCount === 0) {
        throw new NotFoundError('Permission introuvable.');
      }

      await redisCache.invalidatePattern('permission:all:*');
      await redisCache.invalidate(`permission:id:${id}`);

      return res.rows[0] as Permission;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updatePermission: ${error.message}`);
      throw error;
    }
  }

  /** Supprime une permission (CASCADE sur role_permissions via FK). */
  public async deletePermission(id: string): Promise<void> {
    try {
      const res = await this.db.query(`DELETE FROM permissions WHERE id = $1`, [id]);

      if (res.rowCount === 0) {
        throw new NotFoundError('Permission introuvable.');
      }

      await redisCache.invalidatePattern('permission:all:*');
      await redisCache.invalidate(`permission:id:${id}`);
      await redisCache.invalidatePattern('permission:role:*');
      await redisCache.invalidatePattern('permission:roles-perms:*');
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur deletePermission: ${error.message}`);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ROLE PERMISSIONS — liaison N:N
  // ───────────────────────────────────────────────────────────────────────────

  /** Récupère les permissions associées à un rôle. */
  public async getPermissionsByRoleId(roleId: string): Promise<Permission[]> {
    try {
      const key = `permission:role:${roleId}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT p.id, p.module, p.action, p.description
           FROM permissions p
           JOIN role_permissions rp ON rp.permission_id = p.id
           WHERE rp.role_id = $1
           ORDER BY p.module ASC, p.action ASC`,
          [roleId]
        );
        return res.rows as Permission[];
      }, 3600);
    } catch (error: any) {
      this.logger.error(`Erreur getPermissionsByRoleId: ${error.message}`);
      throw error;
    }
  }

  /**
   * Assigne plusieurs permissions à un rôle (transaction).
   * Évite les doublons (UNIQUE role_id, permission_id) en filtrant les
   * permissions déjà assignées.
   */
  public async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[]
  ): Promise<RolePermission[]> {
    const client = await this.db.getClient();
    const created: RolePermission[] = [];
    try {
      await client.query('BEGIN');

      for (const permissionId of permissionIds) {
        const res = await client.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           SELECT $1, $2
           WHERE NOT EXISTS (
             SELECT 1 FROM role_permissions
             WHERE role_id = $1 AND permission_id = $2
           )
           RETURNING id, role_id AS "roleId", permission_id AS "permissionId"`,
          [roleId, permissionId]
        );
        if ((res.rowCount ?? 0) > 0) {
          created.push(res.rows[0] as RolePermission);
        }
      }

      await client.query('COMMIT');

      await redisCache.invalidate(`permission:role:${roleId}`);
      await redisCache.invalidatePattern('permission:roles-perms:*');

      return created;
    } catch (error: any) {
      await client.query('ROLLBACK');
      if (error.code === '23503') {
        throw new BadRequestError('Rôle ou permission introuvable.');
      }
      this.logger.error(`Erreur assignPermissionsToRole: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /** Retire une permission d'un rôle. */
  public async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    try {
      const res = await this.db.query(
        `DELETE FROM role_permissions
         WHERE role_id = $1 AND permission_id = $2`,
        [roleId, permissionId]
      );

      if ((res.rowCount ?? 0) === 0) {
        throw new NotFoundError('Cette permission n\'est pas assignée à ce rôle.');
      }

      await redisCache.invalidate(`permission:role:${roleId}`);
      await redisCache.invalidatePattern('permission:roles-perms:*');
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur removePermissionFromRole: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vérifie si un utilisateur possède une permission (module + action).
   * Jointure : auth → roles → role_permissions → permissions.
   */
  public async userHasPermission(
    userId: string,
    module: string,
    action: string
  ): Promise<boolean> {
    try {
      const key = `permission:user:${userId}:${module}:${action}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT 1
           FROM auth a
           JOIN roles r ON r.id = a.role_id
           JOIN role_permissions rp ON rp.role_id = r.id
           JOIN permissions p ON p.id = rp.permission_id
           WHERE a.id = $1
             AND p.module = $2
             AND p.action = $3
           LIMIT 1`,
          [userId, module, action]
        );
        return (res.rowCount ?? 0) > 0;
      }, 300); // TTL 5 minutes
    } catch (error: any) {
      this.logger.error(`Erreur userHasPermission: ${error.message}`);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ROLES WITH PERMISSIONS
  // ───────────────────────────────────────────────────────────────────────────

  /** Récupère tous les rôles avec leurs permissions agrégées. */
  public async getRolesWithPermissions(): Promise<RoleWithPermissions[]> {
    try {
      const key = `permission:roles-perms:all`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT
             r.id,
             r.code,
             r.name,
             r.tier,
             r.can_manage_users AS "canManageUsers",
             r.can_manage_roles AS "canManageRoles",
             COALESCE(
               json_agg(
                 json_build_object('id', p.id, 'module', p.module, 'action', p.action, 'description', p.description)
                 ORDER BY p.module ASC, p.action ASC
               ) FILTER (WHERE p.id IS NOT NULL),
               '[]'::json
             ) AS permissions
           FROM roles r
           LEFT JOIN role_permissions rp ON rp.role_id = r.id
           LEFT JOIN permissions p ON p.id = rp.permission_id
           GROUP BY r.id, r.code, r.name, r.tier, r.can_manage_users, r.can_manage_roles
           ORDER BY r.name ASC`,
          []
        );
        return res.rows as RoleWithPermissions[];
      }, 3600);
    } catch (error: any) {
      this.logger.error(`Erreur getRolesWithPermissions: ${error.message}`);
      throw error;
    }
  }
}