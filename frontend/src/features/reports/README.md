# FEATURE REPORTS — Signalements citoyens

## 📌 Rôle

Feature de gestion des **signalements** (incidents, problèmes urbains) déposés par les citoyens
ou les agents terrain. Inclut la création, la consultation détaillée, la mise à jour de statut
et l'upload de médias associés.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `components/` | Page liste, modale détail, modale création |
| `hooks/useReports.ts` | Accès Redux + dispatch des thunks |
| `services/reports.api.ts` | Appels HTTP `/reports/*` + `/media/upload` |
| `services/reports.thunk.ts` | AsyncThunks Redux |
| `services/reports.slices.ts` | Slice Redux `reports` |
| `services/reports.selectors.ts` | Sélecteurs memoïsés |
| `services/reports.types.ts` | Types TS : `Report`, `CreateReportPayload`, etc. |

## 🧩 Composants

| Composant | Description |
|---|---|
| `ReportsPage.tsx` | Page principale : liste paginée + filtres + actions |
| `ReportDetailsModal.tsx` | Modale détail : infos complètes, médias, statut, carte |
| `CreateReportModal.tsx` | Formulaire de création d'un signalement |

## 🌐 API appelées (`reports.api.ts`)

| Méthode API | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getReports` | GET | `/reports` | Liste paginée (filtres : status, territoryId, category, priority) |
| `getReportById` | GET | `/reports/:id` | Détail d'un signalement |
| `getReportDetails` | GET | `/reports/:id/details` | Détails enrichis (infra associée, etc.) |
| `createReport` | POST | `/reports` | Création d'un signalement |
| `updateReport` | PUT | `/reports/:id` | Mise à jour (statut, priorité, etc.) |
| `deleteReport` | DELETE | `/reports/:id` | Suppression logique |
| `uploadReportMedia` | POST | `/media/upload` | Upload fichier image via `FormData` (module=REPORTS) |
| `getReportMedia` | GET | `/media/entity/:reportId` | Récupère les médias image associés |

## 🏪 State Redux

| Champ | Description |
|---|---|
| `list` | Tableau de `Report` |
| `selected` | `Report` en cours de consultation |
| `pagination` | `{ total, page, limit, totalPages }` |
| `status` | `'idle' \| 'loading' \| 'succeeded' \| 'failed'` |
| `isMutating` | Mutation (create/update/delete) en cours |
| `error` | Dernier message d'erreur |

## 🔑 Types clés

| Type | Description |
|---|---|
| `Report` | Entité complète (id, title, description, status, priority, category, territory, coordinates...) |
| `CreateReportPayload` | Champs de création (title, description, territoryId, latitude, longitude, category, priority) |
| `UpdateReportPayload` | Mise à jour partielle |
| `ReportMedia` | `{ id, mimeType, url, ... }` — filtrés sur `mimeType.startsWith('image/')` |
