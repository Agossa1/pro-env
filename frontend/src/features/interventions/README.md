# FEATURE INTERVENTIONS — Gestion des interventions terrain

## 📌 Rôle

Feature de suivi des **interventions de terrain** — actions concrètes réalisées
par les équipes prestataires dans le cadre d'une mission. Chaque intervention
peut produire des **rapports de terrain** (`FieldInterventionReport`).

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `components/` | Page liste, modale détail, modale création |
| `hooks/useInterventions.ts` | Accès Redux + dispatch des thunks |
| `services/interventions.api.ts` | Appels HTTP `/interventions/*` |
| `services/interventions.thunk.ts` | AsyncThunks Redux |
| `services/interventions.slices.ts` | Slice Redux `interventions` |
| `services/interventions.selectors.ts` | Sélecteurs memoïsés |
| `services/interventions.types.ts` | Types TS : `Intervention`, `FieldInterventionReport`, etc. |

## 🧩 Composants

| Composant | Description |
|---|---|
| `InterventionsPage.tsx` | Page principale : liste + filtres (statut, missionId, teamId) |
| `InterventionDetailsModal.tsx` | Vue détaillée + rapports terrain associés |
| `CreateInterventionModal.tsx` | Formulaire de création d'une intervention |

## 🌐 API appelées (`interventions.api.ts`)

| Méthode API | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getAll` | GET | `/interventions` | Liste paginée (filtres : status, missionId, teamId) |
| `getById` | GET | `/interventions/:id` | Détail d'une intervention |
| `create` | POST | `/interventions` | Création d'une intervention |
| `update` | PUT | `/interventions/:id` | Mise à jour (statut, type, notes, etc.) |
| `delete` | DELETE | `/interventions/:id` | Suppression logique |
| `getReports` | GET | `/interventions/:id/reports` | Rapports terrain de l'intervention |
| `createReport` | POST | `/interventions/:id/reports` | Ajout d'un rapport terrain |

## 🔑 Types clés

| Type | Description |
|---|---|
| `Intervention` | Entité complète (id, missionId, teamId, status, interventionType, scheduledAt, completedAt, notes) |
| `FieldInterventionReport` | `{ id, interventionId, content, submittedAt, submittedBy }` |
| `CreateInterventionPayload` | missionId, teamId, interventionType, scheduledAt, notes |
| `UpdateInterventionPayload` | Tous optionnels |
| `CreateFieldReportPayload` | `{ interventionId, content }` |
