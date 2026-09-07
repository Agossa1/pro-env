# FEATURE TERRITORY — Gestion des territoires

## 📌 Rôle

Feature de gestion du **référentiel géographique** (communes, arrondissements, quartiers, etc.).
Les territoires servent de référence pour les signalements, missions et organisations.
La liste est généralement chargée au démarrage et utilisée comme donnée de référence dans toutes les autres features.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `components/` | Page liste des territoires |
| `hooks/useTerritory.ts` | Accès Redux + dispatch des thunks |
| `services/territory.api.ts` | Appels HTTP `/territories/*` |
| `services/territory.thunk.ts` | AsyncThunks Redux |
| `services/territory.slices.ts` | Slice Redux `territory` |
| `services/territory.selectors.ts` | Sélecteurs memoïsés |
| `services/territory.types.ts` | Types TS : `Territory`, `PaginatedTerritoriesResult` |

## 🧩 Composants

| Composant | Description |
|---|---|
| `TerritoriesPage.tsx` | Page de consultation du référentiel géographique |
| `territory.tsx` | Composant racine de la feature |

## 🌐 API appelées (`territory.api.ts`)

| Méthode API | Méthode HTTP | Endpoint | Paramètres | Description |
|---|---|---|---|---|
| `fetchTerritories` | GET | `/territories` | `page`, `limit=200`, `territoryTypeId?`, `territoryTypeCode?` | Liste paginée des territoires (chargement initial complet avec limit élevée) |

## 🔑 Types clés

| Type | Champs |
|---|---|
| `Territory` | `id`, `code`, `name`, `territoryTypeId`, `territoryTypeCode?`, `territoryTypeName?`, `parentTerritoryId`, `status`, `geometry?`, `centroid?`, `bbox?` |
| `PaginatedTerritoriesResult` | `{ data: Territory[], total, page, limit, totalPages }` |

## 💡 Usage dans les autres features

Les territoires sont utilisés comme **données de référence** (selects, filtres, cartes) dans :
- **Reports** : `territoryId` du signalement
- **Missions** : `territory_id` de la mission
- **Societes** : `SocieteTerritory` (territoires d'intervention)
- **Dashboard** : affichage des noms de territoire dans `priority-missions` et `recent-reports`
