# MODULE TERRITORY — Hiérarchie territoriale & Géographie

## 📌 Rôle

Module de gestion de la **hiérarchie administrative du Bénin** (modèle récursif :
Pays → Département → Commune → Arrondissement → Quartier/Village). Permet de
créer, lire, mettre à jour et supprimer les **types de territoires** et les
**territoires** avec leurs **géométries GeoJSON** (PostGIS).
Sert de **référentiel géographique** pour tous les autres modules
(rapports, missions, interventions, infrastructures).

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `controller/` | Reçoit les requêtes HTTP, valide les entrées (Zod), répond en JSON standardisé |
| `services/` | Logique métier (validation hiérarchique, unicité code, cohérence parent) |
| `repositories/` | Accès SQL + PostGIS (récursif, géométries, cache Redis) |
| `validations/` | Schémas Zod des entrées (création territoire, types, params) |
| `types/` | Types TypeScript (enums statut, interfaces row/domain/payload) |
| `test/` | Tests unitaires (repositories, services, controllers) |

## 🧩 Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/createTerritory.service.ts` | Création d'un territoire (validation type, code unique, parent cohérent, géométrie requise) |
| `services/getAllTerritories.service.ts` | Liste paginée des territoires (filtres type/parent) |
| `services/getTerritoryById.service.ts` | Récupération par UUID (avec GeoJSON) |
| `services/getTerritoryByCode.service.ts` | Récupération par code unique |
| `services/getTerritoryTypes.service.ts` | Liste paginée des types de territoires |
| `services/getTerritoryTypeById.service.ts` | Type par UUID |
| `services/getTerritoryTypeByCode.service.ts` | Type par code |
| `services/createTerritoryType.service.ts` | Création d'un type (unicité code) |
| `services/updateTerritoryType.service.ts` | Mise à jour d'un type |
| `services/deleteTerritoryType.service.ts` | Suppression d'un type (RESTRICT si territoires rattachés) |
| `repositories/territory.repositories.ts` | Requêtes SQL/PostGIS + cache Redis (territories, types, secteurs) |
| `validations/territory.validations.ts` | Schémas Zod (CreateTerritorySchema, CreateTerritoryTypeSchema...) |
| `types/territory.enums.ts` | TerritoryStatus |
| `types/territory.types.ts` | Territory, TerritoryType, payloads pagination |
| `routes/territory.route.ts` | Déclaration des routes `/api/territories/*` |
| `territory.module.ts` | Assemblage (repo → services → controllers → routes) |

> Note : `services/territory.service.ts` (ancien monolithique) a été remplacé par
> les services découpés ci-dessus — un fichier = un rôle.

## 🌐 API / Routes

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/territories/types` | Liste paginée des types de territoires |
| GET | `/api/territories/types/code/:code` | Type par code (ex: DEPARTMENT) |
| GET | `/api/territories/types/:id` | Type par UUID |
| POST | `/api/territories/types` | Créer un type de territoire |
| PUT | `/api/territories/types/:id` | Mettre à jour un type |
| DELETE | `/api/territories/types/:id` | Supprimer un type |
| GET | `/api/territories` | Liste paginée des territoires (filtres `territoryTypeId`, `parentTerritoryId`) |
| GET | `/api/territories/code/:code` | Territoire par code unique |
| GET | `/api/territories/:id` | Territoire par UUID (avec géométries GeoJSON) |
| POST | `/api/territories` | Créer un territoire (+ GeoJSON uploadé) |

## 🔒 Sécurité / Contraintes

- Toutes les routes protégées par **`authMiddleware`** (JWT obligatoire).
- **Unicité** du code des types et des territoires (contrainte BDD + vérification service).
- **Hiérarchie** : un territoire ne peut pas être enfant d'un type de niveau
  hiérarchique égal ou supérieur au sien.
- **Géométrie requise** : un territoire doit être cartographié (GeoJSON).
- **Suppression protégée** : un type référencé par des territoires ne peut pas être supprimé.
- Caches Redis invalidés à chaque mutation (`territory:all:*`, `territory:type:*`).

## 🧪 Tests

| Fichier | Couverture |
|---|---|
| `test/territory.repositories.spec.ts` | CRUD types/territoires, transactions, ROLLBACK (23505/23503), cache, pagination |
| `test/territory.services.spec.ts` | Tous les services : succès + erreurs (BadRequest/NotFound), hiérarchie parent |
| `test/territory.controllers.spec.ts` | Contrôleurs : 200/201, validation Zod 400 (UUID, code vide), erreurs → next |

## 🔄 Dépendances / Intégration

- **Auth** : `authMiddleware` pour protéger les routes.
- **Permissions** : le territoire est un module du RBAC
  (`permissions` : `territory.read`, `territory.manage`...).
- **Rapports / Missions / Interventions / Infrastructures** : référencent
  `territories.id` (FK) comme contexte géographique.
- **Organizations** : `organization_territories` lie un prestataire à ses zones
  d'intervention basées sur les territoires.