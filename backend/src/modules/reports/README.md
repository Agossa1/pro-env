# MODULE REPORTS — Signalements terrain

## 📌 Rôle

Module de gestion des **rapports de signalement terrain** (rapports des
techniciens) : caniveaux bouchés, routes endommagées, déchets, biodiversité,
environnement... Chaque rapport est lié à un **territoire** (quartier/village),
peut référencer une **infrastructure** ou une **zone cartographiée**, et porte
des métadonnées : catégorie, priorité, risque, statut, géolocalisation, SLA.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `controller/` | Reçoit les requêtes HTTP, valide les entrées (Zod), répond en JSON standardisé |
| `services/` | Logique métier (créateur injecté, wrappers NotFound) |
| `repositories/` | Accès SQL à la table `reports` + extensions `report_details_*` + `report_status_history` |
| `validations/` | Schémas Zod (création, mise à jour, params UUID) |
| `types/` | Types TypeScript (enums, interfaces row/domain/payload) |
| `test/` | Tests unitaires (repositories, services, controllers) |

## 🧩 Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/getReports.service.ts` | Liste paginée (filtres territoire/statut/catégorie) |
| `services/getReportById.service.ts` | Rapport par UUID |
| `services/createReport.service.ts` | Création (territoire/titre/catégorie requis + créateur injecté) |
| `services/updateReport.service.ts` | Mise à jour (titre, statut, priorité...) |
| `services/deleteReport.service.ts` | Suppression logique (`deleted_at`) |
| `services/getReportDetails.service.ts` | Détails 1:1 selon la catégorie |
| `services/getReportStatusHistory.service.ts` | Historique des statuts |
| `repositories/report.repositories.ts` | CRUD + insert détail 1:1 + historique + cache Redis |
| `validations/report.validations.ts` | Schémas Zod (Create/Update/params) |
| `types/report.enums.ts` | IssueCategory, ReportStatus, PriorityLevel, RiskLevel, WaterFlowStatus |
| `types/report.types.ts` | Report, détails par catégorie, historique, payloads |
| `routes/report.route.ts` | Déclaration des routes `/api/reports/*` |
| `report.module.ts` | Assemblage (repo → services → contrôleurs → routes) |

## 🌐 API / Routes

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/reports` | Liste paginée (filtres `territoryId`, `status`, `issueCategory`) |
| GET | `/api/reports/:id/status-history` | Historique des statuts |
| GET | `/api/reports/:id/details` | Détails 1:1 selon la catégorie |
| GET | `/api/reports/:id` | Détail d'un rapport |
| POST | `/api/reports` | Créer un signalement |
| PUT | `/api/reports/:id` | Mettre à jour (statut, priorité...) |
| DELETE | `/api/reports/:id` | Suppression logique |

> ⚠️ Les routes `/:id/status-history` et `/:id/details` sont déclarées **avant**
> `/:id` pour éviter le conflit Express.

## 🗂️ Extensions 1:1 par catégorie (Class Table Inheritance)

| Catégorie | Table | Champs |
|---|---|---|
| drainage | `report_details_drainage` | blockage_level_pct, water_level_cm, flow_status |
| road | `report_details_road` | damage_surface_m2, pothole_depth_cm |
| waste | `report_details_waste` | estimated_volume_m3, waste_type |
| biodiversity | `report_details_biodiversity` | species_name, observation_type, count |
| environment | `report_details_environment` | sensor_id, measured_value, unit |

L'INSERT du détail est fait dans la **même transaction** que l'INSERT du rapport.

## 🔒 Sécurité / Contraintes

- Toutes les routes protégées par **`authMiddleware`** (JWT obligatoire).
- `created_by` est injecté depuis l'utilisateur connecté (`req.user.userId`).
- **Créateur obligatoire** (FK `auth` RESTRICT) : tout rapport est créé par un utilisateur interne.
- **SLA** : `sla_hours` défaut 48h, passage auto en `under_review` si dépassé (trigger).
- **Suppression logique** (jamais physique).
- L'historique des statuts est alimenté par un **trigger** (`trg_track_report_status`).
- Cache Redis invalidé à chaque mutation (`reports:all:*`, `report:id:*`).

## 🧪 Tests

| Fichier | Couverture |
|---|---|
| `test/report.repositories.spec.ts` | CRUD, transactions, insert détail 1:1, ROLLBACK (23503), suppression logique |
| `test/reports.services.spec.ts` | Succès + erreurs (BadRequest/NotFound), créateur injecté |
| `test/reports.controllers.spec.ts` | 200/201, validation Zod 400, erreurs → next |

## 🔄 Dépendances / Intégration

- **Auth** : `created_by` / `assigned_to` référencent `auth(id)`.
- **Territory** : chaque rapport est rattaché à un territoire (`territories.id`).
- **Infrastructures / Mapped areas** : références optionnelles.
- **Societes** : les signalements alimentent les missions exécutées par les prestataires.
- **Missions / Interventions** : `missions.report_id` référence `reports(id)`.
- **Permissions** : le module RBAC référence `reports` (`reports.create`, `reports.read`...).