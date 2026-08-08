/*
 * |--------------------------------------------------------------------------
 * | TEAM REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Teams.
 * | Gère les tables field_teams + field_team_members.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import PostgresDatabase from '../../../config/database/postgres';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { redisCache } from '../../../infra/redis/redis.service';

import { TeamType, TeamMemberRole } from '../types/team.enums';
import type {
  FieldTeam,
  FieldTeamMember,
  CreateTeamPayload,
  UpdateTeamPayload,
  PaginationQuery,
  PaginatedResult,
} from '../types/team.types';

export class TeamRepository {
  constructor(
    private readonly db: PostgresDatabase,
    private readonly logger: Logger,
  ) {}

  private readonly teamSelect = `
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

  /** Récupère les équipes avec pagination + filtres (teamType, organizationId). */
  public async getAllTeams(
    query: PaginationQuery & { teamType?: string; organizationId?: string } = {}
  ): Promise<PaginatedResult<FieldTeam>> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 50));
      const offset = (page - 1) * limit;

      const conditions: string[] = [`t.deleted_at IS NULL`];
      const params: any[] = [];
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
      return await redisCache.getOrSet(key, async () => {
        const countRes = await this.db.query(
          `SELECT COUNT(*)::int AS total FROM field_teams t WHERE ${where}`,
          params
        );
        const total = countRes.rows[0].total as number;

        params.push(limit, offset);
        const res = await this.db.query(
          `${this.teamSelect}
           FROM field_teams t
           WHERE ${where}
           ORDER BY t.name ASC
           LIMIT $${params.length - 1} OFFSET $${params.length}`,
          params
        );

        return {
          data: res.rows as FieldTeam[],
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }, 600);
    } catch (error: any) {
      this.logger.error(`Erreur getAllTeams: ${error.message}`);
      throw error;
    }
  }

  /** Récupère une équipe par son id (UUID). */
  public async getTeamById(id: string): Promise<FieldTeam | null> {
    try {
      const key = `team:id:${id}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `${this.teamSelect}
           FROM field_teams t
           WHERE t.id = $1
             AND t.deleted_at IS NULL
           LIMIT 1`,
          [id]
        );
        return res.rowCount > 0 ? (res.rows[0] as FieldTeam) : null;
      }, 600);
    } catch (error: any) {
      this.logger.error(`Erreur getTeamById: ${error.message}`);
      throw error;
    }
  }

  /**
   * Crée une équipe.
   * @throws BadRequestError si provider sans organizationId ou institution avec organizationId
   */
  public async createTeam(payload: CreateTeamPayload): Promise<FieldTeam> {
    try {
      const normalizedOrgId = payload.teamType === TeamType.PROVIDER ? payload.organizationId ?? null : null;
      if (payload.teamType === TeamType.PROVIDER && !normalizedOrgId) {
        throw new BadRequestError('Une équipe prestataire (provider) doit être rattachée à une société (organizationId requis).');
      }

      const res = await this.db.query(
        `INSERT INTO field_teams (name, team_type, organization_id)
         VALUES ($1, $2, $3)
         RETURNING
           id,
           organization_id AS "organizationId",
           team_type       AS "teamType",
           name,
           is_active       AS "isActive",
           created_at      AS "createdAt",
           updated_at      AS "updatedAt",
           deleted_at      AS "deletedAt"`,
        [payload.name, payload.teamType, normalizedOrgId]
      );

      await redisCache.invalidatePattern('teams:all:*');

      return res.rows[0] as FieldTeam;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      if (error.code === '23503') {
        throw new BadRequestError('Société (organizationId) introuvable.');
      }
      this.logger.error(`Erreur createTeam: ${error.message}`);
      throw error;
    }
  }

  /** Met à jour une équipe. */
  public async updateTeam(
    id: string,
    payload: UpdateTeamPayload
  ): Promise<FieldTeam | null> {
    try {
      const res = await this.db.query(
        `UPDATE field_teams
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
           deleted_at      AS "deletedAt"`,
        [
          payload.name ?? null,
          payload.isActive ?? null,
          payload.teamType ?? null,
          payload.organizationId ?? null,
          id,
        ]
      );

      if (res.rowCount === 0) {
        throw new NotFoundError('Équipe introuvable.');
      }

      await redisCache.invalidate(`team:id:${id}`);
      await redisCache.invalidatePattern('teams:all:*');

      return res.rows[0] as FieldTeam;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updateTeam: ${error.message}`);
      throw error;
    }
  }

  /** Suppression logique d'une équipe. */
  public async deleteTeam(id: string): Promise<void> {
    try {
      const res = await this.db.query(
        `UPDATE field_teams SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );

      if ((res.rowCount ?? 0) === 0) {
        throw new NotFoundError('Équipe introuvable.');
      }

      await redisCache.invalidate(`team:id:${id}`);
      await redisCache.invalidatePattern('teams:all:*');
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur deleteTeam: ${error.message}`);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // MEMBRES D'ÉQUIPE
  // ───────────────────────────────────────────────────────────────────────────

  /** Récupère les membres actifs d'une équipe. */
  public async getTeamMembers(teamId: string): Promise<FieldTeamMember[]> {
    try {
      const res = await this.db.query(
        `SELECT
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
         ORDER BY joined_at ASC`,
        [teamId]
      );
      return res.rows as FieldTeamMember[];
    } catch (error: any) {
      this.logger.error(`Erreur getTeamMembers: ${error.message}`);
      throw error;
    }
  }

  /** Ajoute un membre à une équipe (idempotent, leader unique actif). */
  public async addMemberToTeam(
    teamId: string,
    userId: string,
    role: TeamMemberRole = TeamMemberRole.MEMBER,
    isActive: boolean = true
  ): Promise<FieldTeamMember> {
    try {
      const res = await this.db.query(
        `INSERT INTO field_team_members (team_id, user_id, role_in_team, is_active)
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
           left_at       AS "leftAt"`,
        [teamId, userId, role, isActive]
      );

      await redisCache.invalidate(`team:id:${teamId}`);

      return res.rows[0] as FieldTeamMember;
    } catch (error: any) {
      if (error.code === '23503') {
        throw new BadRequestError('Équipe ou utilisateur introuvable.');
      }
      if (error.code === '23505' && error.constraint === 'uq_one_active_leader_per_team') {
        throw new BadRequestError('Un chef actif existe déjà pour cette équipe.');
      }
      this.logger.error(`Erreur addMemberToTeam: ${error.message}`);
      throw error;
    }
  }

  /** Retire (désactive) un membre d'une équipe. */
  public async removeMemberFromTeam(teamId: string, memberId: string): Promise<void> {
    try {
      const res = await this.db.query(
        `UPDATE field_team_members
         SET is_active = FALSE, left_at = NOW()
         WHERE id = $1
           AND team_id = $2
           AND is_active = TRUE`,
        [memberId, teamId]
      );

      if ((res.rowCount ?? 0) === 0) {
        throw new NotFoundError('Membre introuvable ou déjà inactif.');
      }

      await redisCache.invalidate(`team:id:${teamId}`);
      await redisCache.invalidatePattern('teams:all:*');
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur removeMemberFromTeam: ${error.message}`);
      throw error;
    }
  }
}