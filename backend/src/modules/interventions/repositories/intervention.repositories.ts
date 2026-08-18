/*
 * |--------------------------------------------------------------------------
 * | INTERVENTION REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Interventions, alignée sur le
 * | schéma 01.schema.sql. Gère la table `interventions` + `field_intervention_reports`.
 * |--------------------------------------------------------------------------
 */

import type { Logger } from 'winston';
import PostgresDatabase from '../../../config/database/postgres';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { redisCache } from '../../../infra/redis/redis.service';

import type {
  Intervention,
  FieldInterventionReport,
  CreateInterventionPayload,
  UpdateInterventionPayload,
  CreateFieldReportPayload,
  PaginationQuery,
  PaginatedResult,
} from '../types/intervention.types';

export class InterventionRepository {
  constructor(
    private readonly db: PostgresDatabase,
    private readonly logger: Logger,
  ) {}

  private readonly interventionSelect = `
    SELECT
      i.id,
      i.mission_id             AS "missionId",
      i.assigned_societe_id    AS "assignedSocieteId",
      i.assigned_to_user_id    AS "assignedToUserId",
      i.intervention_type      AS "interventionType",
      i.status,
      i.vehicle_notes          AS "vehicleNotes",
      i.equipment_notes        AS "equipmentNotes",
      i.started_at             AS "startedAt",
      i.ended_at               AS "endedAt",
      i.created_at             AS "createdAt",
      i.updated_at             AS "updatedAt",
      i.deleted_at             AS "deletedAt"
  `;

  /** Récupère les interventions avec pagination + filtres. */
  public async getAllInterventions(
    query: PaginationQuery & { missionId?: string; teamId?: string; status?: string } = {}
  ): Promise<PaginatedResult<Intervention>> {
    try {
      const page = Math.max(1, query.page ?? 1);
      const limit = Math.min(100, Math.max(1, query.limit ?? 50));
      const offset = (page - 1) * limit;

      const conditions: string[] = [`i.deleted_at IS NULL`];
      const params: any[] = [];
      if (query.missionId) {
        params.push(query.missionId);
        conditions.push(`i.mission_id = $${params.length}`);
      }
      if (query.teamId) {
        params.push(query.teamId);
        conditions.push(`i.assigned_societe_id = $${params.length}`);
      }
      if (query.status) {
        params.push(query.status);
        conditions.push(`i.status = $${params.length}`);
      }
      const where = conditions.join(' AND ');

      const key = `interventions:all:${page}:${limit}:${query.missionId ?? ''}:${query.teamId ?? ''}:${query.status ?? ''}`;
      return await redisCache.getOrSet(key, async () => {
        const countRes = await this.db.query(
          `SELECT COUNT(*)::int AS total FROM interventions i WHERE ${where}`,
          params
        );
        const total = countRes.rows[0].total as number;

        params.push(limit, offset);
        const res = await this.db.query(
          `${this.interventionSelect}
           FROM interventions i
           WHERE ${where}
           ORDER BY i.created_at DESC
           LIMIT $${params.length - 1} OFFSET $${params.length}`,
          params
        );

        return {
          data: res.rows as Intervention[],
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }, 600);
    } catch (error: any) {
      this.logger.error(`Erreur getAllInterventions: ${error.message}`);
      throw error;
    }
  }

  /** Récupère une intervention par son id (UUID). */
  public async getInterventionById(id: string): Promise<Intervention | null> {
    try {
      const key = `intervention:id:${id}`;
      return await redisCache.getOrSet(key, async () => {
        const res = await this.db.query(
          `${this.interventionSelect}
           FROM interventions i
           WHERE i.id = $1
             AND i.deleted_at IS NULL
           LIMIT 1`,
          [id]
        );
        return res.rowCount > 0 ? (res.rows[0] as Intervention) : null;
      }, 600);
    } catch (error: any) {
      this.logger.error(`Erreur getInterventionById: ${error.message}`);
      throw error;
    }
  }

  /** Crée une intervention (transaction). */
  public async createIntervention(
    payload: CreateInterventionPayload
  ): Promise<Intervention> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      const res = await client.query(
        `INSERT INTO interventions (
           mission_id, assigned_societe_id, assigned_to_user_id,
           intervention_type, vehicle_notes, equipment_notes
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [
          payload.missionId,
          payload.assignedSocieteId,
          payload.assignedToUserId ?? null,
          payload.interventionType,
          payload.vehicleNotes ?? null,
          payload.equipmentNotes ?? null,
        ]
      );
      const created = res.rows[0] as { id: string };

      await client.query('COMMIT');

      await redisCache.invalidatePattern('interventions:all:*');

      return await this.getInterventionById(created.id) as Intervention;
    } catch (error: any) {
      await client.query('ROLLBACK');
      if (error.code === '23503') {
        throw new BadRequestError('Référence invalide : mission, équipe ou utilisateur.');
      }
      this.logger.error(`Erreur createIntervention: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /** Met à jour une intervention. */
  public async updateIntervention(
    id: string,
    payload: UpdateInterventionPayload
  ): Promise<Intervention | null> {
    try {
      const res = await this.db.query(
        `UPDATE interventions
         SET status = COALESCE($1, status),
             assigned_to_user_id = COALESCE($2, assigned_to_user_id),
             vehicle_notes = COALESCE($3, vehicle_notes),
             equipment_notes = COALESCE($4, equipment_notes),
             started_at = COALESCE($5, started_at),
             ended_at = COALESCE($6, ended_at)
         WHERE id = $7
           AND deleted_at IS NULL
         RETURNING id`,
        [
          payload.status ?? null,
          payload.assignedToUserId ?? null,
          payload.vehicleNotes ?? null,
          payload.equipmentNotes ?? null,
          payload.startedAt ?? null,
          payload.endedAt ?? null,
          id,
        ]
      );

      if (res.rowCount === 0) {
        throw new NotFoundError('Intervention introuvable.');
      }

      await redisCache.invalidate(`intervention:id:${id}`);
      await redisCache.invalidatePattern('interventions:all:*');

      return await this.getInterventionById(id);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur updateIntervention: ${error.message}`);
      throw error;
    }
  }

  /** Suppression logique d'une intervention. */
  public async deleteIntervention(id: string): Promise<void> {
    try {
      const res = await this.db.query(
        `UPDATE interventions SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );

      if ((res.rowCount ?? 0) === 0) {
        throw new NotFoundError('Intervention introuvable.');
      }

      await redisCache.invalidate(`intervention:id:${id}`);
      await redisCache.invalidatePattern('interventions:all:*');
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      this.logger.error(`Erreur deleteIntervention: ${error.message}`);
      throw error;
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // FIELD INTERVENTION REPORTS
  // ───────────────────────────────────────────────────────────────────────────

  /** Crée un rapport d'intervention terrain (transaction). */
  public async createFieldReport(
    payload: CreateFieldReportPayload
  ): Promise<FieldInterventionReport> {
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      const res = await client.query(
        `INSERT INTO field_intervention_reports (
           intervention_id, report_id, created_by,
           work_done, blockage_removed_pct, final_condition_score,
           recommendations, completed
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING
           id,
           intervention_id       AS "interventionId",
           report_id             AS "reportId",
           created_by            AS "createdBy",
           work_done             AS "workDone",
           blockage_removed_pct  AS "blockageRemovedPct",
           final_condition_score AS "finalConditionScore",
           recommendations,
           completed,
           created_at            AS "createdAt",
           updated_at            AS "updatedAt",
           deleted_at            AS "deletedAt"`,
        [
          payload.interventionId,
          payload.reportId ?? null,
          payload.createdBy ?? null,
          payload.workDone ?? null,
          payload.blockageRemovedPct ?? null,
          payload.finalConditionScore ?? null,
          payload.recommendations ?? null,
          payload.completed ?? false,
        ]
      );
      const report = res.rows[0] as FieldInterventionReport;

      await client.query('COMMIT');

      await redisCache.invalidate(`intervention:id:${payload.interventionId}`);

      return report;
    } catch (error: any) {
      await client.query('ROLLBACK');
      if (error.code === '23503') {
        throw new BadRequestError('Référence invalide : intervention, rapport ou utilisateur.');
      }
      this.logger.error(`Erreur createFieldReport: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /** Récupère les rapports d'une intervention. */
  public async getInterventionReports(
    interventionId: string
  ): Promise<FieldInterventionReport[]> {
    try {
      const res = await this.db.query(
        `SELECT
           id,
           intervention_id       AS "interventionId",
           report_id             AS "reportId",
           created_by            AS "createdBy",
           work_done             AS "workDone",
           blockage_removed_pct  AS "blockageRemovedPct",
           final_condition_score AS "finalConditionScore",
           recommendations,
           completed,
           created_at            AS "createdAt",
           updated_at            AS "updatedAt",
           deleted_at            AS "deletedAt"
         FROM field_intervention_reports
         WHERE intervention_id = $1
           AND deleted_at IS NULL
         ORDER BY created_at DESC`,
        [interventionId]
      );
      return res.rows as FieldInterventionReport[];
    } catch (error: any) {
      this.logger.error(`Erreur getInterventionReports: ${error.message}`);
      throw error;
    }
  }
}