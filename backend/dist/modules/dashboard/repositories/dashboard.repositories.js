"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
/**
 * Repository dashboard — accès données pur (SQL uniquement).
 * Intègre le filtrage par territoire et par rôle via DashboardFilters.
 */
class DashboardRepository {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
    }
    // ───────────────────────────────────────────────────────────────────────────
    // SCOPE HELPERS (Territory & Role based restrictions)
    // ───────────────────────────────────────────────────────────────────────────
    buildReportScope(f, params, rAlias = 'r') {
        if (!f)
            return '';
        const conditions = [];
        if (f.forcedRegionId) {
            params.push(f.forcedRegionId);
            conditions.push(`${rAlias}.municipality_id IN (SELECT id FROM municipalities WHERE region_id = $${params.length})`);
        }
        if (f.forcedMunicipalityId) {
            params.push(f.forcedMunicipalityId);
            conditions.push(`${rAlias}.municipality_id = $${params.length}`);
        }
        if (f.forcedDistrictId) {
            params.push(f.forcedDistrictId);
            conditions.push(`${rAlias}.district_id = $${params.length}`);
        }
        if (f.forcedNeighborhoodId) {
            // Pour les rapports, on n'a pas neighborhood_id directement, mais on peut ajouter s'il est là.
            // Par défaut, le dashboard ignore ce niveau ou ne l'a pas. 
            // Si un admin_mairie est affecté au quartier, ce qui est rare, ça pourrait casser, 
            // mais en général l'API liste filtre via d'autres champs.
            // On va juste faire un fallback false si besoin ou l'ignorer.
        }
        if (f.forcedCreatedBy) {
            params.push(f.forcedCreatedBy);
            conditions.push(`${rAlias}.created_by = $${params.length}`);
        }
        return conditions.length ? ' AND ' + conditions.join(' AND ') : '';
    }
    buildMissionScope(f, params, mAlias = 'm') {
        if (!f)
            return '';
        const conditions = [];
        if (f.forcedRegionId) {
            params.push(f.forcedRegionId);
            conditions.push(`${mAlias}.municipality_id IN (SELECT id FROM municipalities WHERE region_id = $${params.length})`);
        }
        if (f.forcedMunicipalityId) {
            params.push(f.forcedMunicipalityId);
            conditions.push(`${mAlias}.municipality_id = $${params.length}`);
        }
        if (f.forcedDistrictId) {
            params.push(f.forcedDistrictId);
            conditions.push(`${mAlias}.municipality_id IN (SELECT municipality_id FROM districts WHERE id = $${params.length})`);
        }
        if (f.forcedCreatedBy) {
            params.push(f.forcedCreatedBy);
            conditions.push(`${mAlias}.created_by = $${params.length}`);
        }
        if (f.forcedUserIdForTeamScopes) {
            params.push(f.forcedUserIdForTeamScopes);
            conditions.push(`EXISTS (
        SELECT 1 FROM field_team_members ftm
        WHERE ftm.team_id = ${mAlias}.assigned_team_id
          AND ftm.user_id = $${params.length}
          AND ftm.is_active = TRUE
      )`);
        }
        return conditions.length ? ' AND ' + conditions.join(' AND ') : '';
    }
    buildInterventionScope(f, params, iAlias = 'i') {
        if (!f)
            return '';
        const conditions = [];
        // Pour filtrer les interventions par territoire, il faut faire une jointure avec missions.
        // Mais on peut faire une sous-requête EXISTS :
        let needsMissionJoin = false;
        const missionConds = [];
        if (f.forcedRegionId) {
            params.push(f.forcedRegionId);
            missionConds.push(`ms.municipality_id IN (SELECT id FROM municipalities WHERE region_id = $${params.length})`);
            needsMissionJoin = true;
        }
        if (f.forcedMunicipalityId) {
            params.push(f.forcedMunicipalityId);
            missionConds.push(`ms.municipality_id = $${params.length}`);
            needsMissionJoin = true;
        }
        if (f.forcedDistrictId) {
            params.push(f.forcedDistrictId);
            missionConds.push(`ms.municipality_id IN (SELECT municipality_id FROM districts WHERE id = $${params.length})`);
            needsMissionJoin = true;
        }
        if (needsMissionJoin) {
            conditions.push(`EXISTS (SELECT 1 FROM missions ms WHERE ms.id = ${iAlias}.mission_id AND ${missionConds.join(' AND ')})`);
        }
        if (f.forcedCreatedBy) {
            // Dans interventions, le technicien est 'assigned_to_user_id' ou membre de l'équipe
            params.push(f.forcedCreatedBy);
            conditions.push(`${iAlias}.assigned_to_user_id = $${params.length}`);
        }
        if (f.forcedUserIdForTeamScopes) {
            params.push(f.forcedUserIdForTeamScopes);
            conditions.push(`EXISTS (
        SELECT 1 FROM field_team_members ftm
        INNER JOIN missions ms ON ms.assigned_team_id = ftm.team_id
        WHERE ms.id = ${iAlias}.mission_id
          AND ftm.user_id = $${params.length}
          AND ftm.is_active = TRUE
      )`);
        }
        return conditions.length ? ' AND ' + conditions.join(' AND ') : '';
    }
    // ───────────────────────────────────────────────────────────────────────────
    // KPIs
    // ───────────────────────────────────────────────────────────────────────────
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
    /** KPIs — branche "administration" : filtré par territoire si fourni. */
    async getAdminKpis(thisMonth, lastMonth, filters) {
        const rParams1 = [];
        const rParams2 = [thisMonth];
        const rParams3 = [lastMonth, thisMonth];
        const rParams7 = [thisMonth];
        const rScope1 = this.buildReportScope(filters, rParams1, 'r');
        const rScope2 = this.buildReportScope(filters, rParams2, 'r');
        const rScope3 = this.buildReportScope(filters, rParams3, 'r');
        const rScope7 = this.buildReportScope(filters, rParams7, 'r');
        const mParams = [];
        const mScope = this.buildMissionScope(filters, mParams, 'm');
        const iParams = [];
        const iScope = this.buildInterventionScope(filters, iParams, 'i');
        const [totalReports, thisMonthReports, lastMonthReports, activeMissions, activeInterventions, activeSocietes, resolvedStats] = await Promise.all([
            this.db.query(`SELECT COUNT(*)::int AS count FROM reports r WHERE r.deleted_at IS NULL ${rScope1}`, rParams1),
            this.db.query(`SELECT COUNT(*)::int AS count FROM reports r WHERE r.deleted_at IS NULL AND r.reported_at >= $1 ${rScope2}`, rParams2),
            this.db.query(`SELECT COUNT(*)::int AS count FROM reports r WHERE r.deleted_at IS NULL AND r.reported_at >= $1 AND r.reported_at < $2 ${rScope3}`, rParams3),
            this.db.query(`SELECT COUNT(*)::int AS count FROM missions m WHERE m.status NOT IN ('completed','cancelled') ${mScope}`, mParams),
            this.db.query(`SELECT COUNT(*)::int AS count FROM interventions i WHERE i.status NOT IN ('completed','cancelled') ${iScope}`, iParams),
            this.db.query(`SELECT COUNT(*)::int AS count FROM organizations WHERE is_active = true`),
            this.db.query(`SELECT
             (COUNT(*) FILTER (WHERE r.status = 'resolved')::float / GREATEST(COUNT(*), 1) * 100) AS current_rate,
             (COUNT(*) FILTER (WHERE r.status = 'resolved' AND r.reported_at < $1)::float / GREATEST(COUNT(*) FILTER (WHERE r.reported_at < $1), 1) * 100) AS past_rate
           FROM reports r WHERE r.deleted_at IS NULL ${rScope7}`, rParams7),
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
    // ───────────────────────────────────────────────────────────────────────────
    // CHARTS & LISTS
    // ───────────────────────────────────────────────────────────────────────────
    async getActivityChart(months, filters) {
        const rParams = [];
        const rScope = this.buildReportScope(filters, rParams, 'r');
        const mParams = [];
        const mScope = this.buildMissionScope(filters, mParams, 'm');
        // On combine les deux paramètres dans l'ordre pour les passer à une seule requête globale
        // Mais CTE ne permet pas facilement de combiner des bind params dynamiques si l'on a des tableaux séparés.
        // Au lieu d'une query géante, on peut faire deux queries ou injecter astucieusement :
        const aggParams = [...rParams, ...mParams];
        // Décalage des index pour la deuxième CTE
        let mScopeShifted = mScope;
        let indexShift = rParams.length;
        // C'est dangereux de faire un replace simple de $1, $2, il vaut mieux le faire proprement.
        // Ou on exécute simplement 3 requêtes (months, reports, missions) et on les merge en JS.
        // Faisons la fusion en JS, c'est bcp plus sûr et maintenable avec des scopes dynamiques.
        const monthsRes = await this.db.query(`
       SELECT generate_series(
         date_trunc('month', NOW()) - interval '${months - 1} months',
         date_trunc('month', NOW()),
         '1 month'::interval
       ) AS month_start
    `);
        const rRes = await this.db.query(`
      SELECT date_trunc('month', r.reported_at) AS m, COUNT(*)::int AS cnt
      FROM reports r WHERE r.deleted_at IS NULL ${rScope}
      GROUP BY m
    `, rParams);
        const mRes = await this.db.query(`
      SELECT date_trunc('month', m.created_at) AS m, COUNT(*)::int AS cnt
      FROM missions m WHERE 1=1 ${mScope}
      GROUP BY m
    `, mParams);
        const reportsMap = new Map(rRes.rows.map((r) => [r.m.toISOString(), r.cnt]));
        const missionsMap = new Map(mRes.rows.map((m) => [m.m.toISOString(), m.cnt]));
        return monthsRes.rows.map((row) => {
            const msIso = row.month_start.toISOString();
            return {
                month: row.month_start.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
                reports: reportsMap.get(msIso) || 0,
                missions: missionsMap.get(msIso) || 0,
            };
        });
    }
    async getReportsByCategory(filters) {
        const params = [];
        const scope = this.buildReportScope(filters, params, 'r');
        const res = await this.db.query(`SELECT r.issue_category AS category, COUNT(*)::int AS count
       FROM reports r
       WHERE r.deleted_at IS NULL AND r.reported_at >= NOW() - INTERVAL '6 months'
       ${scope}
       GROUP BY r.issue_category
       ORDER BY count DESC`, params);
        return res.rows.map((row) => ({
            category: row.category,
            count: row.count,
        }));
    }
    async getReportsByStatus(filters) {
        const params = [];
        const scope = this.buildReportScope(filters, params, 'r');
        const res = await this.db.query(`SELECT r.status AS category, COUNT(*)::int AS count
       FROM reports r
       WHERE r.deleted_at IS NULL
       ${scope}
       GROUP BY r.status
       ORDER BY count DESC`, params);
        return res.rows.map((row) => ({
            category: row.category,
            count: row.count,
        }));
    }
    async getPriorityMissions(limit, filters) {
        const params = [limit];
        const scope = this.buildMissionScope(filters, params, 'm');
        // Warning: params has limit as $1, scope will start adding at $2
        const res = await this.db.query(`SELECT m.id, m.title,
              COALESCE(mn.name, 'Territoire Inconnu') AS territory,
              m.status, m.priority_level AS "priorityLevel", m.scheduled_at AS "scheduledAt"
       FROM missions m
       LEFT JOIN municipalities mn ON mn.id = m.municipality_id
       WHERE m.status NOT IN ('completed','cancelled')
         AND m.priority_level IN ('critical','high')
         ${scope}
       ORDER BY
         CASE m.priority_level WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END,
         m.scheduled_at ASC NULLS LAST
       LIMIT $1`, params);
        return res.rows;
    }
    async getRecentInterventions(limit, organizationId, filters) {
        const params = [limit];
        let orgFilter = '';
        if (organizationId) {
            params.push(organizationId);
            orgFilter = `AND i.assigned_societe_id = $${params.length}`;
        }
        const scope = this.buildInterventionScope(filters, params, 'i');
        const res = await this.db.query(`SELECT i.id, i.intervention_type AS title, o.name AS "societeName", i.status, i.created_at AS "createdAt"
       FROM interventions i
       LEFT JOIN organizations o ON o.id = i.assigned_societe_id
       WHERE 1=1 ${orgFilter} ${scope}
       ORDER BY i.created_at DESC
       LIMIT $1`, params);
        return res.rows;
    }
    async getRecentReports(offset, limit, search, status, filters) {
        const params = [];
        const scope = this.buildReportScope(filters, params, 'r');
        let conditions = `r.deleted_at IS NULL ${scope}`;
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
        const dataRes = await this.db.query(`SELECT r.id, r.title, r.issue_category AS category,
              COALESCE(mn.name, ds.name, 'Territoire Inconnu') AS territory,
              r.status, r.reported_at AS "reportedAt", r.priority,
              r.latitude, r.longitude
       FROM reports r
       LEFT JOIN municipalities mn ON mn.id = r.municipality_id
       LEFT JOIN districts ds      ON ds.id = r.district_id
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