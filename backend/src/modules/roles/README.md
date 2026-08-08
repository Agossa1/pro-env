# MODULE ROLES — Gestion des rôles (RBAC)

## 📌 Rôle

Module de gestion des **rôles applicatifs** de la plateforme. Assure le **CRUD
complet** des rôles (créer, lire, mettre à jour, supprimer) avec leurs
métadonnées (code, nom, description, tier, préfixe de route, tableau de bord,
pages, capacités de gestion utilisateurs/rôles). Les rôles définissent le
**niveau d'accès** (tier) et sont liés aux **permissions** via le module
permissions.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `controller/` | Reçoit les requêtes HTTP, valide les entrées (Zod), répond en JSON standardisé |
| `services/` | Logique métier (unicité code, lowercase, protection suppression) |
| `repositories/` | Accès SQL à la table `roles` + cache Redis |
| `validations/` | Schémas Zod (création, mise à jour, params UUID/code) |
| `types/` | Types TypeScript (enum tier, interfaces row/domain/payload) |
| `test/` | Tests unitaires (repositories, services, controllers) |

## 🧩 Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/getRoles.service.ts` | Liste paginée des rôles |
| `services/getRoleById.service.ts` | Rôle par UUID (NotFoundError si absent) |
| `services/getRoleByCode.service.ts` | Rôle par code (NotFoundError si absent) |
| `services/createRole.service.ts` | Création (code en minuscule + unicité) |
| `services/updateRole.service.ts` | Mise à jour (name, description, tier, ...) |
| `services/deleteRole.service.ts` | Suppression (bloquée si utilisateurs rattachés) |
| `repositories/role.repositories.ts` | CRUD complet + `countUsersByRole` pour la protection |
| `validations/role.validations.ts` | Schémas Zod (CreateRoleSchema, UpdateRoleSchema, params) |
| `types/role.enums.ts` | RoleTier (platform, territorial, field) |
| `types/role.types.ts` | AppRole, RoleRow, payloads pagination |
| `routes/role.route.ts` | Déclaration des routes `/api/roles/*` |
| `role.module.ts` | Assemblage (repo → services → controllers → routes) |

## 🌐 API / Routes

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/roles` | Liste paginée des rôles |
| GET | `/api/roles/code/:code` | Rôle par code (ex: `super_admin`) |
| GET | `/api/roles/:id` | Rôle par UUID |
| POST | `/api/roles` | Créer un rôle |
| PUT | `/api/roles/:id` | Mettre à jour un rôle |
| DELETE | `/api/roles/:id` | Supprimer un rôle |

> ⚠️ La route `/code/:code` est déclarée **avant** `/:id` pour éviter le conflit Express.

## 🔒 Sécurité / Contraintes

- Toutes les routes protégées par **`authMiddleware`** (JWT obligatoire).
- **Unicité** du code des rôles (contrainte BDD `roles_code_key` + vérification service).
- **Protection de suppression** : si des utilisateurs sont rattachés à un rôle
  (FK `auth.role_id` RESTRICT), la suppression est bloquée avec un `BadRequestError`.
- **Tri** des listes par nom.
- Caches Redis invalidés à chaque mutation :
  - `roles:all:*`, `roles:id:*`, `roles:code:*`
  - **`auth:role:*`** (invalidation croisée pour que le login voie les mises à jour)

## 🧪 Tests

| Fichier | Couverture |
|---|---|
| `test/role.repositories.spec.ts` | CRUD, transactions, ROLLBACK (23505), cache, `countUsersByRole`, suppression bloquée/OK/NotFound |
| `test/roles.services.spec.ts` | Succès + erreurs (BadRequest si code vide/dupliqué, NotFound), lowercase |
| `test/roles.controllers.spec.ts` | 200/201, validation Zod 400 (UUID invalide, code vide), erreurs → next |

## 🔄 Dépendances / Intégration

- **Auth** : le login charge le rôle (`roleCode`, `roleTier`) dans le token JWT.
  La table `roles` est référencée par `auth.role_id`.
- **Permissions** : les permissions sont liées aux rôles (FK `role_permissions.role_id`),
  géré par le module permissions. Les modifications de rôles invalident le cache
  `auth:role:*` pour la cohérence.
- **Seed** : `infra/seed/seed.roles.ts` crée les 6 rôles de base
  (`super_admin`, `admin_ministere`, `prefecture`, `admin_mairie`, `technicien`,
  `citoyen`) avec leurs permissions.