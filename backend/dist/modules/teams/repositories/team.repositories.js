"use strict";
/*
 * |--------------------------------------------------------------------------
 * | TEAM REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Teams.
 * | Gère les tables field_teams + field_team_members.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamRepository = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const redis_service_1 = require("../../../infra/redis/redis.service");
const team_enums_1 = require("../types/team.enums");
class TeamRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        this.teamSelect = `
    SELECT
      t.id,
      t.organization_id AS "organizationId",
      t.team_type       AS "teamType",
      t.name,
      t.is_active       AS "isActive",
      t.created_at      AS "createdAt",
      t.updated_at      AS "updatedAt",
      t.deleted_at      AS "deletedAt"
  `;
    }
    /** Récupère les équipes avec pagination + filtres (teamType, organizationId). */
    async getAllTeams(query = {}) {
        try {
            const page = Math.max(1, query.page ?? 1);
            const limit = Math.min(100, Math.max(1, query.limit ?? 50));
            const offset = (page - 1) * limit;
            const conditions = [`t.deleted_at IS NULL`];
            const params = [];
            if (query.teamType) {
                params.push(query.teamType);
                conditions.push(`t.team_type = $${params.length}`);
            }
            if (query.organizationId) {
                params.push(query.organizationId);
                conditions.push(`t.organization_id = $${params.length}`);
            }
            const where = conditions.join(' AND ');
            const key = `teams:all:${page}:${limit}:${query.teamType ?? ''}:${query.organizationId ?? ''}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const countRes = await this.db.query(`SELECT COUNT(*)::int AS total FROM field_teams t WHERE ${where}`, params);
                const total = countRes.rows[0].total;
                params.push(limit, offset);
                const res = await this.db.query(`${this.teamSelect}
           FROM field_teams t
           WHERE ${where}
           ORDER BY t.name ASC
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
            this.logger.error(`Erreur getAllTeams: ${error.message}`);
            throw error;
        }
    }
    /** Récupère une équipe par son id (UUID). */
    async getTeamById(id) {
        try {
            const key = `team:id:${id}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const res = await this.db.query(`${this.teamSelect}
           FROM field_teams t
           WHERE t.id = $1
             AND t.deleted_at IS NULL
           LIMIT 1`, [id]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 600);
        }
        catch (error) {
            this.logger.error(`Erreur getTeamById: ${error.message}`);
            throw error;
        }
    }
    /**
     * Crée une équipe.
     * @throws BadRequestError si provider sans organizationId ou institution avec organizationId
     */
    async createTeam(payload) {
        try {
            const normalizedOrgId = payload.teamType === team_enums_1.TeamType.PROVIDER ? payload.organizationId ?? null : null;
            if (payload.teamType === team_enums_1.TeamType.PROVIDER && !normalizedOrgId) {
                throw new appErrors_1.BadRequestError('Une équipe prestataire (provider) doit être rattachée à une société (organizationId requis).');
            }
            const res = await this.db.query(`INSERT INTO field_teams (name, team_type, organization_id)
         VALUES ($1, $2, $3)
         RETURNING
           id,
           organization_id AS "organizationId",
           team_type       AS "teamType",
           name,
           is_active       AS "isActive",
           created_at      AS "createdAt",
           updated_at      AS "updatedAt",
           deleted_at      AS "deletedAt"`, [payload.name, payload.teamType, normalizedOrgId]);
            await redis_service_1.redisCache.invalidatePattern('teams:all:*');
            return res.rows[0];
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            if (error.code === '23503') {
                throw new appErrors_1.BadRequestError('Société (organizationId) introuvable.');
            }
            this.logger.error(`Erreur createTeam: ${error.message}`);
            throw error;
        }
    }
    /** Met à jour une équipe. */
    async updateTeam(id, payload) {
        try {
            const res = await this.db.query(`UPDATE field_teams
         SET name = COALESCE($1, name),
             is_active = COALESCE($2, is_active),
             team_type = COALESCE($3, team_type),
             organization_id = COALESCE($4, organization_id)
         WHERE id = $5
           AND deleted_at IS NULL
         RETURNING
           id,
           organization_id AS "organizationId",
           team_type       AS "teamType",
           name,
           is_active       AS "isActive",
           created_at      AS "createdAt",
           updated_at      AS "updatedAt",
           deleted_at      AS "deletedAt"`, [
                payload.name ?? null,
                payload.isActive ?? null,
                payload.teamType ?? null,
                payload.organizationId ?? null,
                id,
            ]);
            if (res.rowCount === 0) {
                throw new appErrors_1.NotFoundError('Équipe introuvable.');
            }
            await redis_service_1.redisCache.invalidate(`team:id:${id}`);
            await redis_service_1.redisCache.invalidatePattern('teams:all:*');
            return res.rows[0];
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur updateTeam: ${error.message}`);
            throw error;
        }
    }
    /** Suppression logique d'une équipe. */
    async deleteTeam(id) {
        try {
            const res = await this.db.query(`UPDATE field_teams SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`, [id]);
            if ((res.rowCount ?? 0) === 0) {
                throw new appErrors_1.NotFoundError('Équipe introuvable.');
            }
            await redis_service_1.redisCache.invalidate(`team:id:${id}`);
            await redis_service_1.redisCache.invalidatePattern('teams:all:*');
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur deleteTeam: ${error.message}`);
            throw error;
        }
    }
    // ───────────────────────────────────────────────────────────────────────────
    // MEMBRES D'ÉQUIPE
    // ───────────────────────────────────────────────────────────────────────────
    /** Récupère les membres actifs d'une équipe. */
    async getTeamMembers(teamId) {
        try {
            const res = await this.db.query(`SELECT
           id,
           team_id       AS "teamId",
           user_id       AS "userId",
           role_in_team  AS "roleInTeam",
           is_active     AS "isActive",
           joined_at     AS "joinedAt",
           left_at       AS "leftAt"
         FROM field_team_members
         WHERE team_id = $1
           AND is_active = TRUE
         ORDER BY joined_at ASC`, [teamId]);
            return res.rows;
        }
        catch (error) {
            this.logger.error(`Erreur getTeamMembers: ${error.message}`);
            throw error;
        }
    }
    /** Ajoute un membre à une équipe (idempotent, leader unique actif). */
    async addMemberToTeam(teamId, userId, role = team_enums_1.TeamMemberRole.MEMBER, isActive = true) {
        try {
            const res = await this.db.query(`INSERT INTO field_team_members (team_id, user_id, role_in_team, is_active)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (team_id, user_id) DO UPDATE SET
           role_in_team = EXCLUDED.role_in_team,
           is_active = EXCLUDED.is_active,
           left_at = NULL
         RETURNING
           id,
           team_id       AS "teamId",
           user_id       AS "userId",
           role_in_team  AS "roleInTeam",
           is_active     AS "isActive",
           joined_at     AS "joinedAt",
           left_at       AS "leftAt"`, [teamId, userId, role, isActive]);
            await redis_service_1.redisCache.invalidate(`team:id:${teamId}`);
            return res.rows[0];
        }
        catch (error) {
            if (error.code === '23503') {
                throw new appErrors_1.BadRequestError('Équipe ou utilisateur introuvable.');
            }
            if (error.code === '23505' && error.constraint === 'uq_one_active_leader_per_team') {
                throw new appErrors_1.BadRequestError('Un chef actif existe déjà pour cette équipe.');
            }
            this.logger.error(`Erreur addMemberToTeam: ${error.message}`);
            throw error;
        }
    }
    /** Retire (désactive) un membre d'une équipe. */
    async removeMemberFromTeam(teamId, memberId) {
        try {
            const res = await this.db.query(`UPDATE field_team_members
         SET is_active = FALSE, left_at = NOW()
         WHERE id = $1
           AND team_id = $2
           AND is_active = TRUE`, [memberId, teamId]);
            if ((res.rowCount ?? 0) === 0) {
                throw new appErrors_1.NotFoundError('Membre introuvable ou déjà inactif.');
            }
            await redis_service_1.redisCache.invalidate(`team:id:${teamId}`);
            await redis_service_1.redisCache.invalidatePattern('teams:all:*');
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur removeMemberFromTeam: ${error.message}`);
            throw error;
        }
    }
}
exports.TeamRepository = TeamRepository;
//# sourceMappingURL=team.repositories.js.map