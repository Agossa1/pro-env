# FEATURE TEAMS — Gestion des équipes terrain

## 📌 Rôle

Feature de gestion des **équipes d'intervention terrain** (`FieldTeam`).
Chaque équipe appartient à une organisation, possède un type (`institution` ou `provider`)
et regroupe des membres avec des rôles spécifiques.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `components/` | Page liste, modale détail, modale création |
| `hooks/useTeams.ts` | Accès Redux + dispatch des thunks |
| `services/teams.api.ts` | Appels HTTP `/teams/*` |
| `services/teams.thunk.ts` | AsyncThunks Redux |
| `services/teams.slices.ts` | Slice Redux `teams` |
| `services/teams.selectors.ts` | Sélecteurs memoïsés |
| `services/teams.types.ts` | Types TS : `FieldTeam`, `FieldTeamMember`, `TeamMemberRole` |

## 🧩 Composants

| Composant | Description |
|---|---|
| `TeamsPage.tsx` | Page principale : liste paginée + filtres (type, organisation) |
| `TeamDetailsModal.tsx` | Détail : informations de l'équipe + liste des membres |
| `CreateTeamModal.tsx` | Formulaire de création + ajout du premier membre |
| `teams.tsx` | Composant racine de la feature |

## 🌐 API appelées (`teams.api.ts`)

| Méthode API | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getAll` | GET | `/teams` | Liste paginée (filtres : teamType, organizationId) |
| `getById` | GET | `/teams/:id` | Détail d'une équipe |
| `create` | POST | `/teams` | Création d'une équipe |
| `update` | PUT | `/teams/:id` | Mise à jour |
| `delete` | DELETE | `/teams/:id` | Suppression logique |
| `getMembers` | GET | `/teams/:id/members` | Liste des membres de l'équipe |
| `addMember` | POST | `/teams/:id/members` | Ajout d'un membre (crée l'utilisateur puis l'associe) |

## 🔑 Types clés

| Type | Description |
|---|---|
| `FieldTeam` | `{ id, organizationId, teamType, name, isActive, createdAt, updatedAt, deletedAt }` |
| `FieldTeamMember` | `{ id, teamId, userId, roleInTeam, isActive, joinedAt, leftAt }` |
| `TeamType` | `institution`, `provider` |
| `TeamMemberRole` | `COMMAND_LEAD`, `OPS_OPERATOR`, `LOG_OFFICER`, `SAFETY_OFFICER` |
| `CreateTeamPayload` | name, teamType, organizationId? |
| `AddTeamMemberPayload` | fullName, email, phone?, roleInTeam, organizationId? |
