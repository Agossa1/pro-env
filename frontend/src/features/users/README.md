# FEATURE USERS — Gestion des utilisateurs (admin)

## 📌 Rôle

Feature dédiée à la **gestion administrative des utilisateurs** de la plateforme.
Permet aux super-admins de lister, créer et activer/désactiver des comptes.
Complémentaire à la feature `auth` qui gère la session courante.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `components/` | _(pas de composant dédié — UI intégrée dans `auth/CreateUserModal`)_ |
| `hooks/useUsers.ts` | Accès Redux + dispatch : loadUsers, createUser, toggleActive |
| `services/users.api.ts` | Appels HTTP `/auth/*` (partage les endpoints avec la feature auth) |
| `services/users.thunk.ts` | AsyncThunks Redux : `loadUsers`, `createUserThunk`, `toggleUserActiveThunk` |
| `services/users.slices.ts` | Slice Redux `users` |
| `services/users.selectors.ts` | Sélecteurs : `selectUsers`, `selectUsersPagination`, `selectUsersLoading`, `selectUsersIsMutating` |
| `services/users.types.ts` | Types TS : `AppUser`, `PaginatedUsersResult`, `CreateUserDto` |

## 🌐 API appelées

| Méthode HTTP | Endpoint | Description |
|---|---|---|
| GET | `/auth/users` | Liste paginée des utilisateurs |
| POST | `/auth/register-admin` | Création d'un utilisateur (admin) |
| PATCH | `/auth/users/:id/toggle-active` | Activation / désactivation d'un compte |

## 🎣 Hook `useUsers`

- **Auto-chargement** : déclenche `loadUsers` au montage si le statut est `'idle'`.
- Expose : `users`, `pagination`, `isLoading`, `isMutating`, `error`, `createUser()`, `toggleActive()`.

## 🔑 Types clés

| Type | Champs |
|---|---|
| `AppUser` | `id`, `fullName`, `email`, `phone?`, `roleId`, `roleName`, `roleCode`, `territoryId?`, `territoryName?`, `isActive`, `isVerified`, `createdAt` |
| `CreateUserDto` | `fullName`, `email`, `phone?`, `roleCode`, `territoryId?`, `organizationId?` |
| `PaginatedUsersResult` | `{ data: AppUser[], total, page, limit, totalPages }` |
