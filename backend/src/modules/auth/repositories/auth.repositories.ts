/*
|--------------------------------------------------------------------------
| AUTH REPOSITORY
|--------------------------------------------------------------------------
| Couche d'accès aux données pour le module Auth, alignée sur le nouveau
| schéma (01.schema.sql). Gère auth, roles, credentials, account_status.
|--------------------------------------------------------------------------
*/

import { randomInt } from 'crypto';
import type { Logger } from 'winston';
import PostgresDatabase from '../../../config/database/postgres';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';

import type {
  AuthUser,
  CreateUserPayload,
  CreateOtpPayload,
  CreateSessionPayload
} from '../types/auth.types';
import { OtpType } from '../types/auth.enums';
import { redisCache } from '../../../infra/redis/redis.service';

export class AuthRepository {
  constructor(
    private readonly db: PostgresDatabase,
    private readonly logger: Logger,
  ) {}

  // ───────────────────────────────────────────────────────────────────────────
  // ROLES
  // ───────────────────────────────────────────────────────────────────────────

  public async getRoleByCode(code: string): Promise<any> {
    try {
      const key = `auth:role:${code}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          'SELECT id, code, name, tier, can_manage_users as "canManageUsers" FROM roles WHERE code = $1 LIMIT 1',
          [code]
        );
        return res.rowCount > 0 ? res.rows[0] : null;
      }, 86400); // TTL 24 heures
    } catch (error: any) {
      this.logger.error(`Erreur getRoleByCode: ${error.message}`);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // USERS & CREDENTIALS
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Crée un utilisateur de bout en bout en base de données.
   * Utilise une transaction pour insérer dans : auth, credentials, account_status.
   */
  public async createUser(payload: CreateUserPayload): Promise<AuthUser> {
    const client = await this.db.getClient();

    try {
      await client.query('BEGIN');

      // 1. Création de l'entité Auth
      const authRes = await client.query(
        `INSERT INTO auth (full_name, email, phone, role_id, territory_id, organization_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, created_at, updated_at`,
        [
          payload.fullName,
          payload.email.toLowerCase(),
          payload.phone || null,
          payload.roleId,
          payload.territoryId || null,
          payload.organizationId || null,
        ]
      );
      const auth = authRes.rows[0];

      // 2. Création des Credentials
      await client.query(
        `INSERT INTO credentials (auth_id, password_hash)
         VALUES ($1, $2)`,
        [auth.id, payload.passwordHash]
      );

      // 3. Statut du compte — la ligne est auto-créée par le trigger
      //    trg_init_account_status (AFTER INSERT ON auth) avec
      //    is_active=TRUE, is_verified=FALSE. On force is_active=false
      //    en attente de vérification OTP.
      const statusRes = await client.query(
        `UPDATE account_status SET is_active = false, updated_at = NOW()
         WHERE auth_id = $1
         RETURNING is_active, is_verified`,
        [auth.id]
      );
      const status = statusRes.rows[0];

      await client.query('COMMIT');

      // 4. Invalider le cache de la liste des utilisateurs
      await redisCache.invalidatePattern('auth:users:all:*').catch(() => { /* non bloquant */ });

      // 5. Retourner les identifiants et le statut
      // (Le service métier hydrate le champ role)
      return {
        id: auth.id,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone || null,
        territoryId: payload.territoryId || null,
        organizationId: payload.organizationId || null,
        isActive: status.is_active,
        isVerified: status.is_verified,
        role: null as any,
        createdAt: auth.created_at,
        updatedAt: auth.updated_at,
      };

    } catch (error: any) {
      await client.query('ROLLBACK');
      
      // Gestion des conflits (Ex: Email déjà pris)
      if (error.code === '23505') { 
        if (error.constraint === 'auth_email_key') {
          throw new BadRequestError('Un compte existe déjà avec cet email.');
        }
        if (error.constraint === 'auth_phone_key') {
          throw new BadRequestError('Un compte existe déjà avec ce numéro de téléphone.');
        }
      }
      // Gestion des erreurs déclenchées par les triggers (RAISE EXCEPTION dans PostgreSQL)
      if (error.code === 'P0001') {
        throw new BadRequestError(error.message);
      }
      
      this.logger.error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // OTP
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Crée ou remplace un OTP pour un utilisateur et un type donné.
   * ON CONFLICT remplace le code existant (cas de renvoi du code).
   */
  public async saveOtp(payload: CreateOtpPayload): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO otp_codes (auth_id, code, type, expires_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (auth_id) DO UPDATE
           SET code = EXCLUDED.code,
               type = EXCLUDED.type,
               expires_at = EXCLUDED.expires_at,
               updated_at = NOW()`,
        [payload.authId, payload.codeHash, payload.type, payload.expiresAt]
      );
    } catch (error: any) {
      this.logger.error(`Erreur saveOtp: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère un OTP valide (non expiré) pour un utilisateur.
   */
  public async getValidOtp(authId: string, type: OtpType): Promise<{ codeHash: string; expiresAt: Date } | null> {
    try {
      const res = await this.db.query(
        `SELECT code AS "codeHash", expires_at AS "expiresAt"
         FROM otp_codes
         WHERE auth_id = $1
           AND type = $2
           AND expires_at > NOW()
         LIMIT 1`,
        [authId, type]
      );
      return res.rowCount > 0 ? res.rows[0] : null;
    } catch (error: any) {
      this.logger.error(`Erreur getValidOtp: ${error.message}`);
      throw error;
    }
  }

  /**
   * Active un compte, enregistre son mot de passe (choisi à l'activation)
   * et supprime le code OTP utilisé. Transaction atomique.
   */
  public async activateAccountWithPassword(authId: string, passwordHash: string): Promise<void> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');
      // 1. Mettre à jour le mot de passe de l'utilisateur
      await client.query(
        `UPDATE credentials SET password_hash = $1 WHERE auth_id = $2`,
        [passwordHash, authId]
      );
      // 2. Activer le compte
      await client.query(
        `UPDATE account_status SET is_verified = true, is_active = true, updated_at = NOW() WHERE auth_id = $1`,
        [authId]
      );
      // 3. Supprimer le code OTP utilisé
      await client.query(`DELETE FROM otp_codes WHERE auth_id = $1`, [authId]);
      await client.query('COMMIT');

      // Invalidation du cache du statut
      await redisCache.invalidate(`auth:status:${authId}`);
    } catch (error: any) {
      await client.query('ROLLBACK');
      this.logger.error(`Erreur activateAccountWithPassword: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  public async toggleUserActive(authId: string): Promise<boolean> {
    try {
      const res = await this.db.query(
        `UPDATE account_status 
         SET is_active = NOT is_active, updated_at = NOW() 
         WHERE auth_id = $1 
         RETURNING is_active`,
        [authId]
      );

      if (res.rowCount === 0) {
        throw new NotFoundError('Utilisateur introuvable.');
      }

      await redisCache.invalidate(`auth:status:${authId}`);
      // Invalider aussi d'autres caches si nécessaire
      await redisCache.invalidatePattern('auth:users:all:*');

      return res.rows[0].is_active;
    } catch (error: any) {
      this.logger.error(`Erreur toggleUserActive: ${error.message}`);
      throw error;
    }
  }

  public async findAuthByEmail(email: string): Promise<{ id: string; fullName: string, email: string, roleName?: string } | null> {
    try {
      const normalizedEmail = email.toLowerCase();
      const key = `auth:user:email:${normalizedEmail}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT a.id, a.full_name AS "fullName", a.email, r.name AS "roleName" 
           FROM auth a
           LEFT JOIN roles r ON a.role_id = r.id
           WHERE a.email = $1 LIMIT 1`,
          [normalizedEmail]
        );
        return res.rowCount > 0 ? res.rows[0] : null;
      }, 900); // TTL 15 minutes
    } catch (error: any) {
      this.logger.error(`Erreur findAuthByEmail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère toutes les données nécessaires pour le login (auth + credentials + status + role).
   */
  public async findAuthForLogin(email: string): Promise<any | null> {
    try {
      const res = await this.db.query(
        `SELECT 
           a.id, a.full_name AS "fullName", a.email, a.territory_id AS "territoryId", a.organization_id AS "organizationId",
           c.password_hash AS "passwordHash",
           s.is_active AS "isActive", s.is_verified AS "isVerified",
           r.code AS "roleCode", r.name AS "roleName", r.tier AS "roleTier"
         FROM auth a
         INNER JOIN credentials c ON a.id = c.auth_id
         INNER JOIN account_status s ON a.id = s.auth_id
         INNER JOIN roles r ON a.role_id = r.id
         WHERE a.email = $1 LIMIT 1`,
        [email.toLowerCase()]
      );
      return res.rowCount > 0 ? res.rows[0] : null;
    } catch (error: any) {
      this.logger.error(`Erreur findAuthForLogin: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère toutes les données nécessaires pour recréer un Access Token via Refresh Token.
   */
  public async findAuthByIdForToken(authId: string): Promise<any | null> {
    try {
      const res = await this.db.query(
        `SELECT 
           a.id, a.full_name AS "fullName", a.email, a.territory_id AS "territoryId", a.organization_id AS "organizationId",
           s.is_active AS "isActive", s.is_verified AS "isVerified",
           r.code AS "roleCode", r.name AS "roleName", r.tier AS "roleTier",
           a.created_at AS "createdAt", a.updated_at AS "updatedAt"
         FROM auth a
         INNER JOIN account_status s ON a.id = s.auth_id
         INNER JOIN roles r ON a.role_id = r.id
         WHERE a.id = $1 LIMIT 1`,
        [authId]
      );
      return res.rowCount > 0 ? res.rows[0] : null;
    } catch (error: any) {
      this.logger.error(`Erreur findAuthByIdForToken: ${error.message}`);
      throw error;
    }
  }

  /**
   * Récupère uniquement le statut du compte.
   */
  public async findAuthStatus(authId: string): Promise<{ isActive: boolean; isVerified: boolean } | null> {
    try {
      const key = `auth:status:${authId}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `SELECT is_active AS "isActive", is_verified AS "isVerified" FROM account_status WHERE auth_id = $1 LIMIT 1`,
          [authId]
        );
        return res.rowCount > 0 ? res.rows[0] : null;
      }, 900); // TTL 15 minutes
    } catch (error: any) {
      this.logger.error(`Erreur findAuthStatus: ${error.message}`);
      throw error;
    }
  }

  /**
   * Vérifie si un compte existe déjà avec cet email ou ce téléphone.
   */
  public async checkUserExistence(email: string, phone?: string): Promise<{ exists: boolean; reason?: string }> {
    try {
      const params: any[] = [email.toLowerCase()];
      let query = `SELECT id, email, phone FROM auth WHERE email = $1`;

      if (phone) {
        query += ` OR phone = $2`;
        params.push(phone);
      }
      
      query += ` LIMIT 1`;

      const res = await this.db.query(query, params);
      if (res.rowCount > 0) {
        const user = res.rows[0];
        if (user.email === email.toLowerCase()) {
          return { exists: true, reason: 'Un compte existe déjà avec cet email.' };
        }
        if (phone && user.phone === phone) {
          return { exists: true, reason: 'Un compte existe déjà avec ce numéro de téléphone.' };
        }
      }
      
      return { exists: false };
    } catch (error: any) {
      this.logger.error(`Erreur checkUserExistence: ${error.message}`);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // USERS — LISTE ADMIN (lecture seule)
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Récupère la liste paginée des utilisateurs avec leurs rôles, statuts
   * et territoires (pour l'administration des utilisateurs).
   */
  public async getAllUsers(query: { page?: number; limit?: number } = {}): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 50));
      const offset = (page - 1) * limit;

      const key = `auth:users:all:${page}:${limit}`;
      return await redisCache.getOrSet(key, async () => {
        const countRes = await this.db.query(
          `SELECT COUNT(*)::int AS total FROM auth`
        );
        const total = countRes.rows[0].total as number;

        const res = await this.db.query(
          `SELECT
             a.id,
             a.full_name AS "fullName",
             a.email,
             a.phone,
             a.role_id AS "roleId",
             r.name AS "roleName",
             r.code AS "roleCode",
             a.territory_id AS "territoryId",
             t.name AS "territoryName",
             a.organization_id AS "organizationId",
             s.is_active AS "isActive",
             s.is_verified AS "isVerified",
             a.created_at AS "createdAt",
             a.updated_at AS "updatedAt"
           FROM auth a
           INNER JOIN roles r ON a.role_id = r.id
           LEFT JOIN account_status s ON a.id = s.auth_id
           LEFT JOIN territories t ON a.territory_id = t.id
           ORDER BY a.created_at DESC
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        );

        return {
          data: res.rows as any[],
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }, 3600); // TTL 1 heure
    } catch (error: any) {
      this.logger.error(`Erreur getAllUsers: ${error.message}`);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // SESSIONS (Refresh Tokens)
  // ───────────────────────────────────────────────────────────────────────────

  public async createSession(payload: CreateSessionPayload): Promise<void> {
    try {
      await this.db.query(
        `INSERT INTO sessions (auth_id, token, expires_at) VALUES ($1, $2, $3)`,
        [payload.authId, payload.token, payload.expiresAt]
      );
    } catch (error: any) {
      this.logger.error(`Erreur createSession: ${error.message}`);
      throw error;
    }
  }

  public async findSession(token: string): Promise<{ authId: string; expiresAt: Date } | null> {
    try {
      const res = await this.db.query(
        `SELECT auth_id AS "authId", expires_at AS "expiresAt" FROM sessions WHERE token = $1 LIMIT 1`,
        [token]
      );
      return res.rowCount > 0 ? res.rows[0] : null;
    } catch (error: any) {
      this.logger.error(`Erreur findSession: ${error.message}`);
      throw error;
    }
  }

  public async deleteSession(token: string): Promise<void> {
    try {
      await this.db.query(`DELETE FROM sessions WHERE token = $1`, [token]);
    } catch (error: any) {
      this.logger.error(`Erreur deleteSession: ${error.message}`);
      throw error;
    }
  }

  public async updateSession(oldToken: string, newToken: string, newExpiresAt: Date): Promise<void> {
    try {
      await this.db.query(
        `UPDATE sessions SET token = $1, expires_at = $2, updated_at = NOW() WHERE token = $3`,
        [newToken, newExpiresAt, oldToken]
      );
    } catch (error: any) {
      this.logger.error(`Erreur updateSession: ${error.message}`);
      throw error;
    }
  }
}
