# MODULE TEAMS — Équipes terrain (institutions & prestataires)

## 📌 Rôle

Module de gestion des **équipes terrain** avec **2 types** :

| Type | Exemples | Rôle |
|---|---|---|
| **`institution`** | Mairie, Ministère, Préfecture | **Techniciens publics** qui créent les **signalements** terrain (`organizationId` = NULL) |
| **`provider`** | SONEB, SBEE, SGDS, BTP... | **Équipes des sociétés** qui exécutent les **missions & interventions** (`organizationId` requis → FK organizations) |

Chaque équipe possède des **membres** (1 chef `leader` + N membres `member`) et
peut être assignée à une mission (`missions.assigned_team_id`) ou une
intervention (`interventions.assigned_team_id`).

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `controller/` | Reçoit les requêtes HTTP, valide les entrées (Zod) |
| `services/` | Logique métier (règle 2 types, wrappers NotFound) |
| `repositories/` | Accès SQL `field_teams` + `field_team_members` |
| `validations/` | Schémas Zod (création, mise à jour, membres) |
| `types/` | TeamType, TeamMemberRole, FieldTeam, FieldTeamMember |
| `test/` | Tests unitaires |

## 🌐 API / Routes

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/teams` | Liste paginée (`?teamType=&organizationId=`) |
| POST | `/api/teams` | Créer (teamType + nom + organizationId si provider) |
| GET | `/api/teams/:id` | Détail |
| PUT | `/api/teams/:id` | Mettre à jour (nom, actif, type) |
| DELETE | `/api/teams/:id` | Suppression logique |
| GET | `/api/teams/:id/members` | Membres actifs |
| POST | `/api/teams/:id/members` | Ajouter un membre (leader/member) |
| DELETE | `/api/teams/:id/members/:memberId` | Retirer un membre |

> ⚠️ Les routes `/members` sont déclarées **avant** `/:id`.

## 🗂️ Schéma SQL (modifié)

- **`team_type_enum`** : `('institution', 'provider')`
- **`field_teams`** : `team_type` NOT NULL DEFAULT 'provider' + `organization_id` rendu **nullable**
  (requis pour `provider`, NULL pour `institution`)

## 🔒 Sécurité / Contraintes

- Routes protégées par `authMiddleware`.
- **Règle de type** : `provider` exige `organizationId` ; `institution` l'interdit.
- **Chef unique actif** par équipe (index partiel `uq_one_active_leader_per_team`).
- **Membre unique** : UNIQUE(team_id, user_id).
- **Suppression logique** (`deleted_at`) ; équipe référencée par mission/intervention → non supprimable (RESTRICT).
- Cache Redis invalidé à chaque mutation (`teams:all:*`, `team:id:*`).

## 🔄 Intégration

- **Societes** : `organization_id` → `organizations(id)` (équipes prestataires).
- **Auth** : `user_id` (membres) → `auth(id)`.
- **Missions / Interventions** : `assigned_team_id` référence `field_teams(id)`.
- **Reports** : les techniciens des équipes `institution` créent les signalements.
- **Permissions** : module RBAC `teams` (`teams.manage` super_admin, `teams.read`...).