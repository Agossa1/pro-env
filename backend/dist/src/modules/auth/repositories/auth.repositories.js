"use strict";
/*
|--------------------------------------------------------------------------
| AUTH REPOSITORY
|--------------------------------------------------------------------------
| Couche d'accès aux données pour le module Auth, alignée sur le nouveau
| schéma (01.schema.sql). Gère auth, roles, credentials, account_status.
|--------------------------------------------------------------------------
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const appErrors_1 = require("@/shared/errors/appErrors");
const redis_service_1 = require("@/infra/redis/redis.service");
class AuthRepository {
    db;
    logger;
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    // ───────────────────────────────────────────────────────────────────────────
    // ROLES
    // ───────────────────────────────────────────────────────────────────────────
    async getRoleByCode(code) {
        try {
            const key = `auth:role:${code}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const res = await this.db.query('SELECT id, code, name, tier, can_manage_users as "canManageUsers" FROM roles WHERE code = $1 LIMIT 1', [code]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 86400); // TTL 24 heures
        }
        catch (error) {
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
    async createUser(payload) {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            // 1. Création de l'entité Auth
            const authRes = await client.query(`INSERT INTO auth (full_name, email, phone, role_id, territory_id, organization_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, created_at, updated_at`, [
                payload.fullName,
                payload.email.toLowerCase(),
                payload.phone || null,
                payload.roleId,
                payload.territoryId || null,
                payload.organizationId || null,
            ]);
            const auth = authRes.rows[0];
            // 2. Création des Credentials
            await client.query(`INSERT INTO credentials (auth_id, password_hash)
         VALUES ($1, $2)`, [auth.id, payload.passwordHash]);
            // 3. Initialisation du Statut (Inactif par défaut en attente de vérification)
            const statusRes = await client.query(`INSERT INTO account_status (auth_id, is_active, is_verified)
         VALUES ($1, false, false)
         RETURNING is_active, is_verified`, [auth.id]);
            const status = statusRes.rows[0];
            await client.query('COMMIT');
            // 4. On retourne juste les identifiants et le statut
            // (Le service métier complètera si nécessaire)
            return {
                id: auth.id,
                fullName: payload.fullName,
                email: payload.email,
                phone: payload.phone || null,
                territoryId: payload.territoryId || null,
                organizationId: payload.organizationId || null,
                isActive: status.is_active,
                isVerified: status.is_verified,
                role: {}, // À hydrater par le service si besoin
                createdAt: auth.created_at,
                updatedAt: auth.updated_at,
            };
        }
        catch (error) {
            await client.query('ROLLBACK');
            // Gestion des conflits (Ex: Email déjà pris)
            if (error.code === '23505') {
                if (error.constraint === 'auth_email_key') {
                    throw new appErrors_1.BadRequestError('Un compte existe déjà avec cet email.');
                }
                if (error.constraint === 'auth_phone_key') {
                    throw new appErrors_1.BadRequestError('Un compte existe déjà avec ce numéro de téléphone.');
                }
            }
            // Gestion des erreurs déclenchées par les triggers (RAISE EXCEPTION dans PostgreSQL)
            if (error.code === 'P0001') {
                throw new appErrors_1.BadRequestError(error.message);
            }
            this.logger.error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
            throw error;
        }
        finally {
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
    async saveOtp(payload) {
        try {
            await this.db.query(`INSERT INTO otp_codes (auth_id, code, type, expires_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (auth_id) DO UPDATE
           SET code = EXCLUDED.code,
               type = EXCLUDED.type,
               expires_at = EXCLUDED.expires_at,
               updated_at = NOW()`, [payload.authId, payload.codeHash, payload.type, payload.expiresAt]);
        }
        catch (error) {
            this.logger.error(`Erreur saveOtp: ${error.message}`);
            throw error;
        }
    }
    /**
     * Récupère un OTP valide (non expiré) pour un utilisateur.
     */
    async getValidOtp(authId, type) {
        try {
            const res = await this.db.query(`SELECT code AS "codeHash", expires_at AS "expiresAt"
         FROM otp_codes
         WHERE auth_id = $1
           AND type = $2
           AND expires_at > NOW()
         LIMIT 1`, [authId, type]);
            return res.rowCount > 0 ? res.rows[0] : null;
        }
        catch (error) {
            this.logger.error(`Erreur getValidOtp: ${error.message}`);
            throw error;
        }
    }
    /**
     * Marque un compte comme vérifié et supprime le code OTP utilisé.
     */
    async verifyAccountAndDeleteOtp(authId) {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            await client.query(`UPDATE account_status SET is_verified = true, is_active = true, updated_at = NOW() WHERE auth_id = $1`, [authId]);
            await client.query(`DELETE FROM otp_codes WHERE auth_id = $1`, [authId]);
            await client.query('COMMIT');
            // Invalidation du cache du statut pour s'assurer que le système voit le compte comme vérifié
            await redis_service_1.redisCache.invalidate(`auth:status:${authId}`);
        }
        catch (error) {
            await client.query('ROLLBACK');
            this.logger.error(`Erreur verifyAccountAndDeleteOtp: ${error.message}`);
            throw error;
        }
        finally {
            client.release();
        }
    }
    async findAuthByEmail(email) {
        try {
            const normalizedEmail = email.toLowerCase();
            const key = `auth:user:email:${normalizedEmail}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const res = await this.db.query(`SELECT a.id, a.full_name AS "fullName", a.email, r.name AS "roleName" 
           FROM auth a
           LEFT JOIN roles r ON a.role_id = r.id
           WHERE a.email = $1 LIMIT 1`, [normalizedEmail]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 900); // TTL 15 minutes
        }
        catch (error) {
            this.logger.error(`Erreur findAuthByEmail: ${error.message}`);
            throw error;
        }
    }
    /**
     * Récupère toutes les données nécessaires pour le login (auth + credentials + status + role).
     */
    async findAuthForLogin(email) {
        try {
            const res = await this.db.query(`SELECT 
           a.id, a.full_name AS "fullName", a.email, a.territory_id AS "territoryId", a.organization_id AS "organizationId",
           c.password_hash AS "passwordHash",
           s.is_active AS "isActive", s.is_verified AS "isVerified",
           r.code AS "roleCode", r.tier AS "roleTier"
         FROM auth a
         INNER JOIN credentials c ON a.id = c.auth_id
         INNER JOIN account_status s ON a.id = s.auth_id
         INNER JOIN roles r ON a.role_id = r.id
         WHERE a.email = $1 LIMIT 1`, [email.toLowerCase()]);
            return res.rowCount > 0 ? res.rows[0] : null;
        }
        catch (error) {
            this.logger.error(`Erreur findAuthForLogin: ${error.message}`);
            throw error;
        }
    }
    /**
     * Récupère toutes les données nécessaires pour recréer un Access Token via Refresh Token.
     */
    async findAuthByIdForToken(authId) {
        try {
            const res = await this.db.query(`SELECT 
           a.id, a.email, a.territory_id AS "territoryId", a.organization_id AS "organizationId",
           s.is_active AS "isActive", s.is_verified AS "isVerified",
           r.code AS "roleCode", r.tier AS "roleTier"
         FROM auth a
         INNER JOIN account_status s ON a.id = s.auth_id
         INNER JOIN roles r ON a.role_id = r.id
         WHERE a.id = $1 LIMIT 1`, [authId]);
            return res.rowCount > 0 ? res.rows[0] : null;
        }
        catch (error) {
            this.logger.error(`Erreur findAuthByIdForToken: ${error.message}`);
            throw error;
        }
    }
    /**
     * Récupère uniquement le statut du compte.
     */
    async findAuthStatus(authId) {
        try {
            const key = `auth:status:${authId}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const res = await this.db.query(`SELECT is_active AS "isActive", is_verified AS "isVerified" FROM account_status WHERE auth_id = $1 LIMIT 1`, [authId]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 900); // TTL 15 minutes
        }
        catch (error) {
            this.logger.error(`Erreur findAuthStatus: ${error.message}`);
            throw error;
        }
    }
    /**
     * Vérifie si un compte existe déjà avec cet email ou ce téléphone.
     */
    async checkUserExistence(email, phone) {
        try {
            const params = [email.toLowerCase()];
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
        }
        catch (error) {
            this.logger.error(`Erreur checkUserExistence: ${error.message}`);
            throw error;
        }
    }
    // ───────────────────────────────────────────────────────────────────────────
    // SESSIONS (Refresh Tokens)
    // ───────────────────────────────────────────────────────────────────────────
    async createSession(payload) {
        try {
            await this.db.query(`INSERT INTO sessions (auth_id, token, expires_at) VALUES ($1, $2, $3)`, [payload.authId, payload.token, payload.expiresAt]);
        }
        catch (error) {
            this.logger.error(`Erreur createSession: ${error.message}`);
            throw error;
        }
    }
    async findSession(token) {
        try {
            const res = await this.db.query(`SELECT auth_id AS "authId", expires_at AS "expiresAt" FROM sessions WHERE token = $1 LIMIT 1`, [token]);
            return res.rowCount > 0 ? res.rows[0] : null;
        }
        catch (error) {
            this.logger.error(`Erreur findSession: ${error.message}`);
            throw error;
        }
    }
    async deleteSession(token) {
        try {
            await this.db.query(`DELETE FROM sessions WHERE token = $1`, [token]);
        }
        catch (error) {
            this.logger.error(`Erreur deleteSession: ${error.message}`);
            throw error;
        }
    }
    async updateSession(oldToken, newToken, newExpiresAt) {
        try {
            await this.db.query(`UPDATE sessions SET token = $1, expires_at = $2, updated_at = NOW() WHERE token = $3`, [newToken, newExpiresAt, oldToken]);
        }
        catch (error) {
            this.logger.error(`Erreur updateSession: ${error.message}`);
            throw error;
        }
    }
}
exports.AuthRepository = AuthRepository;
//# sourceMappingURL=auth.repositories.js.map