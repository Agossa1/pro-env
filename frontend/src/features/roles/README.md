# FEATURE ROLES — Gestion des rôles utilisateurs

## 📌 Rôle

Feature d'administration des **rôles** (RBAC). Chaque rôle possède un code unique,
un niveau hiérarchique (`tier`) et un ensemble de permissions associées.
La gestion des rôles est réservée aux super-admins.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `components/` | Page liste, page détail, modale création |
| `hooks/useRoles.ts` | Accès Redux + dispatch des thunks |
| `services/roles.api.ts` | Appels HTTP `/roles/*` |
| `services/roles.thunk.ts` | AsyncThunks Redux |
| `services/roles.slices.ts` | Slice Redux `roles` |
| `services/roles.selectors.ts` | Sélecteurs memoïsés |
| `services/roles.types.ts` | Types TS : `Role`, `CreateRoleDto`, etc. |

## 🧩 Composants

| Composant | Description |
|---|---|
| `RolesPage.tsx` | Page principale : liste des rôles + actions |
| `RoleDetailPage.tsx` | Détail d'un rôle : infos + permissions associées |
| `CreateRoleModal.tsx` | Formulaire de création d'un rôle |

## 🌐 API appelées

| Méthode HTTP | Endpoint | Description |
|---|---|---|
| GET | `/roles` | Liste de tous les rôles |
| GET | `/roles/:id` | Détail d'un rôle |
| POST | `/roles` | Création d'un rôle |
| PUT | `/roles/:id` | Mise à jour d'un rôle |
| DELETE | `/roles/:id` | Suppression logique |
