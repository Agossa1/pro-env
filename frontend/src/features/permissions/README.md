# FEATURE PERMISSIONS — Gestion des permissions RBAC

## 📌 Rôle

Feature d'administration fine des **permissions** (actions autorisées par module).
Permet de créer des permissions, de les assigner à des rôles et de les révoquer.
Complémentaire à la feature `roles`.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `components/` | Page liste, page détail, modale création |
| `hooks/usePermissions.ts` | Accès Redux + dispatch : load, create, update, delete, assign, remove |
| `services/permissions.api.ts` | Appels HTTP `/permissions/*` |
| `services/permissions.thunk.ts` | AsyncThunks Redux (dont `loadPermissionsByRoleThunk`, `assignPermissionsThunk`) |
| `services/permissions.slices.ts` | Slice Redux `permissions` |
| `services/permissions.selectors.ts` | Sélecteurs dont `selectPermissionsByModule` |
| `services/permissions.types.ts` | Types TS : `Permission`, `CreatePermissionDto`, `UpdatePermissionDto` |

## 🧩 Composants

| Composant | Description |
|---|---|
| `PermissionsPage.tsx` | Page principale : liste groupée par module |
| `PermissionDetailPage.tsx` | Détail d'une permission + rôles qui la possèdent |
| `CreatePermissionModal.tsx` | Formulaire de création d'une permission |

## 🌐 API appelées

| Méthode HTTP | Endpoint | Description |
|---|---|---|
| GET | `/permissions` | Toutes les permissions (groupables par module) |
| GET | `/permissions/:id` | Détail d'une permission |
| POST | `/permissions` | Création d'une permission |
| PUT | `/permissions/:id` | Mise à jour |
| DELETE | `/permissions/:id` | Suppression |
| GET | `/permissions/role/:roleId` | Permissions d'un rôle spécifique |
| POST | `/permissions/assign` | Assignation d'une permission à un rôle |
| DELETE | `/permissions/remove` | Révocation d'une permission d'un rôle |

## 🔑 Sélecteur clé

`selectPermissionsByModule` : regroupe les permissions par module (ex: `REPORTS`, `MISSIONS`, `USERS`...)
pour un affichage tabulaire structuré dans `PermissionsPage`.
