"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
/**
 * Repository dashboard — accès données pur (SQL uniquement).
 * Aucune logique métier (calculs de pourcentages, branchements par rôle,
 * pagination) n'est effectuée ici : elle appartient aux services.
 */
class DashboardRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    /** KPIs — branche "societe" : uniquement les données de son organisation. */
    async getSocieteKpis(organizationId) {
        const [activeMissions, activeInterventions, resolvedStats] = await Promise.all([
            this.db.query(`SELECT COUNT(*)::int AS count FROM missions WHERE assigned_organization_id = $1 AND status NOT IN ('completed','cancelled')`, [organizationId]),
            this.db.query(`SELECT COUNT(*)::int AS count FROM interventions WHERE assigned_societe_id = $1 AND status NOT IN ('completed','cancelled')`, [organizationId]),
            this.db.query(`SELECT
           COUNT(*) FILTER (WHERE status = 'completed')::float / GREATEST(COUNT(*), 1) * 100 AS rate
         FROM interventions WHERE assigned_societe_id = $1`, [organizationId]),
        ]);
        return {
            activeMissions: activeMissions.rows[0].count,
            activeInterventions: activeInterventions.rows[0].count,
            resolutionRate: Math.round(resolvedStats.rows[0].rate || 0),
        };
    }
    /** KPIs — branche "administration" : données globales de la plateforme. */
    async getAdminKpis(thisMonth, lastMonth) {
        const [totalReports, thisMonthReports, lastMonthReports, activeMissions, activeInterventions, activeSocietes, resolvedStats] = await Promise.all([
            this.db.query(`SELECT COUNT(*)::int AS count FROM reports WHERE deleted_at IS NULL`),
            this.db.query(`SELECT COUNT(*)::int AS count FROM reports WHERE deleted_at IS NULL AND reported_at >= $1`, [thisMonth]),
            this.db.query(`SELECT COUNT(*)::int AS count FROM reports WHERE deleted_at IS NULL AND reported_at >= $1 AND reported_at < $2`, [lastMonth, thisMonth]),
            this.db.query(`SELECT COUNT(*)::int AS count FROM missions WHERE status NOT IN ('completed','cancelled')`),
            this.db.query(`SELECT COUNT(*)::int AS count FROM interventions WHERE status NOT IN ('completed','cancelled')`),
            this.db.query(`SELECT COUNT(*)::int AS count FROM organizations WHERE is_active = true`),
            this.db.query(`SELECT
             (COUNT(*) FILTER (WHERE status = 'resolved')::float / GREATEST(COUNT(*), 1) * 100) AS current_rate,
             (COUNT(*) FILTER (WHERE status = 'resolved' AND reported_at < $1)::float / GREATEST(COUNT(*) FILTER (WHERE reported_at < $1), 1) * 100) AS past_rate
           FROM reports WHERE deleted_at IS NULL`, [thisMonth]),
        ]);
        return {
            totalReports: totalReports.rows[0].count,
            thisMonthReports: thisMonthReports.rows[0].count,
            lastMonthReports: lastMonthReports.rows[0].count,
            activeMissions: activeMissions.rows[0].count,
            activeInterventions: activeInterventions.rows[0].count,
            activeSocietes: activeSocietes.rows[0].count,
            currentRate: resolvedStats.rows[0].current_rate || 0,
            pastRate: resolvedStats.rows[0].past_rate || 0,
        };
    }
    async getActivityChart(months) {
        const res = await this.db.query(`WITH months AS (
         SELECT generate_series(
           date_trunc('month', NOW()) - interval '${months - 1} months',
           date_trunc('month', NOW()),
           '1 month'::interval
         ) AS month_start
       ),
       reports_agg AS (
         SELECT date_trunc('month', reported_at) AS m, COUNT(*)::int AS cnt
         FROM reports WHERE deleted_at IS NULL
         GROUP BY m
       ),
       missions_agg AS (
         SELECT date_trunc('month', created_at) AS m, COUNT(*)::int AS cnt
         FROM missions
         GROUP BY m
       )
       SELECT
         to_char(ms.month_start, 'Mon ''YY') AS month,
         COALESCE(r.cnt, 0) AS reports,
         COALESCE(mi.cnt, 0) AS missions
       FROM months ms
       LEFT JOIN reports_agg r ON r.m = ms.month_start
       LEFT JOIN missions_agg mi ON mi.m = ms.month_start
       ORDER BY ms.month_start`);
        return res.rows.map((row) => ({
            month: row.month,
            reports: row.reports,
            missions: row.missions,
        }));
    }
    async getReportsByCategory() {
        const res = await this.db.query(`SELECT issue_category AS category, COUNT(*)::int AS count
       FROM reports
       WHERE deleted_at IS NULL AND reported_at >= NOW() - INTERVAL '6 months'
       GROUP BY issue_category
       ORDER BY count DESC`);
        return res.rows.map((row) => ({
            category: row.category,
            count: row.count,
        }));
    }
    async getReportsByStatus() {
        const res = await this.db.query(`SELECT status AS category, COUNT(*)::int AS count
       FROM reports
       WHERE deleted_at IS NULL
       GROUP BY status
       ORDER BY count DESC`);
        return res.rows.map((row) => ({
            category: row.category,
            count: row.count,
        }));
    }
    async getPriorityMissions(limit) {
        const res = await this.db.query(`SELECT m.id, m.title, t.name AS territory, m.status, m.priority_level AS "priorityLevel", m.scheduled_at AS "scheduledAt"
       FROM missions m
       JOIN territories t ON t.id = m.territory_id
       WHERE m.status NOT IN ('completed','cancelled')
         AND m.priority_level IN ('critical','high')
       ORDER BY
         CASE m.priority_level WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END,
         m.scheduled_at ASC NULLS LAST
       LIMIT $1`, [limit]);
        return res.rows;
    }
    async getRecentInterventions(limit, organizationId) {
        const params = [limit];
        let orgFilter = '';
        if (organizationId) {
            params.push(organizationId);
            orgFilter = `AND i.assigned_societe_id = $2`;
        }
        const res = await this.db.query(`SELECT i.id, i.intervention_type AS title, o.name AS "societeName", i.status, i.created_at AS "createdAt"
       FROM interventions i
       LEFT JOIN organizations o ON o.id = i.assigned_societe_id
       WHERE 1=1 ${orgFilter}
       ORDER BY i.created_at DESC
       LIMIT $1`, params);
        return res.rows;
    }
    async getRecentReports(offset, limit, search, status) {
        const params = [];
        let conditions = `r.deleted_at IS NULL`;
        if (search) {
            params.push(`%${search.toLowerCase()}%`);
            conditions += ` AND (lower(r.title) LIKE $${params.length} OR lower(r.description) LIKE $${params.length})`;
        }
        if (status) {
            params.push(status);
            conditions += ` AND r.status = $${params.length}`;
        }
        const countRes = await this.db.query(`SELECT COUNT(*)::int AS total FROM reports r WHERE ${conditions}`, params);
        const total = countRes.rows[0].total;
        params.push(limit, offset);
        const dataRes = await this.db.query(`SELECT r.id, r.title, r.issue_category AS category, t.name AS territory,
              r.status, r.reported_at AS "reportedAt", r.priority,
              r.latitude, r.longitude
       FROM reports r
       JOIN territories t ON t.id = r.territory_id
       WHERE ${conditions}
       ORDER BY r.reported_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
        return {
            data: dataRes.rows,
            total,
        };
    }
}
exports.DashboardRepository = DashboardRepository;
//# sourceMappingURL=dashboard.repositories.js.map