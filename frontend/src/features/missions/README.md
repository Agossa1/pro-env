# FEATURE MISSIONS — Gestion des missions terrain

## 📌 Rôle

Feature de gestion du **cycle de vie des missions** — unités de travail planifiées
affectant une organisation à un territoire. Chaque mission dispose d'une checklist,
d'assignations d'utilisateurs et d'un historique de statuts.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `components/` | Page liste, modale détail, modale création |
| `hooks/useMissions.ts` | Accès Redux + dispatch des thunks |
| `services/missions.api.ts` | Appels HTTP `/missions/*` |
| `services/missions.thunk.ts` | AsyncThunks Redux |
| `services/missions.slices.ts` | Slice Redux `missions` |
| `services/missions.selectors.ts` | Sélecteurs memoïsés |
| `services/missions.types.ts` | Types TS : `Mission`, `MissionChecklistItem`, etc. |

## 🧩 Composants

| Composant | Description |
|---|---|
| `MissionsPage.tsx` | Page principale : liste paginée + filtres (statut, territoire, priorité) |
| `MissionDetailsModal.tsx` | Vue détaillée : infos, checklist, assignations, historique statuts |
| `CreateMissionModal.tsx` | Formulaire de création d'une mission |

## 🌐 API appelées (`missions.api.ts`)

| Méthode API | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getMissions` | GET | `/missions` | Liste paginée avec filtres |
| `getMissionById` | GET | `/missions/:id` | Détail d'une mission |
| `createMission` | POST | `/missions` | Création d'une mission |
| `updateMission` | PUT | `/missions/:id` | Mise à jour (statut, priorité, description, etc.) |
| `deleteMission` | DELETE | `/missions/:id` | Suppression logique |
| `getMissionChecklist` | GET | `/missions/:id/checklist` | Tâches de la checklist |
| `addChecklistItem` | POST | `/missions/:id/checklist` | Ajout d'une tâche `{ label }` |
| `assignUser` | POST | `/missions/:id/assignees` | Affectation d'un utilisateur `{ userId }` |
| `getStatusHistory` | GET | `/missions/:id/status-history` | Historique des changements de statut |

## 🔑 Types clés

| Type | Description |
|---|---|
| `Mission` | Entité complète (id, title, status, priority, territoryId, organizationId, scheduledAt, ...) |
| `MissionChecklistItem` | `{ id, missionId, label, isCompleted, completedAt }` |
| `MissionAssignment` | `{ missionId, userId, assignedAt }` |
| `MissionStatusHistory` | `{ id, missionId, status, changedAt, changedBy }` |
| `CreateMissionPayload` | title, description, territoryId, organizationId, priorityLevel, scheduledAt |
| `UpdateMissionPayload` | Tous optionnels (partiel) |
