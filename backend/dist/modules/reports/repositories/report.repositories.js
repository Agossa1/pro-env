"use strict";
/*
 * |--------------------------------------------------------------------------
 * | REPORT REPOSITORY
 * |--------------------------------------------------------------------------
 * | Couche d'accès aux données pour le module Reports, alignée sur le
 * | schéma 01.schema.sql. Gère la table `reports` + les extensions 1:1
 * | `report_details_*` selon la catégorie + `report_status_history`.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRepository = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const redis_service_1 = require("../../../infra/redis/redis.service");
const report_enums_1 = require("../types/report.enums");
class ReportRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        // ───────────────────────────────────────────────────────────────────────────
        // REPORTS — CRUD
        // ───────────────────────────────────────────────────────────────────────────
        this.reportSelect = `
    SELECT
      r.id,
      r.territory_id          AS "territoryId",
      r.infrastructure_id     AS "infrastructureId",
      r.mapped_area_id        AS "mappedAreaId",
      r.title,
      r.description,
      r.issue_category        AS "issueCategory",
      r.priority,
      r.risk_level            AS "riskLevel",
      r.status,
      r.latitude,
      r.longitude,
      r.created_by            AS "createdBy",
      r.reported_at           AS "reportedAt",
      r.assigned_to           AS "assignedTo",
      r.resolved_at           AS "resolvedAt",
      r.sla_hours             AS "slaHours",
      r.created_at            AS "createdAt",
      r.updated_at            AS "updatedAt",
      r.deleted_at            AS "deletedAt",
      a.full_name             AS "createdByName",
      rol.name                AS "createdByRole",
      t.name                  AS "territoryName"
  `;
        this.reportJoins = `
    LEFT JOIN auth a ON a.id = r.created_by
    LEFT JOIN roles rol ON rol.id = a.role_id
    LEFT JOIN territories t ON t.id = r.territory_id
  `;
    }
    /**
     * Récupère les rapports avec pagination (page 1-based, limit par page —
     * défauts 1 et 50). Filtres optionnels : territoire, statut, catégorie.
     */
    async getAllReports(query = {}) {
        try {
            const page = Math.max(1, query.page ?? 1);
            const limit = Math.min(100, Math.max(1, query.limit ?? 50));
            const offset = (page - 1) * limit;
            const conditions = [`r.deleted_at IS NULL`];
            const params = [];
            if (query.territoryId) {
                params.push(query.territoryId);
                conditions.push(`r.territory_id = $${params.length}`);
            }
            if (query.createdBy) {
                params.push(query.createdBy);
                conditions.push(`r.created_by = $${params.length}`);
            }
            if (query.status) {
                params.push(query.status);
                conditions.push(`r.status = $${params.length}`);
            }
            if (query.issueCategory) {
                params.push(query.issueCategory);
                conditions.push(`r.issue_category = $${params.length}`);
            }
            const where = conditions.join(' AND ');
            const key = `reports:all:${page}:${limit}:${query.territoryId ?? ''}:${query.createdBy ?? ''}:${query.status ?? ''}:${query.issueCategory ?? ''}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const countRes = await this.db.query(`SELECT COUNT(*)::int AS total FROM reports r WHERE ${where}`, params);
                const total = countRes.rows[0].total;
                params.push(limit, offset);
                const res = await this.db.query(`${this.reportSelect}
           FROM reports r
           ${this.reportJoins}
           WHERE ${where}
           ORDER BY r.reported_at DESC
           LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
                return {
                    data: res.rows,
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                };
            }, 600); // TTL 10 minutes
        }
        catch (error) {
            this.logger.error(`Erreur getAllReports: ${error.message}`);
            throw error;
        }
    }
    /** Récupère un rapport par son id (UUID). */
    async getReportById(id) {
        try {
            const key = `report:id:${id}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const res = await this.db.query(`${this.reportSelect}
           FROM reports r
           ${this.reportJoins}
           WHERE r.id = $1
             AND r.deleted_at IS NULL
           LIMIT 1`, [id]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 600);
        }
        catch (error) {
            this.logger.error(`Erreur getReportById: ${error.message}`);
            throw error;
        }
    }
    /**
     * Crée un rapport de bout en bout dans une transaction.
     * - INSERT dans `reports` (statut et créateur par défaut)
     * - INSERT éventuel dans `report_details_*` selon issue_category
     */
    async createReport(payload) {
        const client = await this.db.getClient();
        try {
            await client.query('BEGIN');
            const res = await client.query(`INSERT INTO reports (
           territory_id, infrastructure_id, mapped_area_id,
           title, description, issue_category, priority, risk_level,
           status, latitude, longitude, created_by, sla_hours
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING
           id, territory_id AS "territoryId",
           infrastructure_id AS "infrastructureId",
           mapped_area_id AS "mappedAreaId",
           title, description,
           issue_category AS "issueCategory",
           priority, risk_level AS "riskLevel",
           status, latitude, longitude,
           created_by AS "createdBy",
           reported_at AS "reportedAt",
           assigned_to AS "assignedTo",
           resolved_at AS "resolvedAt",
           sla_hours AS "slaHours",
           created_at AS "createdAt",
           updated_at AS "updatedAt",
           deleted_at AS "deletedAt"`, [
                payload.territoryId,
                payload.infrastructureId ?? null,
                payload.mappedAreaId ?? null,
                payload.title,
                payload.description ?? null,
                payload.issueCategory,
                payload.priority ?? 'medium',
                payload.riskLevel ?? 'medium',
                payload.status ?? report_enums_1.ReportStatus.SUBMITTED,
                payload.latitude ?? null,
                payload.longitude ?? null,
                payload.createdBy ?? null,
                payload.slaHours ?? 48,
            ]);
            const report = res.rows[0];
            const reportId = report.id;
            // INSERT éventuel du détail 1:1 selon la catégorie
            if (payload.details) {
                await this.insertReportDetail(client, reportId, payload.issueCategory, payload.details);
            }
            await client.query('COMMIT');
            await redis_service_1.redisCache.invalidatePattern('reports:all:*');
            return report;
        }
        catch (error) {
            await client.query('ROLLBACK');
            if (error.code === '23503') {
                throw new appErrors_1.BadRequestError('Référence invalide : territoire, infrastructure ou zone introuvable.');
            }
            this.logger.error(`Erreur createReport: ${error.message}`);
            throw error;
        }
        finally {
            client.release();
        }
    }
    /** Met à jour un rapport. */
    async updateReport(id, payload) {
        try {
            const res = await this.db.query(`UPDATE reports
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             issue_category = COALESCE($3, issue_category),
             priority = COALESCE($4, priority),
             risk_level = COALESCE($5, risk_level),
             status = COALESCE($6, status),
             assigned_to = COALESCE($7, assigned_to),
             resolved_at = COALESCE($8, resolved_at),
             latitude = COALESCE($9, latitude),
             longitude = COALESCE($10, longitude)
         WHERE id = $11
           AND deleted_at IS NULL
         RETURNING
           id, territory_id AS "territoryId",
           infrastructure_id AS "infrastructureId",
           mapped_area_id AS "mappedAreaId",
           title, description,
           issue_category AS "issueCategory",
           priority, risk_level AS "riskLevel",
           status, latitude, longitude,
           created_by AS "createdBy",
           reported_at AS "reportedAt",
           assigned_to AS "assignedTo",
           resolved_at AS "resolvedAt",
           sla_hours AS "slaHours",
           created_at AS "createdAt",
           updated_at AS "updatedAt",
           deleted_at AS "deletedAt"`, [
                payload.title ?? null,
                payload.description ?? null,
                payload.issueCategory ?? null,
                payload.priority ?? null,
                payload.riskLevel ?? null,
                payload.status ?? null,
                payload.assignedTo ?? null,
                payload.resolvedAt ?? null,
                payload.latitude ?? null,
                payload.longitude ?? null,
                id,
            ]);
            if (res.rowCount === 0) {
                throw new appErrors_1.NotFoundError('Rapport introuvable.');
            }
            await redis_service_1.redisCache.invalidate(`report:id:${id}`);
            await redis_service_1.redisCache.invalidatePattern('reports:all:*');
            return res.rows[0];
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur updateReport: ${error.message}`);
            throw error;
        }
    }
    /** Suppression logique d'un rapport. */
    async deleteReport(id) {
        try {
            const res = await this.db.query(`UPDATE reports SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`, [id]);
            if ((res.rowCount ?? 0) === 0) {
                throw new appErrors_1.NotFoundError('Rapport introuvable.');
            }
            await redis_service_1.redisCache.invalidate(`report:id:${id}`);
            await redis_service_1.redisCache.invalidatePattern('reports:all:*');
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur deleteReport: ${error.message}`);
            throw error;
        }
    }
    // ───────────────────────────────────────────────────────────────────────────
    // EXTENSIONS 1:1 PAR CATÉGORIE
    // ───────────────────────────────────────────────────────────────────────────
    async insertReportDetail(client, reportId, category, d) {
        switch (category) {
            case report_enums_1.IssueCategory.DRAINAGE:
                await client.query(`INSERT INTO report_details_drainage (report_id, blockage_level_pct, water_level_cm, flow_status)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (report_id) DO NOTHING`, [reportId, d.blockageLevelPct ?? null, d.waterLevelCm ?? null, d.flowStatus ?? null]);
                break;
            case report_enums_1.IssueCategory.ROAD:
                await client.query(`INSERT INTO report_details_road (report_id, damage_surface_m2, pothole_depth_cm)
           VALUES ($1, $2, $3)
           ON CONFLICT (report_id) DO NOTHING`, [reportId, d.damageSurfaceM2 ?? null, d.potholeDepthCm ?? null]);
                break;
            case report_enums_1.IssueCategory.WASTE:
                await client.query(`INSERT INTO report_details_waste (report_id, estimated_volume_m3, waste_type)
           VALUES ($1, $2, $3)
           ON CONFLICT (report_id) DO NOTHING`, [reportId, d.estimatedVolumeM3 ?? null, d.wasteType ?? null]);
                break;
            case report_enums_1.IssueCategory.BIODIVERSITY:
                await client.query(`INSERT INTO report_details_biodiversity (report_id, species_name, observation_type, count)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (report_id) DO NOTHING`, [reportId, d.speciesName ?? null, d.observationType ?? null, d.count ?? null]);
                break;
            case report_enums_1.IssueCategory.ENVIRONMENT:
                await client.query(`INSERT INTO report_details_environment (report_id, sensor_id, measured_value, unit)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (report_id) DO NOTHING`, [reportId, d.sensorId ?? null, d.measuredValue ?? null, d.unit ?? null]);
                break;
            default:
                break;
        }
    }
    /** Récupère le détail 1:1 d'un rapport selon sa catégorie. */
    async getReportDetails(reportId) {
        try {
            const key = `report:details:${reportId}`;
            return await redis_service_1.redisCache.getOrSet(key, async () => {
                const report = await this.getReportById(reportId);
                if (!report)
                    return null;
                const tableMap = {
                    [report_enums_1.IssueCategory.DRAINAGE]: 'report_details_drainage',
                    [report_enums_1.IssueCategory.ROAD]: 'report_details_road',
                    [report_enums_1.IssueCategory.WASTE]: 'report_details_waste',
                    [report_enums_1.IssueCategory.BIODIVERSITY]: 'report_details_biodiversity',
                    [report_enums_1.IssueCategory.ENVIRONMENT]: 'report_details_environment',
                };
                const table = tableMap[report.issueCategory];
                if (!table)
                    return null;
                const res = await this.db.query(`SELECT * FROM ${table} WHERE report_id = $1 LIMIT 1`, [reportId]);
                return res.rowCount > 0 ? res.rows[0] : null;
            }, 600);
        }
        catch (error) {
            this.logger.error(`Erreur getReportDetails: ${error.message}`);
            throw error;
        }
    }
    // ───────────────────────────────────────────────────────────────────────────
    // HISTORIQUE DES STATUTS
    // ───────────────────────────────────────────────────────────────────────────
    /** Récupère l'historique des statuts d'un rapport. */
    async getReportStatusHistory(reportId) {
        try {
            const res = await this.db.query(`SELECT
           id,
           report_id             AS "reportId",
           old_status            AS "oldStatus",
           new_status            AS "newStatus",
           changed_by            AS "changedBy",
           created_at            AS "createdAt"
         FROM report_status_history
         WHERE report_id = $1
         ORDER BY created_at ASC`, [reportId]);
            return res.rows;
        }
        catch (error) {
            this.logger.error(`Erreur getReportStatusHistory: ${error.message}`);
            throw error;
        }
    }
}
exports.ReportRepository = ReportRepository;
//# sourceMappingURL=report.repositories.js.map