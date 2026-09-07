# SIGIE — Système Intégré de Gestion des Interventions et Équipements

> Plateforme de gestion territoriale, de signalements, de missions et d'interventions terrain au Bénin.

---

## 📋 Table des matières

- [Vue d'ensemble](#-vue-densemble)
- [Architecture globale](#-architecture-globale)
- [Stack technique](#-stack-technique)
- [Installation & Démarrage](#-installation--démarrage)
- [Modules Backend](#-modules-backend)
  - [1. Auth — Authentification](#1-auth--authentification)
  - [2. Roles — Gestion des rôles](#2-roles--gestion-des-rôles)
  - [3. Permissions — Contrôle d'accès RBAC](#3-permissions--contrôle-daccès-rbac)
  - [4. Territory — Hiérarchie territoriale](#4-territory--hiérarchie-territoriale--géographie)
  - [5. Societes — Prestataires](#5-societes--gestion-des-prestataires)
  - [6. Teams — Équipes terrain](#6-teams--équipes-terrain)
  - [7. Reports — Signalements terrain](#7-reports--signalements-terrain)
  - [8. Missions — Gestion des missions](#8-missions--gestion-des-missions)
  - [9. Interventions — Exécution terrain](#9-interventions--exécution-terrain)
  - [10. Infrastructures — Équipements physiques](#10-infrastructures--équipements-physiques)
  - [11. Media — Gestion des fichiers](#11-media--gestion-des-fichiers)
  - [12. Dashboard — Analytics & KPIs](#12-dashboard--analytics--kpis)
- [Cartographie des routes API](#-cartographie-complète-des-routes-api)
- [Infrastructure & Infra technique](#-infrastructure--infra-technique)
- [Sécurité globale](#-sécurité-globale)
- [Tests](#-tests)
- [Frontend](#-frontend)

---

## 🌍 Vue d'ensemble

SIGIE est une plateforme full-stack (Node.js + React) de gestion territoriale et opérationnelle destinée aux administrations publiques du Bénin. Elle couvre l'intégralité du cycle de traitement des problèmes terrain :

```
Signalement (technicien)
    → Rapport (reports)
        → Mission (assignée à une société)
            → Intervention (exécutée par une équipe terrain)
                → Rapport terrain (résultats, photos, scores)
```

---

## 🏗 Architecture globale

```
apps/
├── backend/          ← API REST Node.js / Express / TypeScript
│   └── src/
│       ├── config/       ← DB, tokens, mailer, logs
│       ├── infra/        ← Migrations, Redis, Seed, WebSockets
│       ├── modules/      ← 12 modules métier (voir ci-dessous)
│       ├── routes/       ← Agrégateur de routes
│       ├── shared/       ← Middlewares, errors, services partagés
│       ├── utils/        ← Mailer, helpers
│       ├── server.ts     ← Configuration Express (CORS, Helmet, Rate-limit)
│       └── index.ts      ← Point d'entrée (DB + Redis + Migrations + Start)
└── frontend/         ← SPA React / TypeScript / Vite
```

### Pattern d'architecture des modules

Chaque module suit le même pattern en 5 couches :

| Couche | Rôle |
|---|---|
| `controller/` | Reçoit les requêtes HTTP, valide les entrées (Zod), répond en JSON standardisé |
| `services/` | Logique métier pure — un fichier = une opération |
| `repositories/` | Accès SQL + cache Redis |
| `validations/` | Schémas Zod de validation des entrées |
| `types/` | Enums et interfaces TypeScript |

---

## 🛠 Stack technique

### Backend

| Technologie | Usage |
|---|---|
| **Node.js + TypeScript** | Runtime & typage statique |
| **Express 5** | Framework HTTP |
| **PostgreSQL + PostGIS** | Base de données relationnelle + géospatiale |
| **Redis** | Cache (TTL 5 min–1 h par type d'entité) |
| **JWT (jsonwebtoken)** | Access tokens (courte durée) |
| **bcryptjs** | Hashage des mots de passe |
| **Zod 4** | Validation des entrées HTTP |
| **Cloudinary** | Stockage cloud des médias |
| **Sharp** | Optimisation des images avant upload |
| **Multer** | Réception des uploads `multipart/form-data` |
| **Nodemailer / Resend / SendGrid** | Envoi d'emails OTP |
| **WebSockets (ws)** | Temps réel |
| **Helmet** | Headers de sécurité HTTP |
| **Morgan** | Logging HTTP |
| **Jest + SWC** | Tests unitaires |
| **Winston** | Logging applicatif |

### Frontend

| Technologie | Usage |
|---|---|
| **React 19** | Framework UI |
| **Vite 8** | Bundler & dev server |
| **TypeScript** | Typage statique |
| **Redux Toolkit** | State management |
| **React Router 7** | Navigation SPA |
| **React Hook Form + Zod** | Formulaires validés |
| **Leaflet / React-Leaflet** | Cartographie interactive |
| **Chart.js / React-Chartjs-2** | Graphiques dashboard |
| **TailwindCSS 4** | Styles utilitaires |
| **Lucide React** | Icônes |

---

## 🚀 Installation & Démarrage

### Prérequis

- Node.js >= 20
- PostgreSQL >= 14 avec extension PostGIS
- Redis >= 7
- Compte Cloudinary (pour les médias)

### Variables d'environnement (backend `.env`)

```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/sigie

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_URL=redis://localhost:6379

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email
SENDGRID_API_KEY=...   # ou RESEND_API_KEY=...

# CORS
FRONTEND_URL=http://localhost:5173

NODE_ENV=development
PORT=4000
```

### Commandes Backend

```bash
cd apps/backend
npm install

# Développement
npm run dev

# Migrations
npm run migrate

# Seed des territoires (idempotent)
npm run seed:territory

# Tests
npm test

# Production
npm run build
npm start
```

### Commandes Frontend

```bash
cd apps/frontend
npm install
npm run dev       # Démarrage dev (port 5173)
npm run build     # Build production
```

### Scripts utilitaires Backend

```bash
npm run db:reset         # Réinitialiser la base
npm run super-admin      # Créer/réparer le super administrateur
npm run create-first-user
```

---

## 📦 Modules Backend

### 1. Auth — Authentification

**Rôle** : Module d'authentification complet. Gère le cycle de vie des comptes utilisateurs : inscription, activation (OTP), connexion, déconnexion, renouvellement de session (refresh token) — avec des tokens JWT sécurisés et un cookie HttpOnly pour le refresh token.

#### Fichiers et responsabilités

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
| `types/auth.enums.ts` | OtpType, RoleTier |
| `types/auth.types.ts` | TokenPayload, AuthUser, RegisterUserDTO... |
| `routes/auth.route.ts` | Déclaration des routes `/api/auth/*` |
| `auth.module.ts` | Assemblage (repo → services → controllers → routes) |

#### Routes API

| Méthode | Chemin | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscrit un utilisateur (envoie OTP email) |
| POST | `/api/auth/verify-account` | Active un compte avec le code OTP |
| POST | `/api/auth/resend-code` | Renvoie un nouveau code OTP |
| POST | `/api/auth/login` | Connecte l'utilisateur (access + refresh tokens) |
| POST | `/api/auth/refresh-token` | Renouvelle l'access token |
| POST | `/api/auth/logout` | Déconnecte et révoque la session |

#### Sécurité

- Mots de passe hashés avec **bcrypt** (jamais stockés en clair).
- **Access Token** : JWT court (dans le header Authorization ou cookie HttpOnly).
- **Refresh Token** : stocké en base (`sessions`), envoyé dans un **cookie HttpOnly** (`httpOnly`, `secure` en production, `sameSite: strict`).
- Comptes créés **inactifs** jusqu'à vérification OTP (email).
- Codes OTP stockés **hachés** avec expiration.
- Session de login 7 jours.

#### Tests

| Fichier | Couverture |
|---|---|
| `test/auth.repositories.spec.ts` | Rôles, existence utilisateur, sessions (CREATE/DELETE) |
| `test/auth.services.spec.ts` | Login (utilisateur absent, non vérifié, succès), Resend |
| `test/auth.controllers.spec.ts` | Login (Zod 400, succès 200 + cookie, erreur → next) |

#### Intégration

- **Rôles** : lit la table `roles` pour attribuer une permission.
- **Permissions** : le login charge `roleCode`/`roleTier` dans le token JWT.
- **Territory** : l'utilisateur peut être rattaché à un territoire (`territory_id`).
- **Organizations** : rattachement optionnel pour les techniciens.

---

### 2. Roles — Gestion des rôles

**Rôle** : Module de gestion des **rôles applicatifs**. CRUD complet des rôles avec leurs métadonnées (code, nom, description, tier, tableau de bord, pages). Les rôles définissent le **niveau d'accès** (tier) et sont liés aux **permissions** via le module permissions.

#### Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/getRoles.service.ts` | Liste paginée des rôles |
| `services/getRoleById.service.ts` | Rôle par UUID (NotFoundError si absent) |
| `services/getRoleByCode.service.ts` | Rôle par code (NotFoundError si absent) |
| `services/createRole.service.ts` | Création (code en minuscule + unicité) |
| `services/updateRole.service.ts` | Mise à jour (name, description, tier...) |
| `services/deleteRole.service.ts` | Suppression (bloquée si utilisateurs rattachés) |
| `repositories/role.repositories.ts` | CRUD complet + `countUsersByRole` |
| `validations/role.validations.ts` | Schémas Zod (CreateRoleSchema, UpdateRoleSchema) |
| `types/role.enums.ts` | RoleTier (platform, territorial, field) |
| `types/role.types.ts` | AppRole, RoleRow, payloads pagination |
| `routes/role.route.ts` | Déclaration des routes `/api/roles/*` |
| `role.module.ts` | Assemblage (repo → services → controllers → routes) |

#### Routes API

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/roles` | Liste paginée des rôles |
| GET | `/api/roles/code/:code` | Rôle par code (ex: `super_admin`) |
| GET | `/api/roles/:id` | Rôle par UUID |
| POST | `/api/roles` | Créer un rôle |
| PUT | `/api/roles/:id` | Mettre à jour un rôle |
| DELETE | `/api/roles/:id` | Supprimer un rôle |

> ⚠️ La route `/code/:code` est déclarée **avant** `/:id` pour éviter le conflit Express.

#### Rôles de base (seed)

`super_admin`, `admin_ministere`, `prefecture`, `admin_mairie`, `technicien`, `citoyen`

#### Sécurité / Contraintes

- **Unicité** du code des rôles (contrainte BDD `roles_code_key` + vérification service).
- **Protection de suppression** : si des utilisateurs sont rattachés à un rôle (FK `auth.role_id` RESTRICT), la suppression est bloquée.
- Caches Redis invalidés : `roles:all:*`, `roles:id:*`, `roles:code:*`, `auth:role:*`.

#### Tests

| Fichier | Couverture |
|---|---|
| `test/role.repositories.spec.ts` | CRUD, transactions, ROLLBACK (23505), cache, `countUsersByRole` |
| `test/roles.services.spec.ts` | Succès + erreurs (BadRequest/NotFound), lowercase |
| `test/roles.controllers.spec.ts` | 200/201, validation Zod 400, erreurs → next |

---

### 3. Permissions — Contrôle d'accès RBAC

**Rôle** : Module de gestion des **permissions granulaires**. Définit ce qu'un rôle peut faire sur chaque **module applicatif** (créer, lire, modifier, supprimer, gérer, assigner). Assure l'**assignation des permissions aux rôles** (liaison N:N `role_permissions`) et le **contrôle d'accès** en temps réel.

#### Fichiers et responsabilités

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
| `validations/permission.validations.ts` | Schémas Zod |
| `types/permission.enums.ts` | PermissionModule (9 modules), PermissionAction (6 actions) |
| `types/permission.types.ts` | Permission, RolePermission, RoleWithPermissions |
| `routes/permission.route.ts` | Déclaration des routes `/api/permissions/*` |
| `permission.module.ts` | Assemblage |

#### Routes API

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

#### Sécurité / Contrôle d'accès

- **`userHasPermission(userId, module, action)`** : jointure SQL `auth → roles → role_permissions → permissions`.
- **Middleware `requirePermission(repository, module, action)`** (`shared/middlewares/permission.middleware.ts`) : protège n'importe quelle route. Le rôle `super_admin` contourne la vérification (accès total).
- Cache Redis TTL 5 min pour `userHasPermission`, 1 h pour les listes.

#### Modules de permissions disponibles

`territory`, `reports`, `missions`, `interventions`, `organizations`, `teams`, `roles`, `permissions`, `media`

#### Actions de permissions disponibles

`create`, `read`, `update`, `delete`, `manage`, `assign`

#### Tests

| Fichier | Couverture |
|---|---|
| `test/permission.repositories.spec.ts` | CRUD, transactions, ROLLBACK, cache, `userHasPermission`, assignation |
| `test/permissions.services.spec.ts` | Tous les services : succès + erreurs, déduplication |
| `test/permissions.controllers.spec.ts` | 200/201, validation Zod 400, erreurs → next |

---

### 4. Territory — Hiérarchie territoriale & Géographie

**Rôle** : Module de gestion de la **hiérarchie administrative du Bénin** (modèle récursif : Pays → Département → Commune → Arrondissement → Quartier/Village). Permet de créer, lire, mettre à jour et supprimer les **types de territoires** et les **territoires** avec leurs **géométries GeoJSON** (PostGIS). Sert de **référentiel géographique** pour tous les autres modules.

#### Fichiers et responsabilités

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
| `repositories/territory.repositories.ts` | Requêtes SQL/PostGIS + cache Redis |
| `validations/territory.validations.ts` | Schémas Zod |
| `types/territory.enums.ts` | TerritoryStatus |
| `types/territory.types.ts` | Territory, TerritoryType, payloads pagination |
| `routes/territory.route.ts` | Déclaration des routes `/api/territories/*` |
| `territory.module.ts` | Assemblage |

#### Routes API

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/territories/types` | Liste paginée des types de territoires |
| GET | `/api/territories/types/code/:code` | Type par code (ex: DEPARTMENT) |
| GET | `/api/territories/types/:id` | Type par UUID |
| POST | `/api/territories/types` | Créer un type de territoire |
| PUT | `/api/territories/types/:id` | Mettre à jour un type |
| DELETE | `/api/territories/types/:id` | Supprimer un type |
| GET | `/api/territories` | Liste paginée (filtres `territoryTypeId`, `parentTerritoryId`) |
| GET | `/api/territories/code/:code` | Territoire par code unique |
| GET | `/api/territories/:id` | Territoire par UUID (avec géométries GeoJSON) |
| POST | `/api/territories` | Créer un territoire (+ GeoJSON uploadé) |

#### Sécurité / Contraintes

- **Unicité** du code des types et des territoires.
- **Hiérarchie** : un territoire ne peut pas être enfant d'un type de niveau hiérarchique égal ou supérieur au sien.
- **Géométrie requise** : un territoire doit être cartographié (GeoJSON).
- **Suppression protégée** : un type référencé par des territoires ne peut pas être supprimé.
- Caches Redis invalidés : `territory:all:*`, `territory:type:*`.

#### Tests

| Fichier | Couverture |
|---|---|
| `test/territory.repositories.spec.ts` | CRUD types/territoires, transactions, ROLLBACK, cache, pagination |
| `test/territory.services.spec.ts` | Tous les services : succès + erreurs, hiérarchie parent |
| `test/territory.controllers.spec.ts` | 200/201, validation Zod 400, erreurs → next |

#### Intégration

- **Rapports / Missions / Interventions / Infrastructures** : référencent `territories.id` comme contexte géographique.
- **Organizations** : `organization_territories` lie un prestataire à ses zones d'intervention.

---

### 5. Societes — Gestion des prestataires

**Rôle** : Module de gestion des **sociétés (prestataires)** de la plateforme : entreprises publiques/privées, concessionnaires (eau, électricité, télécoms) et ONG qui exécutent les **missions et interventions** terrain.

> **Note d'architecture** : le module applicatif s'appelle `societes`, mais la table SQL reste **`organizations`**.

#### Modèle d'ajout (mairie / ministère / admin)

| Acteur | Comportement |
|---|---|
| **Admin** | Ajoute une société et fournit le `territoryId` dans le body → association libre |
| **Maire** | Ajoute une société → automatiquement associée à son territoire (`req.user.territoryId`) |
| **Ministère** | Ajoute une société → automatiquement associée à son territoire (`req.user.territoryId`) |

L'association société ↔ territoire est stockée dans `organization_territories`. La création se fait dans une **transaction unique** : INSERT `organizations` + INSERT `organization_territories`.

#### Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/getSocietes.service.ts` | Liste paginée des sociétés (filtre `type`) |
| `services/getSocieteById.service.ts` | Société par UUID |
| `services/getSocieteByRegistrationNumber.service.ts` | Société par n° d'enregistrement |
| `services/createSociete.service.ts` | Création (unicité n° d'enregistrement + association territoire) |
| `services/updateSociete.service.ts` | Mise à jour (name, type, contacts...) |
| `services/deleteSociete.service.ts` | Suppression (protégée par FK) |
| `services/getSocieteTerritories.service.ts` | Territoires de compétence d'une société |
| `repositories/societe.repositories.ts` | CRUD + join organization_territories |
| `validations/societe.validations.ts` | Schémas Zod |
| `types/societe.enums.ts` | SocieteType (PUBLIC_COMPANY, PRIVATE_COMPANY, UTILITY, NGO) |
| `types/societe.types.ts` | AppSociete, SocieteTerritory, payloads pagination |
| `routes/societe.route.ts` | Déclaration des routes `/api/societes/*` |
| `societe.module.ts` | Assemblage |

#### Routes API

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/societes` | Liste paginée (filtre optionnel `?type=`) |
| GET | `/api/societes/registration/:registrationNumber` | Société par n° d'enregistrement |
| GET | `/api/societes/:id/territories` | Territoires de compétence |
| GET | `/api/societes/:id` | Détail d'une société |
| POST | `/api/societes` | Créer une société |
| PUT | `/api/societes/:id` | Mettre à jour une société |
| DELETE | `/api/societes/:id` | Supprimer une société |

> ⚠️ La route `/registration/:registrationNumber` est déclarée **avant** `/:id`.

#### Sécurité / Contraintes

- **Types limités** : PUBLIC_COMPANY, PRIVATE_COMPANY, UTILITY, NGO (enum PostgreSQL).
- **Unicité** du n° d'enregistrement.
- **Suppression protégée** : une société référencée ne peut pas être supprimée (BadRequestError sur FK 23503).
- Caches Redis : `societes:all:*`, `societes:id:*`.

#### Tests

| Fichier | Couverture |
|---|---|
| `test/societe.repositories.spec.ts` | CRUD, transactions, ROLLBACK, cache, territoires |
| `test/societes.services.spec.ts` | Succès + erreurs (BadRequest/NotFound), unicité |
| `test/societes.controllers.spec.ts` | 200/201, validation Zod 400, erreurs → next |

---

### 6. Teams — Équipes terrain

**Rôle** : Module de gestion des **équipes terrain** avec **2 types** :

| Type | Exemples | Rôle |
|---|---|---|
| **`institution`** | Mairie, Ministère, Préfecture | **Techniciens publics** qui créent les **signalements** terrain (`organizationId` = NULL) |
| **`provider`** | SONEB, SBEE, SGDS, BTP... | **Équipes des sociétés** qui exécutent les **missions & interventions** (`organizationId` requis) |

Chaque équipe possède des **membres** (1 chef `leader` + N membres `member`) et peut être assignée à une mission ou une intervention.

#### Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/getTeams.service.ts` | Liste paginée |
| `services/getTeamById.service.ts` | Équipe par UUID |
| `services/createTeam.service.ts` | Création (règle de type, organizationId requis si provider) |
| `services/updateTeam.service.ts` | Mise à jour (nom, actif, type) |
| `services/deleteTeam.service.ts` | Suppression logique |
| `services/getTeamMembers.service.ts` | Membres actifs d'une équipe |
| `services/addMemberToTeam.service.ts` | Ajouter un membre (leader/member) |
| `services/removeMemberFromTeam.service.ts` | Retirer un membre |
| `repositories/team.repositories.ts` | Accès SQL `field_teams` + `field_team_members` |
| `validations/team.validations.ts` | Schémas Zod (création, mise à jour, membres) |
| `types/` | TeamType, TeamMemberRole, FieldTeam, FieldTeamMember |
| `routes/team.route.ts` | Déclaration des routes `/api/teams/*` |
| `team.module.ts` | Assemblage |

#### Routes API

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/teams` | Liste paginée (`?teamType=&organizationId=`) |
| POST | `/api/teams` | Créer (teamType + nom + organizationId si provider) |
| GET | `/api/teams/:id` | Détail |
| PUT | `/api/teams/:id` | Mettre à jour (nom, actif, type) |
| DELETE | `/api/teams/:id` | Suppression logique |
| GET | `/api/teams/:id/members` | Membres actifs |
| POST | `/api/teams/:id/members` | Ajouter un membre (leader/member) |
| DELETE | `/api/teams/:id/members/:memberId` | Retirer un membre |

> ⚠️ Les routes `/members` sont déclarées **avant** `/:id`.

#### Schéma SQL

- **`team_type_enum`** : `('institution', 'provider')`
- **`field_teams`** : `team_type` NOT NULL DEFAULT 'provider' + `organization_id` nullable

#### Sécurité / Contraintes

- **Règle de type** : `provider` exige `organizationId` ; `institution` l'interdit.
- **Chef unique actif** par équipe (index partiel `uq_one_active_leader_per_team`).
- **Membre unique** : UNIQUE(team_id, user_id).
- **Suppression logique** (`deleted_at`) ; équipe référencée → non supprimable (RESTRICT).
- Cache Redis : `teams:all:*`, `team:id:*`.

---

### 7. Reports — Signalements terrain

**Rôle** : Module de gestion des **rapports de signalement terrain** : caniveaux bouchés, routes endommagées, déchets, biodiversité, environnement... Chaque rapport est lié à un **territoire**, peut référencer une **infrastructure**, et porte des métadonnées : catégorie, priorité, risque, statut, géolocalisation, SLA.

#### Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/getReports.service.ts` | Liste paginée (filtres territoire/statut/catégorie) |
| `services/getReportById.service.ts` | Rapport par UUID |
| `services/createReport.service.ts` | Création (territoire/titre/catégorie requis + créateur injecté) |
| `services/updateReport.service.ts` | Mise à jour (titre, statut, priorité...) |
| `services/deleteReport.service.ts` | Suppression logique (`deleted_at`) |
| `services/getReportDetails.service.ts` | Détails 1:1 selon la catégorie |
| `services/getReportStatusHistory.service.ts` | Historique des statuts |
| `repositories/report.repositories.ts` | CRUD + insert détail 1:1 + historique + cache Redis |
| `validations/report.validations.ts` | Schémas Zod |
| `types/report.enums.ts` | IssueCategory, ReportStatus, PriorityLevel, RiskLevel, WaterFlowStatus |
| `types/report.types.ts` | Report, détails par catégorie, historique, payloads |
| `routes/report.route.ts` | Déclaration des routes `/api/reports/*` |
| `report.module.ts` | Assemblage |

#### Routes API

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/reports` | Liste paginée (filtres `territoryId`, `status`, `issueCategory`) |
| GET | `/api/reports/:id/status-history` | Historique des statuts |
| GET | `/api/reports/:id/details` | Détails 1:1 selon la catégorie |
| GET | `/api/reports/:id` | Détail d'un rapport |
| POST | `/api/reports` | Créer un signalement |
| PUT | `/api/reports/:id` | Mettre à jour (statut, priorité...) |
| DELETE | `/api/reports/:id` | Suppression logique |

> ⚠️ Les routes `/:id/status-history` et `/:id/details` sont déclarées **avant** `/:id`.

#### Extensions 1:1 par catégorie (Class Table Inheritance)

| Catégorie | Table | Champs |
|---|---|---|
| drainage | `report_details_drainage` | blockage_level_pct, water_level_cm, flow_status |
| road | `report_details_road` | damage_surface_m2, pothole_depth_cm |
| waste | `report_details_waste` | estimated_volume_m3, waste_type |
| biodiversity | `report_details_biodiversity` | species_name, observation_type, count |
| environment | `report_details_environment` | sensor_id, measured_value, unit |

L'INSERT du détail est fait dans la **même transaction** que l'INSERT du rapport.

#### Sécurité / Contraintes

- `created_by` est injecté depuis l'utilisateur connecté (`req.user.userId`).
- **Créateur obligatoire** (FK `auth` RESTRICT).
- **SLA** : `sla_hours` défaut 48h, passage auto en `under_review` si dépassé (trigger).
- **Suppression logique** (jamais physique).
- Historique alimenté par **trigger** (`trg_track_report_status`).
- Cache Redis : `reports:all:*`, `report:id:*`.

#### Tests

| Fichier | Couverture |
|---|---|
| `test/report.repositories.spec.ts` | CRUD, transactions, insert détail 1:1, ROLLBACK, suppression logique |
| `test/reports.services.spec.ts` | Succès + erreurs (BadRequest/NotFound), créateur injecté |
| `test/reports.controllers.spec.ts` | 200/201, validation Zod 400, erreurs → next |

---

### 8. Missions — Gestion des missions

**Rôle** : Module de gestion des **missions d'intervention** : créées par l'administration (mairie/ministère) et assignées à une **société prestataire** pour exécution sur le terrain. Chaque mission est liée à un **territoire**, peut référencer un **signalement**, et suit un **cycle de vie complet** :

```
draft → planned → assigned → accepted → in_progress → completed/closed
                                      ↘ rejected / cancelled
```

#### Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/getMissions.service.ts` | Liste paginée (filtres territoire/statut/type/organisation) |
| `services/getMissionById.service.ts` | Mission par UUID |
| `services/createMission.service.ts` | Création (territoire/type/titre requis + créateur injecté) |
| `services/updateMission.service.ts` | Mise à jour (statut, assignation société/équipe, dates, refus) |
| `services/deleteMission.service.ts` | Suppression logique (`deleted_at`) |
| `services/getMissionChecklist.service.ts` | Checklist de sous-tâches |
| `services/addChecklistItem.service.ts` | Ajout d'une sous-tâche |
| `services/assignUserToMission.service.ts` | Assignation d'un utilisateur (idempotent) |
| `services/getMissionStatusHistory.service.ts` | Historique des statuts |
| `repositories/mission.repositories.ts` | CRUD + checklist + assignments + historique + cache Redis |
| `validations/mission.validations.ts` | Schémas Zod |
| `types/mission.enums.ts` | MissionType, MissionStatus, PriorityLevel |
| `types/mission.types.ts` | Mission, checklist, assignments, historique, payloads |
| `routes/mission.route.ts` | Déclaration des routes `/api/missions/*` |
| `mission.module.ts` | Assemblage |

#### Routes API

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/missions` | Liste paginée (filtres `territoryId`, `status`, `missionType`, `organizationId`) |
| POST | `/api/missions` | Créer une mission (créateur = utilisateur connecté) |
| GET | `/api/missions/:id` | Détail d'une mission |
| PUT | `/api/missions/:id` | Mettre à jour (statut, assignation, dates, refus) |
| DELETE | `/api/missions/:id` | Suppression logique |
| GET | `/api/missions/:id/status-history` | Historique des statuts |
| GET | `/api/missions/:id/checklist` | Checklist de la mission |
| POST | `/api/missions/:id/checklist` | Ajouter une sous-tâche |
| POST | `/api/missions/:id/assignees` | Assigner un utilisateur |

> ⚠️ Les routes `/:id/status-history`, `/:id/checklist`, `/:id/assignees` sont déclarées **avant** `/:id`.

#### Sécurité / Contraintes

- **Créateur obligatoire** (FK `auth` RESTRICT) : toute mission est créée par un utilisateur administratif.
- **Statuts protégés** : rejet (`rejected`) exige une `rejectedReason` (contrainte `chk_mission_acceptance`).
- **Dates cohérentes** : `due_date >= scheduled_at`, `completed_at >= scheduled_at` (contrainte `chk_mission_dates`).
- **Compétence territoriale** : la société assignée doit être habilitée sur le territoire de la mission (trigger `trg_mission_organization_territory_check`).
- **Équipe subordonnée à la société** : `assigned_team_id` sans `assigned_organization_id` → rejeté (contrainte `chk_mission_team_requires_org`).
- **Suppression logique** (jamais physique).
- Cache Redis : `missions:all:*`, `mission:id:*`.

#### Tests

| Fichier | Couverture |
|---|---|
| `test/mission.repositories.spec.ts` | CRUD, transactions, ROLLBACK, checklist, assignments, historique |
| `test/missions.services.spec.ts` | Succès + erreurs (BadRequest/NotFound), créateur injecté |
| `test/missions.controllers.spec.ts` | 200/201, validation Zod 400, erreurs → next |

---

### 9. Interventions — Exécution terrain

**Rôle** : Module de gestion des **interventions** : réalisées par les **équipes terrain** (`field_teams`) d'une société prestataire pour **exécuter une mission**. Chaque intervention suit un cycle de vie et produit des **rapports de terrain** (`field_intervention_reports`).

```
not_started → started → paused → resumed → completed / failed / cancelled
```

#### Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/getInterventions.service.ts` | Liste paginée (filtres mission/équipe/statut) |
| `services/getInterventionById.service.ts` | Intervention par UUID |
| `services/createIntervention.service.ts` | Création (mission/équipe/type requis) |
| `services/updateIntervention.service.ts` | Mise à jour (statut, notes, dates) |
| `services/deleteIntervention.service.ts` | Suppression logique (`deleted_at`) |
| `services/createFieldReport.service.ts` | Création rapport terrain (auteur = utilisateur connecté) |
| `services/getInterventionReports.service.ts` | Rapports d'une intervention |
| `repositories/intervention.repositories.ts` | CRUD + rapports + cache Redis |
| `validations/intervention.validations.ts` | Schémas Zod |
| `types/intervention.enums.ts` | InterventionStatus (7), TeamMemberRole (2) |
| `types/intervention.types.ts` | Intervention, FieldInterventionReport, payloads |
| `routes/intervention.route.ts` | Routes `/api/interventions/*` |
| `intervention.module.ts` | Assemblage |

#### Routes API

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/interventions` | Liste paginée (filtres `missionId`, `teamId`, `status`) |
| GET | `/api/interventions/:id/reports` | Rapports terrain d'une intervention |
| POST | `/api/interventions/:id/reports` | Créer un rapport terrain (auteur = utilisateur connecté) |
| GET | `/api/interventions/:id` | Détail d'une intervention |
| POST | `/api/interventions` | Créer une intervention |
| PUT | `/api/interventions/:id` | Mettre à jour (statut, notes, dates) |
| DELETE | `/api/interventions/:id` | Suppression logique |

> ⚠️ Les routes `/:id/reports` sont déclarées **avant** `/:id`.

#### Sécurité / Contraintes

- **Auteur des rapports** : `created_by` doit être membre actif de l'équipe (trigger `trg_fireport_author_in_team`).
- **Cohérence pilote** : `assigned_to_user_id` doit appartenir à l'équipe assignée (trigger `trg_intervention_user_in_team`).
- **Dates cohérentes** : `ended_at >= started_at` (contrainte BDD).
- **Suppression logique** (jamais physique).
- Cache Redis : `interventions:all:*`, `intervention:id:*`.

#### Tests

| Fichier | Couverture |
|---|---|
| `test/intervention.repositories.spec.ts` | CRUD, transactions, ROLLBACK (23503), rapports terrain |
| `test/interventions.services.spec.ts` | Succès + erreurs (BadRequest/NotFound), créateur injecté |
| `test/interventions.controllers.spec.ts` | 200/201, validation Zod 400, erreurs → next |

---

### 10. Infrastructures — Équipements physiques

**Rôle** : Module de gestion des **équipements physiques urbains** référencés géographiquement sur le territoire.

#### Types d'infrastructure

| Enum | Valeur |
|---|---|
| DRAIN | `drain` |
| ROAD | `road` |
| BRIDGE | `bridge` |
| WATER_PIPE | `water_pipe` |
| SEWER_PIPE | `sewer_pipe` |
| STREETLIGHT | `streetlight` |
| WASTE_BIN | `waste_bin` |
| WELL | `well` |
| MARKET | `market` |
| SCHOOL | `school` |
| HEALTH_CENTER | `health_center` |
| PUBLIC_TOILET | `public_toilet` |
| PARK | `park` |
| OTHER | `other` |

#### États de condition

`new` → `good` → `fair` → `poor` → `critical` → `destroyed`

#### Statuts

`ACTIVE`, `INACTIVE`, `ARCHIVED`

#### Services

| Fichier | Responsabilité |
|---|---|
| `services/getInfrastructures.service.ts` | Liste paginée (filtres `territoryId`, `type`, `status`, `condition`, `search`) |
| `services/getInfrastructureById.service.ts` | Infrastructure par UUID |
| `services/createInfrastructure.service.ts` | Création |
| `services/updateInfrastructure.service.ts` | Mise à jour |
| `services/deleteInfrastructure.service.ts` | Suppression logique |

#### Routes API

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/infrastructures` | Liste paginée (filtres `?territoryId=&type=&status=&condition=&search=`) |
| GET | `/api/infrastructures/:id` | Détail d'une infrastructure |
| POST | `/api/infrastructures` | Création |
| PUT | `/api/infrastructures/:id` | Mise à jour |
| DELETE | `/api/infrastructures/:id` | Suppression logique |

#### Sécurité

- Toutes les routes protégées par **`authMiddleware`**.
- **Suppression logique** (jamais physique).

#### Intégration

- **Territory** : chaque infrastructure est rattachée à un territoire (`territories.id`).
- **Reports** : les signalements peuvent référencer une infrastructure.
- **Media** : les médias peuvent être liés aux infrastructures via `module='infrastructure'` + `entityId`.

---

### 11. Media — Gestion des fichiers

**Rôle** : Module central de gestion des **fichiers uploadés** (images, documents, vidéos) avec **Cloudinary**. Toute entité (territoire, rapport, mission, intervention...) peut être liée à des médias via `module` + `entityId`. Chaque upload passe par **multer** (réception), **Sharp** (optimisation) puis **Cloudinary** (stockage cloud).

#### Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/getMedia.service.ts` | Liste paginée des médias (filtres module/entityId/uploadedBy) |
| `services/getMediaById.service.ts` | Métadonnées d'un media |
| `services/uploadMedia.service.ts` | Upload : Sharp (images) → Cloudinary → BDD |
| `services/deleteMedia.service.ts` | Suppression BDD + Cloudinary (best-effort) |
| `services/getEntityMedia.service.ts` | Tous les médias d'une entité |
| `repositories/media.repositories.ts` | CRUD métadonnées + cache Redis |
| `validations/media.validations.ts` | Schémas Zod |
| `types/media.enums.ts` | MediaType (4), MediaModule (6) |
| `types/media.types.ts` | Media, pagination |
| `routes/media.route.ts` | Routes `/api/media/*` |
| `media.module.ts` | Assemblage |
| `shared/services/cloudinary.service.ts` | Service central Cloudinary (`uploadBuffer`, `remove`) |

#### Routes API

| Méthode | Chemin | Description |
|---|---|---|
| POST | `/api/media/upload` | Upload (multer, `multipart/form-data`, champ `file`) |
| GET | `/api/media` | Liste paginée (`?module=&entityId=&uploadedBy=`) |
| GET | `/api/media/:id` | Métadonnées d'un media |
| GET | `/api/media/entity/:entityId` | Médias d'une entité |
| DELETE | `/api/media/:id` | Suppression (métadonnées BDD + fichier Cloudinary) |

#### Table SQL `media`

```sql
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY,
    module VARCHAR(50),                 -- entité liée (territory, reports...)
    entity_id UUID,                     -- ID de l'entité
    file_name VARCHAR(255) NOT NULL,    -- nom original
    mime_type VARCHAR(100) NOT NULL,    -- image/jpeg, application/pdf...
    size_bytes BIGINT NOT NULL,
    storage_path VARCHAR(500) NOT NULL, -- URL Cloudinary
    public_id VARCHAR(255) NOT NULL,    -- ID Cloudinary
    uploaded_by UUID REFERENCES auth(id),
    created_at TIMESTAMPTZ
);
```

#### Sécurité / Config

- **Config Cloudinary requise** dans `.env` : `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- **Multer** limite à 5 Mo (images jpeg/jpg/png/webp).
- **Sharp** redimensionne les images à 1200px max (qualité JPEG 80) avant upload.
- `uploaded_by` est injecté depuis l'utilisateur connecté.
- La suppression Cloudinary est **best-effort** : la métadonnée BDD est toujours supprimée.
- Cache Redis : `media:all:*`, `media:id:*`.

#### Tests

| Fichier | Couverture |
|---|---|
| `test/media.repositories.spec.ts` | CRUD métadonnées, pagination, filtres, cache |
| `test/media.services.spec.ts` | Upload (Sharp+Cloudinary), suppression, fichiers mockés |
| `test/media.controllers.spec.ts` | 200/201, validation Zod 400, upload sans fichier |

---

### 12. Dashboard — Analytics & KPIs

**Rôle** : Module de **tableaux de bord analytiques** fournissant des agrégats temps réel sur l'ensemble de la plateforme : KPIs globaux, graphiques d'activité, répartition des signalements, missions prioritaires, interventions et rapports récents.

#### Services

| Service | Endpoint | Description |
|---|---|---|
| `GetKpisService` | `/api/dashboard/kpis` | Indicateurs clés : nb rapports, missions, interventions, taux résolution... |
| `GetActivityChartService` | `/api/dashboard/activity-chart` | Evolution temporelle de l'activité |
| `GetReportsByCategoryService` | `/api/dashboard/reports-by-category` | Répartition des signalements par catégorie |
| `GetReportsByStatusService` | `/api/dashboard/reports-by-status` | Répartition des signalements par statut |
| `GetPriorityMissionsService` | `/api/dashboard/priority-missions` | Missions les plus urgentes / prioritaires |
| `GetRecentInterventionsService` | `/api/dashboard/recent-interventions` | Dernières interventions terrain |
| `GetRecentReportsService` | `/api/dashboard/recent-reports` | Derniers signalements créés |

#### Routes API

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/dashboard/kpis` | KPIs globaux |
| GET | `/api/dashboard/activity-chart` | Graphique d'activité |
| GET | `/api/dashboard/reports-by-category` | Signalements par catégorie |
| GET | `/api/dashboard/reports-by-status` | Signalements par statut |
| GET | `/api/dashboard/priority-missions` | Missions prioritaires |
| GET | `/api/dashboard/recent-interventions` | Interventions récentes |
| GET | `/api/dashboard/recent-reports` | Rapports récents |

#### Sécurité

- Toutes les routes protégées par **`authMiddleware`** (JWT obligatoire).

---

## 🗺 Cartographie complète des routes API

| Préfixe | Module |
|---|---|
| `/api/auth/*` | Authentification |
| `/api/roles/*` | Rôles |
| `/api/permissions/*` | Permissions RBAC |
| `/api/territories/*` | Territoires & Géographie |
| `/api/societes/*` | Prestataires (organizations) |
| `/api/teams/*` | Équipes terrain |
| `/api/reports/*` | Signalements |
| `/api/missions/*` | Missions |
| `/api/interventions/*` | Interventions |
| `/api/infrastructures/*` | Infrastructures physiques |
| `/api/media/*` | Médias & fichiers |
| `/api/dashboard/*` | Tableaux de bord & Analytics |
| `/api/health` | Health check (DB + Redis) |
| `/health` | Health check simple |

---

## ⚙️ Infrastructure & Infra technique

### Base de données (PostgreSQL + PostGIS)

- **Migrations** : `src/infra/migrations/` — exécutées automatiquement au démarrage via `runMigrations()`.
- **Seed territoires** : `src/infra/seed/seed.territory.ts` — idempotent, lancé au démarrage.
- **Seed rôles/permissions** : `src/infra/seed/seed.roles.ts` — peuple les 6 rôles et leurs permissions de base.
- **Suppression logique** : tous les modules utilisent `deleted_at` (jamais de DELETE physique sur les entités métier).

#### Triggers clés

| Trigger | Rôle |
|---|---|
| `trg_track_report_status` | Historique automatique des statuts (reports, missions) |
| `trg_mission_organization_territory_check` | Vérification compétence territoriale |
| `trg_intervention_user_in_team` | Cohérence pilote intervention |
| `trg_fireport_author_in_team` | Auteur rapport terrain dans l'équipe |

### Redis (Cache)

| Clé | TTL | Contenu |
|---|---|---|
| `territory:all:*` | 1 h | Listes de territoires |
| `territory:type:*` | 1 h | Types de territoires |
| `roles:all:*` | 1 h | Listes de rôles |
| `auth:role:*` | 1 h | Rôle par userId (login) |
| `missions:all:*` | 5 min | Listes de missions |
| `mission:id:*` | 5 min | Détail mission |
| `interventions:all:*` | 5 min | Listes d'interventions |
| `reports:all:*` | 5 min | Listes de rapports |
| `userHasPermission:*` | 5 min | Résultat vérification permission |
| `media:all:*` | 1 h | Listes de médias |

### WebSockets

`src/infra/sockets/webSocket.ts` — service WebSocket initialisé avec le serveur HTTP pour les mises à jour temps réel.

### Middlewares partagés (`src/shared/middlewares/`)

| Middleware | Rôle |
|---|---|
| `auth.middleware.ts` | Vérifie le JWT, injecte `req.user` |
| `permission.middleware.ts` | `requirePermission(repo, module, action)` — contrôle RBAC |
| `error.middlewares.ts` | Gestionnaire d'erreurs centralisé |

### Sécurité HTTP (server.ts)

| Protection | Config |
|---|---|
| **Helmet** | CSP, CORS resource policy |
| **CORS** | Origines whitelistées (`FRONTEND_URL` + localhost) |
| **Rate limiting** | Global : 500 req/min — Auth login : 500 req/15min |
| **Compression** | gzip seuil 1024 bytes |
| **Cookie** | `httpOnly`, `secure` (prod), `sameSite: strict` |

---

## 🔒 Sécurité globale

```
HTTP Request
    ↓
[Helmet] CSP, headers sécurité
    ↓
[Rate Limiter] Global (500/min) + Auth (500/15min)
    ↓
[CORS] Origines whitelistées
    ↓
[authMiddleware] Vérifie JWT, injecte req.user
    ↓
[requirePermission] (optionnel) Vérifie module.action via RBAC
    ↓
[Controller] Validation Zod → Service → Repository → Response
    ↓
[errorMiddleware] Gestion centralisée (400, 404, 500...)
```

---

## 🧪 Tests

Chaque module dispose de tests unitaires Jest couvrant les 3 couches :

```bash
# Lancer tous les tests
cd apps/backend && npm test

# Avec nettoyage de la base de test
npm run test:clean
```

### Couverture par module

| Module | Repositories | Services | Controllers |
|---|---|---|---|
| Auth | ✅ | ✅ | ✅ |
| Roles | ✅ | ✅ | ✅ |
| Permissions | ✅ | ✅ | ✅ |
| Territory | ✅ | ✅ | ✅ |
| Societes | ✅ | ✅ | ✅ |
| Teams | ✅ | ✅ | ✅ |
| Reports | ✅ | ✅ | ✅ |
| Missions | ✅ | ✅ | ✅ |
| Interventions | ✅ | ✅ | ✅ |
| Media | ✅ | ✅ | ✅ |

### Patterns de test

- **Repositories** : transactions, ROLLBACK (codes 23505 unicité, 23503 FK), cache Redis, pagination.
- **Services** : succès + erreurs métier (BadRequest/NotFound), injection des créateurs.
- **Controllers** : codes HTTP 200/201, validation Zod 400, propagation des erreurs via `next`.
- Les tests mockent les dépendances externes (Redis, Cloudinary, Sharp, emails).

---

## 🖥 Frontend

Le frontend est une SPA React 19 / TypeScript / Vite avec TailwindCSS 4.

### Fonctionnalités principales

- 🔐 Authentification (login, OTP, refresh token)
- 🗺 Cartographie interactive (Leaflet) des territoires et signalements
- 📊 Dashboard analytique (Chart.js)
- 📋 Gestion des missions et interventions
- 🏢 Gestion des sociétés et équipes terrain
- 📸 Upload de médias (photos de terrain)
- 🏗 Catalogue des infrastructures

### Structure features

```
src/features/
├── auth/           ← Authentification
├── territory/      ← Gestion territoriale
├── structures/     ← Infrastructures physiques
├── missions/       ← Missions
├── interventions/  ← Interventions terrain
├── reports/        ← Signalements
├── teams/          ← Équipes terrain
├── societes/       ← Prestataires
└── dashboard/      ← Analytics & KPIs
```

### Démarrage frontend

```bash
cd apps/frontend
npm install
npm run dev      # http://localhost:5173
```

---

## 📊 Diagramme de flux métier

```
[Technicien institution]
        ↓ crée
[Signalement / Report]
        ↓ génère
[Mission] ← assignée par [Admin Mairie/Ministère]
        ↓ assignée à
[Société Prestataire] (vérification compétence territoriale)
        ↓ déploie
[Équipe terrain (field_team)]
        ↓ exécute
[Intervention]
        ↓ produit
[Rapport terrain (field_intervention_report)]
        ↓ clôture
[Mission complétée]
```

---

*Documentation générée le 27 août 2026 — compilée depuis les README des 12 modules backend de la plateforme SIGIE.*
