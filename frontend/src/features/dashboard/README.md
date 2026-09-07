# FEATURE DASHBOARD — Tableaux de bord & KPIs

## 📌 Rôle

Feature d'**affichage analytique** en temps réel. Contrairement aux autres features,
elle utilise un **hook local** (`useDashboard`) avec `useState`/`useEffect` plutôt
que Redux — les données du tableau de bord sont éphémères et ne nécessitent pas de persistence d'état global.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `components/` | 14 composants de visualisation (KPIs, graphiques, cartes, tableaux) |
| `hooks/useDashboard.ts` | Hook qui orchestre tous les appels API du dashboard en parallèle |
| `services/dashboard.api.ts` | 8 fonctions d'appel HTTP vers `/api/dashboard/*` |
| `services/dashboard.types.ts` | Types TS miroir du backend dashboard |

## 🧩 Composants

| Composant | Visualisation |
|---|---|
| `KpiCards.tsx` | 4 cartes KPI : rapports, missions actives, interventions actives, taux résolution |
| `ActivityChart.tsx` | Graphique linéaire rapports + missions (N mois glissants) |
| `CategoryChart.tsx` | Graphique barres : répartition signalements par catégorie |
| `DonutChart.tsx` | Donut : répartition par statut |
| `RadarChartCategories.tsx` | Radar chart multi-dimensions |
| `PriorityMissions.tsx` | Liste missions critiques/haute priorité en cours |
| `RecentInterventions.tsx` | Dernières interventions (N lignes) |
| `RecentReports.tsx` | Signalements récents paginés + recherche + filtre statut |
| `LeadsReportTable.tsx` | Table agrégée des signalements |
| `BeninMap.tsx` | Carte Leaflet/Mapbox des territoires (Bénin) |
| `ReportsMap.tsx` | Carte des signalements géolocalisés |
| `PerformanceGauge.tsx` | Jauge du taux de résolution |
| `LatestTransactions.tsx` | Dernières activités de la plateforme |
| `TasksList.tsx` | Liste des tâches/missions en attente |

## 🌐 API appelées (`dashboard.api.ts`)

| Fonction | Endpoint | Description |
|---|---|---|
| `fetchKpis` | GET `/dashboard/kpis` | KPIs globaux ou filtrés par organisation |
| `fetchActivityChart` | GET `/dashboard/activity-chart?months=` | Évolution mensuelle rapports + missions |
| `fetchReportsByCategory` | GET `/dashboard/reports-by-category` | Répartition par catégorie (6 mois) |
| `fetchReportsByStatus` | GET `/dashboard/reports-by-status` | Répartition par statut (global) |
| `fetchPriorityMissions` | GET `/dashboard/priority-missions?limit=` | Missions critiques/haute priorité |
| `fetchRecentInterventions` | GET `/dashboard/recent-interventions?limit=` | Dernières interventions |
| `fetchRecentReports` | GET `/dashboard/recent-reports?page=&limit=&search=&status=` | Signalements paginés |
| `fetchMapReports` | GET `/reports` | Points géolocalisés pour la carte |

## 🎣 Hook `useDashboard`

Gère **8 états locaux** (`kpis`, `activityData`, `categoryData`, `statusData`, `priorityMissions`,
`recentInterventions`, `recentReports`, `mapReports`) chargés en parallèle au montage.

Expose : `loading`, `refresh()`, et les données structurées pour chaque composant.

## 🔑 Types clés (`dashboard.types.ts`)

Miroir exact des types backend : `DashboardKpis`, `ActivityPoint`, `CategoryCount`,
`PriorityMission`, `RecentIntervention`, `RecentReport`, `RecentReportsPagination`, `ReportMapPoint`.
