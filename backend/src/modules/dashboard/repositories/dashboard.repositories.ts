import type { Logger } from 'winston';
import PostgresDatabase from '../../../config/database/postgres';
import {
  ActivityPoint,
  CategoryCount,
  PriorityMission,
  RecentIntervention,
  RecentReport,
} from '../types/dashboard.types';

// ─────────────────────────────────────────────────────────────────────────────
// RAW TYPES — données brutes retournées par le repository (avant calcul métier)
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminKpisRaw {
  totalReports: number;
  thisMonthReports: number;
  lastMonthReports: number;
  activeMissions: number;
  activeInterventions: number;
  activeSocietes: number;
  currentRate: number;
  pastRate: number;
}

export interface SocieteKpisRaw {
  activeMissions: number;
  activeInterventions: number;
  resolutionRate: number;
}

export interface RecentReportsRaw {
  data: RecentReport[];
  total: number;
}

/**
 * Repository dashboard — accès données pur (SQL uniquement).
 * Aucune logique métier (calculs de pourcentages, branchements par rôle,
 * pagination) n'est effectuée ici : elle appartient aux services.
 */
export class DashboardRepository {
  constructor(
    private readonly db: PostgresDatabase,
    private readonly logger: Logger,
  ) {}

  /** KPIs — branche "societe" : uniquement les données de son organisation. */
  public async getSocieteKpis(organizationId: string): Promise<SocieteKpisRaw> {
    const [activeMissions, activeInterventions, resolvedStats] = await Promise.all([
      this.db.query(
        `SELECT COUNT(*)::int AS count FROM missions WHERE assigned_organization_id = $1 AND status NOT IN ('completed','cancelled')`,
        [organizationId],
      ),
      this.db.query(
        `SELECT COUNT(*)::int AS count FROM interventions WHERE assigned_societe_id = $1 AND status NOT IN ('completed','cancelled')`,
        [organizationId],
      ),
      this.db.query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'completed')::float / GREATEST(COUNT(*), 1) * 100 AS rate
         FROM interventions WHERE assigned_societe_id = $1`,
        [organizationId],
      ),
    ]);

    return {
      activeMissions: activeMissions.rows[0].count,
      activeInterventions: activeInterventions.rows[0].count,
      resolutionRate: Math.round(resolvedStats.rows[0].rate || 0),
    };
  }

  /** KPIs — branche "administration" : données globales de la plateforme. */
  public async getAdminKpis(thisMonth: Date, lastMonth: Date): Promise<AdminKpisRaw> {
    const [totalReports, thisMonthReports, lastMonthReports, activeMissions, activeInterventions, activeSocietes, resolvedStats] =
      await Promise.all([
        this.db.query(`SELECT COUNT(*)::int AS count FROM reports WHERE deleted_at IS NULL`),
        this.db.query(
          `SELECT COUNT(*)::int AS count FROM reports WHERE deleted_at IS NULL AND reported_at >= $1`,
          [thisMonth],
        ),
        this.db.query(
          `SELECT COUNT(*)::int AS count FROM reports WHERE deleted_at IS NULL AND reported_at >= $1 AND reported_at < $2`,
          [lastMonth, thisMonth],
        ),
        this.db.query(
          `SELECT COUNT(*)::int AS count FROM missions WHERE status NOT IN ('completed','cancelled')`,
        ),
        this.db.query(
          `SELECT COUNT(*)::int AS count FROM interventions WHERE status NOT IN ('completed','cancelled')`,
        ),
        this.db.query(`SELECT COUNT(*)::int AS count FROM organizations WHERE is_active = true`),
        this.db.query(
          `SELECT
             (COUNT(*) FILTER (WHERE status = 'resolved')::float / GREATEST(COUNT(*), 1) * 100) AS current_rate,
             (COUNT(*) FILTER (WHERE status = 'resolved' AND reported_at < $1)::float / GREATEST(COUNT(*) FILTER (WHERE reported_at < $1), 1) * 100) AS past_rate
           FROM reports WHERE deleted_at IS NULL`,
          [thisMonth],
        ),
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

  public async getActivityChart(months: number): Promise<ActivityPoint[]> {
    const res = await this.db.query(
      `WITH months AS (
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
       ORDER BY ms.month_start`,
    );

    return res.rows.map((row: any) => ({
      month: row.month,
      reports: row.reports,
      missions: row.missions,
    }));
  }

  public async getReportsByCategory(): Promise<CategoryCount[]> {
    const res = await this.db.query(
      `SELECT issue_category AS category, COUNT(*)::int AS count
       FROM reports
       WHERE deleted_at IS NULL AND reported_at >= NOW() - INTERVAL '6 months'
       GROUP BY issue_category
       ORDER BY count DESC`,
    );

    return res.rows.map((row: any) => ({
      category: row.category,
      count: row.count,
    }));
  }

  public async getReportsByStatus(): Promise<CategoryCount[]> {
    const res = await this.db.query(
      `SELECT status AS category, COUNT(*)::int AS count
       FROM reports
       WHERE deleted_at IS NULL
       GROUP BY status
       ORDER BY count DESC`,
    );

    return res.rows.map((row: any) => ({
      category: row.category,
      count: row.count,
    }));
  }

  public async getPriorityMissions(limit: number): Promise<PriorityMission[]> {
    const res = await this.db.query(
      `SELECT m.id, m.title, t.name AS territory, m.status, m.priority_level AS "priorityLevel", m.scheduled_at AS "scheduledAt"
       FROM missions m
       JOIN territories t ON t.id = m.territory_id
       WHERE m.status NOT IN ('completed','cancelled')
         AND m.priority_level IN ('critical','high')
       ORDER BY
         CASE m.priority_level WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END,
         m.scheduled_at ASC NULLS LAST
       LIMIT $1`,
      [limit],
    );

    return res.rows;
  }

  public async getRecentInterventions(limit: number, organizationId?: string): Promise<RecentIntervention[]> {
    const params: any[] = [limit];
    let orgFilter = '';
    if (organizationId) {
      params.push(organizationId);
      orgFilter = `AND i.assigned_societe_id = $2`;
    }

    const res = await this.db.query(
      `SELECT i.id, i.intervention_type AS title, o.name AS "societeName", i.status, i.created_at AS "createdAt"
       FROM interventions i
       LEFT JOIN organizations o ON o.id = i.assigned_societe_id
       WHERE 1=1 ${orgFilter}
       ORDER BY i.created_at DESC
       LIMIT $1`,
      params,
    );

    return res.rows;
  }

  public async getRecentReports(
    offset: number,
    limit: number,
    search: string,
    status: string,
  ): Promise<RecentReportsRaw> {
    const params: any[] = [];

    let conditions = `r.deleted_at IS NULL`;
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      conditions += ` AND (lower(r.title) LIKE $${params.length} OR lower(r.description) LIKE $${params.length})`;
    }
    if (status) {
      params.push(status);
      conditions += ` AND r.status = $${params.length}`;
    }

    const countRes = await this.db.query(
      `SELECT COUNT(*)::int AS total FROM reports r WHERE ${conditions}`,
      params,
    );
    const total = countRes.rows[0].total;

    params.push(limit, offset);
    const dataRes = await this.db.query(
      `SELECT r.id, r.title, r.issue_category AS category, t.name AS territory,
              r.status, r.reported_at AS "reportedAt", r.priority,
              r.latitude, r.longitude
       FROM reports r
       JOIN territories t ON t.id = r.territory_id
       WHERE ${conditions}
       ORDER BY r.reported_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );

    return {
      data: dataRes.rows,
      total,
    };
  }
}
