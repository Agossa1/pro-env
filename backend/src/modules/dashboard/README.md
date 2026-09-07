# MODULE DASHBOARD — Analytics & KPIs

## 📌 Rôle

Module de **tableaux de bord analytiques** fournissant des agrégats en temps réel
sur l'ensemble de la plateforme SIGIE. Expose 7 endpoints GET-only, chacun
alimenté par une requête SQL d'agrégation distincte. Les données sont calculées
**à la volée** (sans cache Redis) pour garantir leur fraîcheur.

> **Périmètre adaptatif par rôle** :
> - Rôle `societe` → KPIs et interventions restreints à son `organizationId`.
> - Tous les autres rôles → données globales de la plateforme.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `controllers/` | Reçoit les requêtes HTTP, extrait les paramètres query + `req.user`, répond en JSON |
| `services/` | Logique métier (branchement par rôle, calculs de % d'évolution, pagination) |
| `repositories/` | Accès SQL pur (agrégats, jointures, filtres temporels — Promise.all) |
| `types/` | Types TypeScript (interfaces domain + raw types retournés par le repository) |

## 🧩 Fichiers et responsabilités

### Services

| Fichier | Responsabilité |
|---|---|
| `services/getKpis.service.ts` | KPIs globaux ou filtrés par société selon `userRole` + calcul des % d'évolution mois/mois |
| `services/getActivityChart.service.ts` | Graphique d'activité (N derniers mois glissants) |
| `services/getReportsByCategory.service.ts` | Répartition des signalements par catégorie (6 derniers mois) |
| `services/getReportsByStatus.service.ts` | Répartition des signalements par statut (global) |
| `services/getPriorityMissions.service.ts` | Missions `critical` / `high` non terminées, triées par urgence |
| `services/getRecentInterventions.service.ts` | Dernières interventions (filtre optionnel `organizationId` pour les sociétés) |
| `services/getRecentReports.service.ts` | Signalements récents paginés avec recherche fulltext et filtre statut |

### Controllers

| Fichier | Responsabilité |
|---|---|
| `controllers/getKpis.controller.ts` | Injecte `user.roleCode` + `user.organizationId` depuis le JWT dans le service |
| `controllers/getActivityChart.controller.ts` | Paramètre `?months=` (défaut : 12) |
| `controllers/getReportsByCategory.controller.ts` | Aucun paramètre — retourne les 6 derniers mois |
| `controllers/getReportsByStatus.controller.ts` | Aucun paramètre — distribution globale tous statuts |
| `controllers/getPriorityMissions.controller.ts` | Paramètre `?limit=` (défaut : 5) |
| `controllers/getRecentInterventions.controller.ts` | Paramètres `?limit=` + `organizationId` extrait de `req.user` si rôle société |
| `controllers/getRecentReports.controller.ts` | Paramètres `?page=`, `?limit=`, `?search=`, `?status=` |

### Repository — `repositories/dashboard.repositories.ts`

| Méthode | SQL |
|---|---|
| `getAdminKpis(thisMonth, lastMonth)` | 7 requêtes parallèles (`Promise.all`) : total rapports, ce mois, mois dernier, missions actives, interventions actives, sociétés actives, taux résolution courant/passé |
| `getSocieteKpis(organizationId)` | 3 requêtes parallèles restreintes à l'organisation : missions actives + interventions actives + taux résolution |
| `getActivityChart(months)` | CTE `generate_series` : rapports + missions agrégés par mois sur N mois glissants (`LEFT JOIN` pour combler les mois vides) |
| `getReportsByCategory()` | `GROUP BY issue_category ORDER BY count DESC` — 6 derniers mois |
| `getReportsByStatus()` | `GROUP BY status ORDER BY count DESC` — global |
| `getPriorityMissions(limit)` | JOIN `territories` — filtre `priority_level IN ('critical','high')` + `status NOT IN ('completed','cancelled')`, tri urgence + `scheduled_at` |
| `getRecentInterventions(limit, organizationId?)` | JOIN `organizations` — tri `created_at DESC`, filtre optionnel `assigned_societe_id` |
| `getRecentReports(offset, limit, search, status)` | JOIN `territories` — recherche `ILIKE` sur titre et description, filtre statut, pagination `LIMIT/OFFSET` |

### Types — `types/dashboard.types.ts`

| Interface | Champs |
|---|---|
| `DashboardKpis` | `totalReports`, `reportsThisMonth`, `reportsChangePercent`, `activeMissions`, `activeInterventions`, `activeSocietes`, `resolutionRate`, `resolutionRateChange` |
| `ActivityPoint` | `month`, `reports`, `missions` |
| `CategoryCount` | `category`, `count` |
| `PriorityMission` | `id`, `title`, `territory`, `status`, `priorityLevel`, `scheduledAt` |
| `RecentIntervention` | `id`, `title`, `societeName`, `status`, `createdAt` |
| `RecentReport` | `id`, `title`, `category`, `territory`, `status`, `reportedAt`, `priority`, `latitude`, `longitude` |
| `RecentReportsResult` | Liste paginée `RecentReport` (data + total + page + limit + totalPages) |
| `AdminKpisRaw` | Raw : `totalReports`, `thisMonthReports`, `lastMonthReports`, `activeMissions`, `activeInterventions`, `activeSocietes`, `currentRate`, `pastRate` |
| `SocieteKpisRaw` | Raw : `activeMissions`, `activeInterventions`, `resolutionRate` |

## 🌐 API / Routes

Toutes les routes sont préfixées `/api/dashboard` et protégées par `authMiddleware`.

| Méthode | Chemin | Paramètres | Description |
|---|---|---|---|
| GET | `/api/dashboard/kpis` | _(contexte depuis `req.user`)_ | KPIs globaux ou filtrés par organisation |
| GET | `/api/dashboard/activity-chart` | `?months=12` | Évolution temporelle rapports + missions (N mois glissants) |
| GET | `/api/dashboard/reports-by-category` | _(aucun)_ | Répartition signalements par catégorie — 6 derniers mois |
| GET | `/api/dashboard/reports-by-status` | _(aucun)_ | Répartition signalements par statut — global |
| GET | `/api/dashboard/priority-missions` | `?limit=5` | Missions critiques/haute priorité non terminées |
| GET | `/api/dashboard/recent-interventions` | `?limit=6` | Dernières interventions (scope société si applicable) |
| GET | `/api/dashboard/recent-reports` | `?page=1&limit=10&search=&status=` | Signalements récents paginés + recherche |

## 🔒 Sécurité / Contraintes

- Toutes les routes protégées par **`authMiddleware`** (JWT obligatoire).
- **Isolation société** : `GetKpisService` et `GetRecentInterventionsService` lisent
  `req.user.roleCode` et `req.user.organizationId` — aucune donnée d'une autre
  organisation n'est exposée pour le rôle `societe`.
- **Lecture seule** : le module Dashboard n'effectue **aucune écriture** en base.
- **Sans cache Redis** : données recalculées à chaque requête pour garantir
  la fraîcheur des KPIs et indicateurs.

## 🧩 Logique métier clé — `GetKpisService`

```
getKpis(userRole, organizationId?)
  ├── si userRole === 'societe' && organizationId
  │     → getSocieteKpis(organizationId)
  │           activeMissions, activeInterventions, resolutionRate
  └── sinon
        → getPlatformKpis()
              → getAdminKpis(thisMonth, lastMonth)
              → reportsChangePercent = (thisMonth - lastMonth) / lastMonth * 100
              → resolutionRateChange  = (currentRate - pastRate) / pastRate * 100
```

## 🔄 Dépendances / Intégration

- **Auth** : `authMiddleware` + `req.user.roleCode` / `req.user.organizationId` pour le branchement par rôle.
- **Reports** : agrégats sur la table `reports` (totaux, catégories, statuts, geolocalisation).
- **Missions** : agrégats sur la table `missions` (actives, prioritaires, évolution mensuelle).
- **Interventions** : agrégats sur la table `interventions` (actives, récentes, taux de résolution).
- **Organizations** : JOIN pour afficher le nom de la société dans `recent-interventions`.
- **Territories** : JOIN pour afficher le nom du territoire dans `priority-missions` et `recent-reports`.
