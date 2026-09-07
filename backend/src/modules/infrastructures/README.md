# MODULE INFRASTRUCTURES — Gestion des équipements urbains

## 📌 Rôle

Module de gestion du **parc d'équipements physiques urbains** (routes, drains, ponts,
lampadaires, bornes-fontaines, marchés, écoles, etc.). Chaque infrastructure est
géolocalisée (latitude/longitude + geometry GeoJSON), rattachée à un territoire
et dispose d'un cycle de vie complet (état de conservation, statut opérationnel,
date d'installation, dernière maintenance).

Ce module constitue la **couche patrimoniale** de la plateforme SIGIE : il permet
d'inventorier les actifs urbains et de les corréler avec les signalements et
missions qui leur sont rattachés.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `controller/` | Reçoit les requêtes HTTP, valide via Zod, répond en JSON |
| `services/` | Logique métier (validation complémentaire, orchestration) |
| `repositories/` | Accès SQL pur avec cache Redis (TTL 600 s) et invalidation ciblée |
| `validations/` | Schémas Zod (create + update + paramètre UUID) |
| `types/` | Types TypeScript (Row / Domain / Payload / Pagination + Enums) |

## 🧩 Fichiers et responsabilités

### Services

| Fichier | Responsabilité |
|---|---|
| `services/createInfrastructure.service.ts` | Valide la présence de `territoryId`, `name` et `type` avant d'appeler le repository |
| `services/getInfrastructures.service.ts` | Délègue la pagination + filtres au repository |
| `services/getInfrastructureById.service.ts` | Retourne une infrastructure ou lève `NotFoundError` |
| `services/updateInfrastructure.service.ts` | Mise à jour partielle (champs optionnels via COALESCE) |
| `services/deleteInfrastructure.service.ts` | Suppression logique (`deleted_at = NOW()`) |

### Controllers

| Fichier | Responsabilité |
|---|---|
| `controller/createInfrastructure.controller.ts` | Parse `req.body` via `CreateInfrastructureSchema`, répond 201 |
| `controller/getInfrastructures.controller.ts` | Lit les query params (page, limit, territoryId, type, status, condition, search) |
| `controller/getInfrastructureById.controller.ts` | Valide `req.params.id` via `IdParamSchema` |
| `controller/updateInfrastructure.controller.ts` | Parse `req.body` via `UpdateInfrastructureSchema`, répond 200 |
| `controller/deleteInfrastructure.controller.ts` | Valide UUID, répond 200 si suppression réussie |

### Repository — `repositories/infrastructure.repositories.ts`

| Méthode | Cache Redis | SQL |
|---|---|---|
| `getAllInfrastructures(query)` | `infrastructures:all:page:limit:filters` TTL 600 s | SELECT paginé + COUNT total + 5 filtres combinables + recherche ILIKE |
| `getInfrastructureById(id)` | `infrastructure:id:{id}` TTL 600 s | SELECT par UUID + `deleted_at IS NULL` |
| `createInfrastructure(payload)` | Invalide `infrastructures:all:*` | INSERT 18 colonnes + RETURNING id → re-fetch complet |
| `updateInfrastructure(id, payload)` | Invalide `infrastructure:id:{id}` + `infrastructures:all:*` | UPDATE COALESCE sur 15 champs + RETURNING id → re-fetch |
| `deleteInfrastructure(id)` | Invalide `infrastructure:id:{id}` + `infrastructures:all:*` | UPDATE `deleted_at = NOW()` |

**Sélection standard (SELECT réutilisé dans get/create/update) :**



### Validations — `validations/infrastructure.validations.ts`

| Schéma | Champs obligatoires | Champs optionnels |
|---|---|---|
| `CreateInfrastructureSchema` | `territoryId` (UUID), `name` (1-255 car.), `type` (enum) | `mappedAreaId`, `referenceCode`, `condition`, `status`, `description`, `material`, `dimensions`, `installationDate`, `lastMaintainedAt`, `location`, `geometry`, `latitude`/`longitude` (-90/90, -180/180), `metadata` |
| `UpdateInfrastructureSchema` | _(tous optionnels)_ | Mêmes champs sans `territoryId` ni `mappedAreaId` |
| `IdParamSchema` | `id` (UUID valide) | — |

### Types — `types/infrastructure.types.ts` + `types/infrastructure.enums.ts`

**Enums :**

| Enum | Valeurs |
|---|---|
| `InfrastructureType` | `drain`, `road`, `bridge`, `water_pipe`, `sewer_pipe`, `streetlight`, `waste_bin`, `well`, `market`, `school`, `health_center`, `public_toilet`, `park`, `other` |
| `InfrastructureCondition` | `new`, `good`, `fair`, `poor`, `critical`, `destroyed` |
| `InfrastructureStatus` | `ACTIVE`, `INACTIVE`, `ARCHIVED` |

**Interfaces :**

| Interface | Description |
|---|---|
| `InfrastructureRow` | Structure brute PostgreSQL (snake_case) |
| `Infrastructure` | Objet métier camelCase (retourné au frontend) |
| `CreateInfrastructurePayload` | Données d'entrée pour la création |
| `UpdateInfrastructurePayload` | Données d'entrée pour la mise à jour (tous optionnels) |
| `PaginatedResult<T>` | Générique : `{ data, total, page, limit, totalPages }` |
| `PaginationQuery` | `{ page?, limit? }` |

## 🌐 API / Routes

Toutes les routes sont préfixées `/api/infrastructures` et protégées par `authMiddleware`.

| Méthode | Chemin | Sécurité | Description |
|---|---|---|---|
| GET | `/api/infrastructures` | `authMiddleware` | Liste paginée avec filtres et recherche |
| GET | `/api/infrastructures/:id` | `authMiddleware` | Récupère une infrastructure par UUID |
| POST | `/api/infrastructures` | `authMiddleware` + permission | Crée une nouvelle infrastructure |
| PUT | `/api/infrastructures/:id` | `authMiddleware` + permission | Met à jour une infrastructure (partiel) |
| DELETE | `/api/infrastructures/:id` | `authMiddleware` + permission | Suppression logique (`deleted_at`) |

### Paramètres de filtrage (GET /api/infrastructures)

| Paramètre | Type | Description |
|---|---|---|
| `page` | number | Numéro de page (défaut : 1, min : 1) |
| `limit` | number | Éléments par page (défaut : 50, max : 100) |
| `territoryId` | UUID | Filtre par territoire |
| `type` | InfrastructureType | Filtre par type d'équipement |
| `status` | InfrastructureStatus | Filtre par statut opérationnel |
| `condition` | InfrastructureCondition | Filtre par état de conservation |
| `search` | string | Recherche ILIKE sur `name` et `reference_code` |

## 🔒 Sécurité / Contraintes

- Toutes les routes protégées par **`authMiddleware`** (JWT obligatoire).
- Les mutations (POST / PUT / DELETE) requièrent des **permissions RBAC** spécifiques.
- **Suppression logique** : les données ne sont jamais effacées physiquement — `deleted_at IS NULL` filtre systématiquement tous les SELECTs.
- **Codes d'erreur PostgreSQL gérés** :
  - `23503` (FK violation) → `BadRequestError` : territoire ou zone cartographiée invalide.
  - `23505` (unique violation) → `BadRequestError` : code de référence déjà existant.
- **Pagination sécurisée** : `page >= 1` et `1 <= limit <= 100` forcés en dur côté repository.
- **Clé de cache composite** pour `getAllInfrastructures` : inclut tous les filtres actifs pour éviter les collisions.

## 🗃️ Cache Redis

| Clé | TTL | Invalidée par |
|---|---|---|
| `infrastructures:all:{page}:{limit}:{filters}` | 600 s | create / update / delete |
| `infrastructure:id:{id}` | 600 s | update / delete |

Pattern d'invalidation large : `infrastructures:all:*` (couvre toutes les combinaisons de filtres).

## 🔄 Dépendances / Intégration

- **Auth** : `authMiddleware` sur toutes les routes + RBAC pour les mutations.
- **Territories** : JOIN `territories` pour enrichir chaque résultat avec `territoryName`.
- **Mapped Areas** : champ `mapped_area_id` optionnel (FK vers la table des zones cartographiées).
- **Reports / Missions** : le module Infrastructures constitue la base patrimoniale
  que les signalements et missions référencent pour localiser les problèmes détectés.
- **Redis** : cache via `redisCache.getOrSet()` et `redisCache.invalidatePattern()`.
