# MODULE MISSIONS — Gestion des missions d'intervention

## 📌 Rôle

Module de gestion des **missions d'intervention** : créées par l'administration
(mairie/ministère) et assignées à une **société prestataire** pour exécution sur
le terrain. Chaque mission est liée à un **territoire**, peut référencer un
**signalement** (reports), et suit un **cycle de vie complet** : draft → planned
→ assigned → accepted → in_progress → completed/closed (ou rejected/cancelled).

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `controller/` | Reçoit les requêtes HTTP, valide les entrées (Zod), répond en JSON standardisé |
| `services/` | Logique métier (créateur injecté, wrappers NotFound, validations) |
| `repositories/` | Accès SQL à la table `missions` + tables dérivées (checklist, assignments, status_history) |
| `validations/` | Schémas Zod (création, mise à jour, checklist, assignation, params) |
| `types/` | Types TypeScript (enums, interfaces row/domain/payload) |
| `test/` | Tests unitaires (repositories, services, controllers) |

## 🧩 Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/getMissions.service.ts` | Liste paginée (filtres territoire/statut/type/organisation) |
| `services/getMissionById.service.ts` | Mission par UUID |
| `services/createMission.service.ts` | Création (territoire/type/titre requis + créateur injecté) |
| `services/updateMission.service.ts` | Mise à jour (statut, assignation société/équipe, dates, refus) |
| `services/deleteMission.service.ts` | Suppression logique (`deleted_at`) |
| `services/getMissionChecklist.service.ts` | Checklist de sous-tâches |
| `services/addChecklistItem.service.ts` | Ajout d'une sous-tâche |
| `services/assignUserToMission.service.ts` | Assignation d'un utilisateur (idempotent) |
| `services/getMissionStatusHistory.service.ts` | Historique des statuts |
| `repositories/mission.repositories.ts` | CRUD + checklist + assignments + historique + cache Redis |
| `validations/mission.validations.ts` | Schémas Zod (Create/Update/Checklist/Assign/params) |
| `types/mission.enums.ts` | MissionType, MissionStatus, PriorityLevel |
| `types/mission.types.ts` | Mission, checklist, assignments, historique, payloads |
| `routes/mission.route.ts` | Déclaration des routes `/api/missions/*` |
| `mission.module.ts` | Assemblage (repo → services → contrôleurs → routes) |

## 🌐 API / Routes

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/missions` | Liste paginée (filtres `territoryId`, `status`, `missionType`, `organizationId`) |
| POST | `/api/missions` | Créer une mission (créateur = utilisateur connecté) |
| GET | `/api/missions/:id` | Détail d'une mission |
| PUT | `/api/missions/:id` | Mettre à jour (statut, assignation, dates, refus) |
| DELETE | `/api/missions/:id` | Suppression logique |
| GET | `/api/missions/:id/status-history` | Historique des statuts |
| GET | `/api/missions/:id/checklist` | Checklist de la mission |
| POST | `/api/missions/:id/checklist` | Ajouter une sous-tâche |
| POST | `/api/missions/:id/assignees` | Assigner un utilisateur |

> ⚠️ Les routes `/:id/status-history`, `/:id/checklist`, `/:id/assignees` sont
> déclarées **avant** `/:id` pour éviter le conflit Express.

## 🔒 Sécurité / Contraintes

- Toutes les routes protégées par **`authMiddleware`** (JWT obligatoire).
- **Créateur obligatoire** (FK `auth` RESTRICT) : toute mission est créée par un
  utilisateur administratif (mairie, ministère).
- **Statuts protégés** : rejet (`rejected`) exige une `rejectedReason`
  (contrainte BDD `chk_mission_acceptance`).
- **Dates cohérentes** : `due_date >= scheduled_at`, `completed_at >= scheduled_at`
  (contrainte BDD `chk_mission_dates`).
- **Compétence territoriale** : la société assignée doit être habilitée sur le
  territoire de la mission (trigger `trg_mission_organization_territory_check`).
- **Équipe subordonnée à la société** : `assigned_team_id` ne peut être fourni
  sans `assigned_organization_id` (contrainte `chk_mission_team_requires_org`).
- **Suppression logique** (jamais physique).
- Historique des statuts alimenté par un **trigger** (`trg_track_report_status`).
- Cache Redis invalidé à chaque mutation (`missions:all:*`, `mission:id:*`).

## 🧪 Tests

| Fichier | Couverture |
|---|---|
| `test/mission.repositories.spec.ts` | CRUD, transactions, ROLLBACK (23503), checklist, assignments, historique |
| `test/missions.services.spec.ts` | Succès + erreurs (BadRequest/NotFound), créateur injecté |
| `test/missions.controllers.spec.ts` | 200/201, validation Zod 400, erreurs → next |

## 🔄 Dépendances / Intégration

- **Auth** : `created_by`, `assigned_by` référencent `auth(id)`.
- **Territory** : chaque mission est rattachée à un territoire (`territories.id`).
- **Reports** : `missions.report_id` référence `reports(id)` (signalement d'origine).
- **Societes** : `assigned_organization_id` référence `organizations(id)` —
  la société exécutante, avec contrôle de compétence territoriale.
- **Interventions** : les missions génèrent des interventions exécutées par les
  équipes terrain (`field_teams`).
- **Permissions** : le module RBAC référence `missions` (`missions.create`,
  `missions.read`, `missions.assign`...).