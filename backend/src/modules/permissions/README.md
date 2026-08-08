# MODULE PERMISSIONS — Contrôle d'accès (RBAC)

## 📌 Rôle

Module de gestion des **permissions granulaires** de la plateforme. Définit ce
qu'un rôle peut faire sur chaque **module applicatif** (créer, lire, modifier,
supprimer, gérer, assigner). Assure l'**assignation des permissions aux rôles**
(liaison N:N `role_permissions`) et le **contrôle d'accès** en temps réel
(vérification qu'un utilisateur possède la permission requise avant d'accéder
à une route).

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `controller/` | Reçoit les requêtes HTTP, valide les entrées (Zod), répond en JSON standardisé |
| `services/` | Logique métier (unicité module/action, déduplication, wrappers NotFound) |
| `repositories/` | Accès SQL (permissions, role_permissions, aggrégation rôles+permissions) |
| `validations/` | Schémas Zod (création permission, assignation, params UUID) |
| `types/` | Types TypeScript (enums module/action, interfaces row/domain/payload) |
| `test/` | Tests unitaires (repositories, services, controllers) |

## 🧩 Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/getPermissions.service.ts` | Liste paginée des permissions |
| `services/getPermissionById.service.ts` | Permission par UUID |
| `services/createPermission.service.ts` | Création (module/action en minuscule + unicité) |
| `services/updatePermission.service.ts` | Mise à jour de la description |
| `services/deletePermission.service.ts` | Suppression (CASCADE sur role_permissions) |
| `services/getPermissionsByRole.service.ts` | Permissions d'un rôle donné |
| `services/assignPermissionsToRole.service.ts` | Assignation de plusieurs permissions (déduplication) |
| `services/removePermissionFromRole.service.ts` | Retrait d'une permission d'un rôle |
| `services/getRolesWithPermissions.service.ts` | Tous les rôles avec leurs permissions agrégées |
| `repositories/permission.repositories.ts` | CRUD permissions + liaisons rôles + `userHasPermission` |
| `validations/permission.validations.ts` | Schémas Zod (CreatePermissionSchema, AssignPermissionsSchema...) |
| `types/permission.enums.ts` | PermissionModule (9 modules), PermissionAction (6 actions) |
| `types/permission.types.ts` | Permission, RolePermission, RoleWithPermissions |
| `routes/permission.route.ts` | Déclaration des routes `/api/permissions/*` |
| `permission.module.ts` | Assemblage (repo → services → controllers → routes) |

## 🌐 API / Routes

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/permissions/roles` | Rôles avec leurs permissions agrégées |
| GET | `/api/permissions/roles/:roleId` | Permissions d'un rôle |
| POST | `/api/permissions/roles/:roleId` | Assigner des permissions à un rôle |
| DELETE | `/api/permissions/roles/:roleId/:permissionId` | Retirer une permission d'un rôle |
| GET | `/api/permissions` | Liste paginée des permissions |
| GET | `/api/permissions/:id` | Détail d'une permission |
| POST | `/api/permissions` | Créer une permission |
| PUT | `/api/permissions/:id` | Modifier (description) |
| DELETE | `/api/permissions/:id` | Supprimer une permission |

> ⚠️ Les routes `/roles` sont déclarées **avant** `/:id` pour éviter le conflit Express.

## 🔒 Sécurité / Contrôle d'accès

- Toutes les routes protégées par **`authMiddleware`** (JWT obligatoire).
- **`userHasPermission(userId, module, action)`** : jointure SQL
  `auth → roles → role_permissions → permissions` pour vérifier une permission.
- **Middleware `requirePermission(repository, module, action)`** (dans
  `shared/middlewares/permission.middleware.ts`) : protège n'importe quelle
  route. Le rôle `super_admin` contourne la vérification (accès total).
- Cache Redis avec TTL 5 min pour `userHasPermission`, 1 h pour les listes.

## 🧪 Tests

| Fichier | Couverture |
|---|---|
| `test/permission.repositories.spec.ts` | CRUD, transactions, ROLLBACK (23505/23503), cache, `userHasPermission`, assignation |
| `test/permissions.services.spec.ts` | Tous les services : succès + erreurs (BadRequest/NotFound), déduplication |
| `test/permissions.controllers.spec.ts` | Contrôleurs : 200/201, validation Zod 400, erreurs → next |

## 🔄 Dépendances / Intégration

- **Auth** : `authMiddleware` pour les routes ; le JWT contient `roleCode` utilisé
  pour le bypass super_admin.
- **Roles** : les permissions sont attachées aux rôles (FK `role_id`). La table
  `roles` est gérée par le module `roles`.
- **Seed** : `infra/seed/seed.roles.ts` peuple les 6 rôles et leurs permissions
  de base (module + action) de façon idempotente.
- **Tous les métiers** : les modules applicatifs (territory, reports, missions,
  interventions, infrastructures) vont utiliser `requirePermission` pour
  protéger leurs routes métiers avec `territory.read`, `missions.create`, etc.