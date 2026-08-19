"use strict";
/*
 * |--------------------------------------------------------------------------
 * | INTERVENTION REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Interventions, alignée sur le
 * | schéma 01.schema.sql. Gère la table `interventions` + `field_intervention_reports`.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterventionRepository = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const redis_service_1 = require("../../../infra/redis/redis.service");
class InterventionRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        this.interventionSelect = `
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
    }
    /** Récupère les interventions avec pagination + filtres. */
    async getAllInterventions(query = {}) {
        try {
            const page = Math.max(1, query.page ?? 1);
            const limit = Math.min(100, Math.max(1, query.limit ?? 50));
            const offset = (page - 1) * limit;
            const conditions = [`i.deleted_at IS NULL`];
            const params = [];
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
            if (query.territoryId) {
                params.push(query.territoryId);
                conditions.push(`m.territory_id = $${params.length}`);
            }
            if (query.createdBy) {
                params.push(query.createdBy);
                // Pour les interventions, on limite à celles assignées au technicien
                conditions.push(`i.assigned_to_user_id = $${params.length}`);
            }
            const where = conditions.join(' AND ');
            const key = `interventions:all:${page}:${limit}:${query.missionId ?? ''}:${query.teamId ?? ''}:${query.status ?? ''}:${query.territoryId ?? ''}:${query.createdBy ?? ''}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const countRes = await this.db.query(`SELECT COUNT(*)::int AS total FROM interventions i 
           LEFT JOIN missions m ON i.mission_id = m.id
           WHERE ${where}`, params);
                const total = countRes.rows[0].total;
                params.push(limit, offset);
                const res = await this.db.query(`${this.interventionSelect}
           FROM interventions i
           LEFT JOIN missions m ON i.mission_id = m.id
           WHERE ${where}
           ORDER BY i.created_at DESC
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
            this.logger.error(`Erreur getAllInterventions: ${error.message}`);
            throw error;
        }
    }
    /** Récupère une intervention par son id (UUID). */
    async getInterventionById(id) {
        try {
            const key = `intervention:id:${id}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const res = await this.db.query(`${this.interventionSelect}
           FROM interventions i
           WHERE i.id = $1
             AND i.deleted_at IS NULL
           LIMIT 1`, [id]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 600);
        }
        catch (error) {
            this.logger.error(`Erreur getInterventionById: ${error.message}`);
            throw error;
        }
    }
    /** Crée une intervention (transaction). */
    async createIntervention(payload) {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            const res = await client.query(`INSERT INTO interventions (
           mission_id, assigned_societe_id, assigned_to_user_id,
           intervention_type, vehicle_notes, equipment_notes
         )
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`, [
                payload.missionId,
                payload.assignedSocieteId,
                payload.assignedToUserId ?? null,
                payload.interventionType,
                payload.vehicleNotes ?? null,
                payload.equipmentNotes ?? null,
            ]);
            const created = res.rows[0];
            await client.query('COMMIT');
            await redis_service_1.redisCache.invalidatePattern('interventions:all:*');
            return await this.getInterventionById(created.id);
        }
        catch (error) {
            await client.query('ROLLBACK');
            if (error.code === '23503') {
                throw new appErrors_1.BadRequestError('Référence invalide : mission, équipe ou utilisateur.');
            }
            this.logger.error(`Erreur createIntervention: ${error.message}`);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /** Met à jour une intervention. */
    async updateIntervention(id, payload) {
        try {
            const res = await this.db.query(`UPDATE interventions
         SET status = COALESCE($1, status),
             assigned_to_user_id = COALESCE($2, assigned_to_user_id),
             vehicle_notes = COALESCE($3, vehicle_notes),
             equipment_notes = COALESCE($4, equipment_notes),
             started_at = COALESCE($5, started_at),
             ended_at = COALESCE($6, ended_at)
         WHERE id = $7
           AND deleted_at IS NULL
         RETURNING id`, [
                payload.status ?? null,
                payload.assignedToUserId ?? null,
                payload.vehicleNotes ?? null,
                payload.equipmentNotes ?? null,
                payload.startedAt ?? null,
                payload.endedAt ?? null,
                id,
            ]);
            if (res.rowCount === 0) {
                throw new appErrors_1.NotFoundError('Intervention introuvable.');
            }
            await redis_service_1.redisCache.invalidate(`intervention:id:${id}`);
            await redis_service_1.redisCache.invalidatePattern('interventions:all:*');
            return await this.getInterventionById(id);
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur updateIntervention: ${error.message}`);
            throw error;
        }
    }
    /** Suppression logique d'une intervention. */
    async deleteIntervention(id) {
        try {
            const res = await this.db.query(`UPDATE interventions SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`, [id]);
            if ((res.rowCount ?? 0) === 0) {
                throw new appErrors_1.NotFoundError('Intervention introuvable.');
            }
            await redis_service_1.redisCache.invalidate(`intervention:id:${id}`);
            await redis_service_1.redisCache.invalidatePattern('interventions:all:*');
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur deleteIntervention: ${error.message}`);
            throw error;
        }
    }
    // ───────────────────────────────────────────────────────────────────────────
    // FIELD INTERVENTION REPORTS
    // ───────────────────────────────────────────────────────────────────────────
    /** Crée un rapport d'intervention terrain (transaction). */
    async createFieldReport(payload) {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            const res = await client.query(`INSERT INTO field_intervention_reports (
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
           deleted_at            AS "deletedAt"`, [
                payload.interventionId,
                payload.reportId ?? null,
                payload.createdBy ?? null,
                payload.workDone ?? null,
                payload.blockageRemovedPct ?? null,
                payload.finalConditionScore ?? null,
                payload.recommendations ?? null,
                payload.completed ?? false,
            ]);
            const report = res.rows[0];
            await client.query('COMMIT');
            await redis_service_1.redisCache.invalidate(`intervention:id:${payload.interventionId}`);
            return report;
        }
        catch (error) {
            await client.query('ROLLBACK');
            if (error.code === '23503') {
                throw new appErrors_1.BadRequestError('Référence invalide : intervention, rapport ou utilisateur.');
            }
            this.logger.error(`Erreur createFieldReport: ${error.message}`);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /** Récupère les rapports d'une intervention. */
    async getInterventionReports(interventionId) {
        try {
            const res = await this.db.query(`SELECT
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
         ORDER BY created_at DESC`, [interventionId]);
            return res.rows;
        }
        catch (error) {
            this.logger.error(`Erreur getInterventionReports: ${error.message}`);
            throw error;
        }
    }
}
exports.InterventionRepository = InterventionRepository;
//# sourceMappingURL=intervention.repositories.js.map