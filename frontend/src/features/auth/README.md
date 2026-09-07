# FEATURE AUTH — Authentification & Gestion des utilisateurs

## 📌 Rôle

Feature gérant l'**authentification**, la **session utilisateur** et la **gestion admin des comptes**.
Elle couvre l'inscription citoyenne (OTP), la connexion JWT, la déconnexion via cookie refresh,
la réinitialisation de mot de passe et la création de comptes par le super-admin.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `components/` | Formulaires d'authentification + modale de création admin |
| `hooks/useAuth.ts` | Accès au store Redux auth (user, status, erreurs) + dispatch des thunks |
| `hooks/useAdminUsers.ts` | Gestion de la liste des utilisateurs (fetch + création admin) |
| `services/auth.api.ts` | Appels HTTP `/auth/*` via `apiClient` |
| `services/auth.thunk.ts` | AsyncThunks Redux (login, register, logout, fetchMe, etc.) |
| `services/auth.slices.ts` | Slice Redux `auth` (état, reducers, extraReducers) |
| `services/auth.selectors.ts` | Sélecteurs Redux memoïsés |
| `services/auth.types.ts` | Types TS : `AuthUser`, `LoginDto`, `RegisterDto`, etc. |

## 🧩 Composants

| Composant | Description |
|---|---|
| `LoginForm.tsx` | Formulaire email/mot de passe → dispatch `loginThunk` |
| `ActivateForm.tsx` | Saisie du code OTP pour vérifier un compte inscrit |
| `CreateUserModal.tsx` | Modale admin de création d'utilisateur → dispatch `adminCreateUserThunk` |
| `auth.tsx` | Composant racine de la feature (layout / routing auth) |
| `pages/` | Pages dédiées (login, register, forgot password, reset password) |

## 🌐 API appelées (`auth.api.ts`)

| Fonction | Méthode | Endpoint | Description |
|---|---|---|---|
| `loginUser` | POST | `/auth/login` | Connexion + normalisation `AuthUser` + stockage access token |
| `registerUser` | POST | `/auth/register` | Inscription publique (citoyen) |
| `verifyAccount` | POST | `/auth/verify` | Validation OTP |
| `resendCode` | POST | `/auth/resend-code` | Renvoi du code OTP |
| `logoutUser` | POST | `/auth/logout` | Invalide le cookie refresh token |
| `forgotPassword` | POST | `/auth/forgot-password` | Demande de réinitialisation |
| `resetPassword` | POST | `/auth/reset-password` | Réinitialisation effective |
| `fetchMe` | GET | `/auth/me` | Profil de l'utilisateur connecté |
| `fetchUsers` | GET | `/auth/users` | Liste paginée des utilisateurs (super-admin) |
| `adminCreateUser` | POST | `/auth/register-admin` | Création d'un utilisateur par l'admin |

> **Note** : les appels `login`, `register`, `verify`, `resend-code`, `forgot-password` et `reset-password`
> passent `{ skipAuthRefresh: true }` pour éviter la boucle infinie sur le rafraîchissement du token.

## 🏪 State Redux (`auth.slices.ts`)

| Champ | Type | Description |
|---|---|---|
| `user` | `AuthUser \| null` | Utilisateur connecté (profil complet + rôle) |
| `users` | `AppUser[]` | Liste des utilisateurs (admin) |
| `usersPagination` | `PaginationMeta` | Pagination liste admin |
| `status` | `'idle'\|'loading'\|'succeeded'\|'failed'` | Statut global |
| `isMutating` | `boolean` | Mutation en cours (create, etc.) |
| `error` | `string \| null` | Dernier message d'erreur |

## 🔑 Types clés (`auth.types.ts`)

| Type | Champs principaux |
|---|---|
| `AuthUser` | `id`, `fullName`, `email`, `phone`, `role { id, code, name, tier, canManageUsers }`, `organizationId`, `territoryId` |
| `LoginDto` | `email`, `password` |
| `RegisterDto` | `fullName`, `email`, `password`, `phone?`, `roleCode?`, `territoryId?`, `organizationId?` |
| `AppUser` | `id`, `fullName`, `email`, `roleId`, `roleName`, `roleCode`, `isActive`, `isVerified` |

## 🔄 Flux principal

```
LoginForm → loginThunk → auth.api.loginUser
  → setAccessToken (mémoire)
  → Redux state.auth.user = AuthUser
  → Redirection vers /dashboard
```
