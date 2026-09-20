/*
 * |--------------------------------------------------------------------------
 * | MISSION REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Missions, alignée sur le
 * | schéma 01.schema.sql. Gère la table `missions` + ses tables dérivées :
 * | mission_checklist, mission_assignments, mission_reports,
 * | mission_status_history.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import PostgresDatabase from '../../../config/database/postgres';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { redisCache } from '../../../infra/redis/redis.service';

import { MissionStatus } from '../types/mission.enums';
import type {
  Mission,
  MissionChecklistItem,
  MissionAssignment,
  MissionStatusHistory,
  CreateMissionPayload,
  UpdateMissionPayload,
  PaginationQuery,
  PaginatedResult,
} from '../types/mission.types';

export class MissionRepository {
  constructor(
    private readonly db: PostgresDatabase,
    private readonly logger: Logger,
  ) {}

  private readonly missionSelect = `
    SELECT
      m.id,
      m.municipality_id          AS "municipalityId",
      mun.name                   AS "municipalityName",
      mun.name                   AS "territoryName",
      mun.name                   AS "territoryName",
      m.report_id                AS "reportId",
      m.infrastructure_id        AS "infrastructureId",
      m.mission_type             AS "missionType",
      m.priority_level           AS "priorityLevel",
      m.title,
      m.description,
      m.status,
      m.assigned_organization_id AS "assignedOrganizationId",
      m.assigned_team_id         AS "assignedTeamId",
      m.rejected_reason          AS "rejectedReason",
      m.scheduled_at             AS "scheduledAt",
      m.due_date                 AS "dueDate",
      m.completed_at             AS "completedAt",
      m.estimated_hours          AS "estimatedHours",
      m.actual_hours             AS "actualHours",
      m.created_by               AS "createdBy",
      m.created_at               AS "createdAt",
      m.updated_at               AS "updatedAt",
      m.deleted_at               AS "deletedAt"
  `;

  /** Récupère les missions avec pagination + filtres. */
  public async getAllMissions(
    query: PaginationQuery & { regionId?: string; municipalityId?: string; districtId?: string; createdBy?: string; status?: string; missionType?: string; organizationId?: string; memberUserId?: string } = {}
  ): Promise<PaginatedResult<Mission>> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 50));
      const offset = (page - 1) * limit;

      const conditions: string[] = [`m.deleted_at IS NULL`];
      const params: any[] = [];
      if (query.regionId) {
        params.push(query.regionId);
        conditions.push(`mun.region_id = $${params.length}`);
      }
      if (query.municipalityId) {
        params.push(query.municipalityId);
        conditions.push(`m.municipality_id = $${params.length}`);
      }
      if (query.createdBy) {
        params.push(query.createdBy);
        conditions.push(`m.created_by = $${params.length}`);
      }
      if (query.status) {
        params.push(query.status);
        conditions.push(`m.status = $${params.length}`);
      }
      if (query.missionType) {
        params.push(query.missionType);
        conditions.push(`m.mission_type = $${params.length}`);
      }
      if (query.organizationId) {
        params.push(query.organizationId);
        conditions.push(`m.assigned_organization_id = $${params.length}`);
      }
      // Scoping technicien : uniquement les missions assignées à son équipe
      if (query.memberUserId) {
        params.push(query.memberUserId);
        conditions.push(`EXISTS (
          SELECT 1 FROM field_team_members ftm
          WHERE ftm.team_id = m.assigned_team_id
            AND ftm.user_id = $${params.length}
            AND ftm.is_active = TRUE
        )`);
      }
      const where = conditions.join(' AND ');

      const key = `missions:all:${page}:${limit}:${query.municipalityId ?? ''}:${query.createdBy ?? ''}:${query.status ?? ''}:${query.missionType ?? ''}:${query.organizationId ?? ''}`;
      return await redisCache.getOrSet(key, async () => {
        const countRes = await this.db.query(
          `SELECT COUNT(*)::int AS total FROM missions m WHERE ${where}`,
          params
        );
        const total = countRes.rows[0].total as number;

        params.push(limit, offset);
        const res = await this.db.query(
          `${this.missionSelect}
           FROM missions m
           LEFT JOIN municipalities mun ON m.municipality_id = mun.id
           WHERE ${where}
           ORDER BY m.created_at DESC
           LIMIT $${params.length - 1} OFFSET $${params.length}`,
          params
        );

        return {
          data: res.rows as Mission[],
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }, 600);
    } catch (error: any) {
      this.logger.error(`Erreur getAllMissions: ${error.message}`);
      throw error;
    }
  }

  /** Récupère une mission par son id (UUID). */
  public async getMissionById(id: string): Promise<Mission | null> {
    try {
      const key = `mission:id:${id}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `${this.missionSelect}
           FROM missions m
           LEFT JOIN municipalities mun ON m.municipality_id = mun.id
           WHERE m.id = $1
             AND m.deleted_at IS NULL
           LIMIT 1`,
          [id]
        );
        return res.rowCount > 0 ? (res.rows[0] as Mission) : null;
      }, 600);
    } catch (error: any) {
      this.logger.error(`Erreur getMissionById: ${error.message}`);
      throw error;
    }
  }

  /** Crée une mission (transaction). */
  public async createMission(payload: CreateMissionPayload): Promise<Mission> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      const res = await client.query(
        `INSERT INTO missions (
           municipality_id, report_id, infrastructure_id, mission_type, priority_level,
           title, description, status, assigned_organization_id,
           scheduled_at, due_date, estimated_hours, created_by
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id, status`,
        [
          payload.municipalityId,
          payload.reportId ?? null,
          payload.infrastructureId ?? null,
          payload.missionType,
          payload.priorityLevel ?? 'medium',
          payload.title,
          payload.description ?? null,
          payload.status ?? MissionStatus.DRAFT,
          payload.assignedOrganizationId ?? null,
          payload.scheduledAt ?? null,
          payload.dueDate ?? null,
          payload.estimatedHours ?? null,
          payload.createdBy ?? null,
        ]
      );
      const created = res.rows[0] as { id: string; status: MissionStatus };

      await client.query('COMMIT');

      await redisCache.invalidatePattern('missions:all:*');

      return await this.getMissionById(created.id) as Mission;
    } catch (error: any) {
      await client.query('ROLLBACK');
      if (error.code === '23503') {
        throw new BadRequestError('Référence invalide : territoire, rapport, organisation ou utilisateur.');
      }
      this.logger.error(`Erreur createMission: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /** Met à jour une mission. */
  public async updateMission(
    id: string,
    payload: UpdateMissionPayload
  ): Promise<Mission | null> {
    try {
      const res = await this.db.query(
        `UPDATE missions
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             mission_type = COALESCE($3, mission_type),
             priority_level = COALESCE($4, priority_level),
             status = COALESCE($5, status),
             assigned_organization_id = COALESCE($6, assigned_organization_id),
             assigned_team_id = COALESCE($7, assigned_team_id),
             rejected_reason = COALESCE($8, rejected_reason),
             scheduled_at = COALESCE($9, scheduled_at),
             due_date = COALESCE($10, due_date),
             completed_at = COALESCE($11, completed_at),
             estimated_hours = COALESCE($12, estimated_hours),
             actual_hours = COALESCE($13, actual_hours),
             infrastructure_id = COALESCE($14, infrastructure_id)
         WHERE id = $15
           AND deleted_at IS NULL
         RETURNING id`,
        [
          payload.title ?? null,
          payload.description ?? null,
          payload.missionType ?? null,
          payload.priorityLevel ?? null,
          payload.status ?? null,
          payload.assignedOrganizationId ?? null,
          payload.assignedTeamId ?? null,
          payload.rejectedReason ?? null,
          payload.scheduledAt ?? null,
          payload.dueDate ?? null,
          payload.completedAt ?? null,
          payload.estimatedHours ?? null,
          payload.actualHours ?? null,
          payload.infrastructureId ?? null,
          id,
        ]
      );

      if (res.rowCount === 0) {
        throw new NotFoundError('Mission introuvable.');
      }

      await redisCache.invalidate(`mission:id:${id}`);
      await redisCache.invalidatePattern('missions:all:*');

      return await this.getMissionById(id);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updateMission: ${error.message}`);
      throw error;
    }
  }

  /** Suppression logique d'une mission. */
  public async deleteMission(id: string): Promise<void> {
    try {
      const res = await this.db.query(
        `UPDATE missions SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );

      if ((res.rowCount ?? 0) === 0) {
        throw new NotFoundError('Mission introuvable.');
      }

      await redisCache.invalidate(`mission:id:${id}`);
      await redisCache.invalidatePattern('missions:all:*');
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur deleteMission: ${error.message}`);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CHECKLIST
  // ───────────────────────────────────────────────────────────────────────────

  /** Récupère la checklist d'une mission. */
  public async getMissionChecklist(missionId: string): Promise<MissionChecklistItem[]> {
    try {
      const res = await this.db.query(
        `SELECT
           id,
           mission_id             AS "missionId",
           label,
           done,
           done_by                AS "doneBy",
           done_at                AS "doneAt",
           sort_order             AS "sortOrder",
           created_at             AS "createdAt"
         FROM mission_checklist
         WHERE mission_id = $1
         ORDER BY sort_order ASC, created_at ASC`,
        [missionId]
      );
      return res.rows as MissionChecklistItem[];
    } catch (error: any) {
      this.logger.error(`Erreur getMissionChecklist: ${error.message}`);
      throw error;
    }
  }

  /** Ajoute un élément de checklist. */
  public async addChecklistItem(missionId: string, label: string): Promise<MissionChecklistItem> {
    try {
      const res = await this.db.query(
        `INSERT INTO mission_checklist (mission_id, label, sort_order)
         SELECT $1, $2,
           (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM mission_checklist WHERE mission_id = $1)
         RETURNING
           id,
           mission_id AS "missionId",
           label,
           done,
           done_by AS "doneBy",
           done_at AS "doneAt",
           sort_order AS "sortOrder",
           created_at AS "createdAt"`,
        [missionId, label]
      );

      await redisCache.invalidate(`mission:id:${missionId}`);

      return res.rows[0] as MissionChecklistItem;
    } catch (error: any) {
      if (error.code === '23503') {
        throw new BadRequestError('Mission introuvable.');
      }
      this.logger.error(`Erreur addChecklistItem: ${error.message}`);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // ASSIGNMENTS
  // ───────────────────────────────────────────────────────────────────────────

  /** Récupère les assignations actives d'une mission. */
  public async getMissionAssignments(missionId: string): Promise<MissionAssignment[]> {
    try {
      const res = await this.db.query(
        `SELECT
           id,
           mission_id  AS "missionId",
           user_id     AS "userId",
           assigned_by AS "assignedBy",
           is_active   AS "isActive",
           assigned_at AS "assignedAt",
           unassigned_at AS "unassignedAt"
         FROM mission_assignments
         WHERE mission_id = $1
           AND is_active = TRUE
         ORDER BY assigned_at ASC`,
        [missionId]
      );
      return res.rows as MissionAssignment[];
    } catch (error: any) {
      this.logger.error(`Erreur getMissionAssignments: ${error.message}`);
      throw error;
    }
  }

  /** Assigne un utilisateur à une mission (idempotent). */
  public async assignUserToMission(
    missionId: string,
    userId: string,
    assignedBy?: string | null
  ): Promise<MissionAssignment> {
    try {
      const res = await this.db.query(
        `INSERT INTO mission_assignments (mission_id, user_id, assigned_by)
         SELECT $1, $2, $3
         WHERE NOT EXISTS (
           SELECT 1 FROM mission_assignments
           WHERE mission_id = $1 AND user_id = $2 AND is_active = TRUE
         )
         RETURNING
           id,
           mission_id  AS "missionId",
           user_id     AS "userId",
           assigned_by AS "assignedBy",
           is_active   AS "isActive",
           assigned_at AS "assignedAt",
           unassigned_at AS "unassignedAt"`,
        [missionId, userId, assignedBy ?? null]
      );

      if (res.rowCount === 0) {
        throw new BadRequestError('Cet utilisateur est déjà assigné à cette mission.');
      }

      await redisCache.invalidate(`mission:id:${missionId}`);

      return res.rows[0] as MissionAssignment;
    } catch (error: any) {
      if (error instanceof BadRequestError) throw error;
      if (error.code === '23503') {
        throw new BadRequestError('Mission ou utilisateur introuvable.');
      }
      this.logger.error(`Erreur assignUserToMission: ${error.message}`);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // STATUT HISTORY
  // ───────────────────────────────────────────────────────────────────────────

  /** Récupère l'historique des statuts d'une mission. */
  public async getMissionStatusHistory(missionId: string): Promise<MissionStatusHistory[]> {
    try {
      const res = await this.db.query(
        `SELECT
           id,
           mission_id  AS "missionId",
           old_status  AS "oldStatus",
           new_status  AS "newStatus",
           changed_by  AS "changedBy",
           created_at  AS "createdAt"
         FROM mission_status_history
         WHERE mission_id = $1
         ORDER BY created_at ASC`,
        [missionId]
      );
      return res.rows as MissionStatusHistory[];
    } catch (error: any) {
      this.logger.error(`Erreur getMissionStatusHistory: ${error.message}`);
      throw error;
    }
  }
}