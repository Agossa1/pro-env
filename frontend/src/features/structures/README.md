# FEATURE STRUCTURES — Inventaire des infrastructures urbaines

## 📌 Rôle

Feature frontend miroir du module backend `infrastructures`. Gère l'**inventaire
des équipements physiques urbains** (routes, drains, ponts, lampadaires, marchés, etc.)
géolocalisés et rattachés à un territoire.

> **Alias** : cette feature est nommée `structures` côté frontend pour distinguer
> le concept UI du module backend `infrastructures`.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `components/` | Page liste, modale détail, modale création |
| `hooks/useStructures.ts` | Accès Redux + dispatch : load (avec filtres), fetchById, create, update, delete |
| `services/structures.api.ts` | Appels HTTP `/infrastructures/*` |
| `services/structures.thunk.ts` | AsyncThunks Redux |
| `services/structures.slices.ts` | Slice Redux `structures` |
| `services/structures.selectors.ts` | Sélecteurs dont `selectStructuresPagination` |
| `services/structures.types.ts` | Types TS miroir backend : `Structure`, `InfrastructureType`, enums |

## 🧩 Composants

| Composant | Description |
|---|---|
| `StructuresPage.tsx` | Page principale : liste paginée + filtres (territoire, type, statut, état, recherche) |
| `StructureDetailsModal.tsx` | Détail complet : infos, géolocalisation, métadonnées |
| `CreateStructureModal.tsx` | Formulaire de création avec sélecteurs d'enum (type, condition, status) |

## 🌐 API appelées (`structures.api.ts` → backend `/infrastructures`)

| Méthode HTTP | Endpoint | Paramètres | Description |
|---|---|---|---|
| GET | `/infrastructures` | page, limit, territoryId, type, status, condition, search | Liste paginée avec filtres |
| GET | `/infrastructures/:id` | — | Détail d'une infrastructure |
| POST | `/infrastructures` | — | Création d'une infrastructure |
| PUT | `/infrastructures/:id` | — | Mise à jour partielle |
| DELETE | `/infrastructures/:id` | — | Suppression logique |

## 🔑 Types clés

| Type | Description |
|---|---|
| `Structure` | Entité complète (id, name, type, condition, status, territoryId, referenceCode, geometry, coordinates, ...) |
| `InfrastructureType` | 14 valeurs : drain, road, bridge, water_pipe, sewer_pipe, streetlight, waste_bin, well, market, school, health_center, public_toilet, park, other |
| `InfrastructureCondition` | new, good, fair, poor, critical, destroyed |
| `InfrastructureStatus` | ACTIVE, INACTIVE, ARCHIVED |
| `CreateStructurePayload` | territoryId (requis), name (requis), type (requis) + champs optionnels |
| `UpdateStructurePayload` | Tous optionnels |
