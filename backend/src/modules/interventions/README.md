# MODULE INTERVENTIONS — Exécution terrain des missions

## 📌 Rôle

Module de gestion des **interventions** : réalisées par les **équipes terrain**
(`field_teams`) d'une société prestataire pour **exécuter une mission**.
Chaque intervention suit un cycle de vie (not_started → started → paused →
resumed → completed/failed/cancelled) et produit des **rapports de terrain**
(`field_intervention_reports`) : travaux effectués, % de dégagement, score de
condition finale, recommandations.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `controller/` | Reçoit les requêtes HTTP, valide les entrées (Zod), répond en JSON standardisé |
| `services/` | Logique métier (validation champs requis, créateur injecté pour rapports) |
| `repositories/` | Accès SQL à `interventions` + `field_intervention_reports` + cache Redis |
| `validations/` | Schémas Zod (création, mise à jour, rapport terrain, params) |
| `types/` | Types TypeScript (enums, interfaces row/domain/payload) |
| `test/` | Tests unitaires (repositories, services, controllers) |

## 🧩 Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/getInterventions.service.ts` | Liste paginée (filtres mission/équipe/statut) |
| `services/getInterventionById.service.ts` | Intervention par UUID |
| `services/createIntervention.service.ts` | Création (mission/équipe/type requis) |
| `services/updateIntervention.service.ts` | Mise à jour (statut, notes, dates) |
| `services/deleteIntervention.service.ts` | Suppression logique (`deleted_at`) |
| `services/createFieldReport.service.ts` | Création rapport terrain (auteur = utilisateur connecté) |
| `services/getInterventionReports.service.ts` | Rapports d'une intervention |
| `repositories/intervention.repositories.ts` | CRUD + rapports + cache Redis |
| `validations/intervention.validations.ts` | Schémas Zod (Create/Update/FieldReport/params) |
| `types/intervention.enums.ts` | InterventionStatus (7), TeamMemberRole (2) |
| `types/intervention.types.ts` | Intervention, FieldInterventionReport, payloads |
| `routes/intervention.route.ts` | Routes `/api/interventions/*` |
| `intervention.module.ts` | Assemblage (repo → services → contrôleurs → routes) |

## 🌐 API / Routes

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/interventions` | Liste paginée (filtres `missionId`, `teamId`, `status`) |
| GET | `/api/interventions/:id/reports` | Rapports terrain d'une intervention |
| POST | `/api/interventions/:id/reports` | Créer un rapport terrain (auteur = utilisateur connecté) |
| GET | `/api/interventions/:id` | Détail d'une intervention |
| POST | `/api/interventions` | Créer une intervention |
| PUT | `/api/interventions/:id` | Mettre à jour (statut, notes, dates) |
| DELETE | `/api/interventions/:id` | Suppression logique |

> ⚠️ Les routes `/:id/reports` sont déclarées **avant** `/:id` pour éviter le conflit Express.

## 🔒 Sécurité / Contraintes

- Toutes les routes protégées par **`authMiddleware`** (JWT obligatoire).
- **Auteur des rapports** : `created_by` doit être membre actif de l'équipe de
  l'intervention (trigger `trg_fireport_author_in_team`).
- **Cohérence pilote** : `assigned_to_user_id` doit appartenir à l'équipe
  assignée (trigger `trg_intervention_user_in_team`).
- **Dates cohérentes** : `ended_at >= started_at` (contrainte BDD).
- **Suppression logique** (jamais physique).
- Cache Redis invalidé à chaque mutation (`interventions:all:*`, `intervention:id:*`).

## 🧪 Tests

| Fichier | Couverture |
|---|---|
| `test/intervention.repositories.spec.ts` | CRUD, transactions, ROLLBACK (23503), rapports terrain |
| `test/interventions.services.spec.ts` | Succès + erreurs (BadRequest/NotFound), créateur injecté |
| `test/interventions.controllers.spec.ts` | 200/201, validation Zod 400, erreurs → next |

## 🔄 Dépendances / Intégration

- **Missions** : `interventions.mission_id` référence `missions(id)`.
- **Societes / Field teams** : `assigned_team_id` référence `field_teams(id)`
  (équipes de la société prestataire).
- **Auth** : `assigned_to_user_id`, `created_by` référencent `auth(id)`.
- **Reports** : `field_intervention_reports.report_id` référence `reports(id)`
  (signalement d'origine).
- **Permissions** : le module RBAC référence `interventions`
  (`interventions.create`, `interventions.read`, `interventions.update`...).