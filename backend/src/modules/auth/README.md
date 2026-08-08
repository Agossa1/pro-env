# MODULE AUTH — Authentification

## 📌 Rôle

Module d'authentification complet de la plateforme SIGIE. Gère le cycle de vie
des comptes utilisateurs : **inscription, activation (OTP), connexion,
déconnexion, renouvellement de session (refresh token)** — avec des tokens JWT
sécurisés et un cookie HttpOnly pour le refresh token.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `controller/` | Reçoit les requêtes HTTP, valide les entrées (Zod), répond en JSON standardisé |
| `services/` | Logique métier (vérification mot de passe, statut compte, génération tokens) |
| `repositories/` | Accès SQL à la base (auth, credentials, account_status, otp_codes, sessions, roles) |
| `validations/` | Schémas Zod des entrées (register, login, resend code) |
| `types/` | Types TypeScript (enums OTP/tier, interfaces row/domain/payload) |
| `test/` | Tests unitaires (repositories, services, controllers) |

## 🧩 Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `controller/register.controller.ts` | Inscription (validation + création compte) |
| `controller/verifyAccount.controller.ts` | Activation du compte via code OTP |
| `controller/resend-code.controller.ts` | Renvoi du code OTP |
| `controller/login.controller.ts` | Connexion (retourne tokens, pose le cookie refreshToken) |
| `controller/refreshtoken.controller.ts` | Renouvellement de l'access token via refresh token |
| `controller/logout.controller.ts` | Déconnexion (révoque la session) |
| `services/register.service.ts` | Création du compte + hash du mot de passe |
| `services/verifyAccount.service.ts` | Vérification OTP + activation |
| `services/resend-code.service.ts` | Régénération et renvoi du code OTP |
| `services/login.service.ts` | Vérification identifiants + génération tokens |
| `services/refreshtoken.service.ts` | Rotation du refresh token |
| `services/logout.service.ts` | Suppression de la session |
| `repositories/auth.repositories.ts` | Requêtes SQL : utilisateurs, statuts, OTP, sessions, rôles |
| `validations/auth.validations.ts` | Schémas Zod (RegisterSchema, LoginSchema, ResendCodeSchema...) |
| `types/auth.enums.ts` | OptType, RoleTier |
| `types/auth.types.ts` | TokenPayload, AuthUser, RegisterUserDTO... |
| `routes/auth.route.ts` | Déclaration des routes `/api/auth/*` |
| `auth.module.ts` | Assemblage (repo → services → controllers → routes) |

## 🌐 API / Routes

| Méthode | Chemin | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscrit un utilisateur (envoie OTP email) |
| POST | `/api/auth/verify-account` | Active un compte avec le code OTP |
| POST | `/api/auth/resend-code` | Renvoie un nouveau code OTP |
| POST | `/api/auth/login` | Connecte l'utilisateur (access + refresh tokens) |
| POST | `/api/auth/refresh-token` | Renouvelle l'access token |
| POST | `/api/auth/logout` | Déconnecte et révoque la session |

## 🔒 Sécurité

- Mots de passe hashés avec **bcrypt** (jamais stockés en clair).
- **Access Token** : JWT court (dans le header Authorization ou cookie HttpOnly).
- **Refresh Token** : stocké en base (`sessions`), envoyé dans un **cookie HttpOnly**
  (attributs `httpOnly`, `secure` en production, `sameSite: strict`).
- Comptes créés **inactifs** jusqu'à vérification OTP (email).
- Codes OTP stockés **hachés** avec expiration.
- Session de login 7 jours (expiration alignée entre cookie et base).

## 🧪 Tests

| Fichier | Couverture |
|---|---|
| `test/auth.repositories.spec.ts` | Rôles, existence utilisateur, sessions (CREATE/DELETE) |
| `test/auth.services.spec.ts` | Login (utilisateur absent, non vérifié, succès), Resend (déjà vérifié, régénération) |
| `test/auth.controllers.spec.ts` | Login (Zod 400, succès 200 + cookie, erreur → next) |

## 🔄 Dépendances / Intégration

- **Rôles** : lit la table `roles` (`getRoleByCode`) pour attribuer une permission.
- **Permissions** : le login charge `roleCode`/`roleTier` dans le token JWT, utilisé
  par `requirePermission` (middleware) pour le contrôle d'accès.
- **Territory** : l'utilisateur peut être rattaché à un territoire
  (`territory_id`) pour les rôles territoriaux.
- **Organizations** : rattachement optionnel pour les techniciens.
- **Infra** : dépend de `config/tokens` (TokenManager), `config/passwords`
  (PasswordService), `infra/redis` (cache), `utils/mailer` (envoi d'emails OTP).