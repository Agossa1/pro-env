# MODULE SOCIETES — Gestion des prestataires

## 📌 Rôle

Module de gestion des **sociétés (prestataires)** de la plateforme : entreprises
publiques/privées, concessionnaires (eau, électricité, télécoms) et ONG qui
exécutent les **missions et interventions** terrain.

> **Note d'architecture** : le module applicatif s'appelle `societes`, mais la
> table SQL reste **`organizations`** (échange avec les autres modules déjà en
> place : auth, territory, permissions, roles).

## 🏛️ Modèle d'ajout (mairie / ministère / admin)

Les sociétés sont ajoutées et **associées à un territoire** (mairie/commune ou
ministère) selon le rôle de l'utilisateur connecté :

| Acteur | Comportement |
|---|---|
| **Admin** | Ajoute une société et fournit le `territoryId` dans le body → association libre à une mairie ou un ministère |
| **Maire** | Ajoute une société → automatiquement associée à son territoire (`req.user.territoryId`) |
| **Ministère** | Ajoute une société → automatiquement associée à son territoire (`req.user.territoryId`) |

L'association société ↔ territoire est stockée dans la table `organization_territories`
(zone de compétence où la société est habilitée à intervenir). La création se fait
dans une **transaction unique** : INSERT `organizations` + INSERT
`organization_territories`.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `controller/` | Reçoit les requêtes HTTP, valide les entrées (Zod), répond en JSON standardisé |
| `services/` | Logique métier (unicité n° d'enregistrement, wrappers NotFound) |
| `repositories/` | Accès SQL à la table `organizations` + `organization_territories` |
| `validations/` | Schémas Zod (création, mise à jour, params UUID) |
| `types/` | Types TypeScript (enum type, interfaces row/domain/payload) |
| `test/` | Tests unitaires (repositories, services, controllers) |

## 🧩 Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/getSocietes.service.ts` | Liste paginée des sociétés (filtre `type`) |
| `services/getSocieteById.service.ts` | Société par UUID (NotFoundError si absent) |
| `services/getSocieteByRegistrationNumber.service.ts` | Société par n° d'enregistrement |
| `services/createSociete.service.ts` | Création (unicité n° d'enregistrement + association au territoire : admin libre / mairie-ministere via req.user.territoryId) |
| `services/updateSociete.service.ts` | Mise à jour (name, type, contacts...) |
| `services/deleteSociete.service.ts` | Suppression (protégée par FK) |
| `services/getSocieteTerritories.service.ts` | Territoires de compétence d'une société |
| `repositories/societe.repositories.ts` | CRUD + `getSocieteTerritories` (join organization_territories) |
| `validations/societe.validations.ts` | Schémas Zod + params UUID |
| `types/societe.enums.ts` | SocieteType (PUBLIC_COMPANY, PRIVATE_COMPANY, UTILITY, NGO) |
| `types/societe.types.ts` | AppSociete, SocieteTerritory, payloads pagination |
| `routes/societe.route.ts` | Déclaration des routes `/api/societes/*` |
| `societe.module.ts` | Assemblage (repo → services → controllers → routes) |

## 🌐 API / Routes

| Méthode | Chemin | Description |
|---|---|---|
| GET | `/api/societes` | Liste paginée (filtre optionnel `?type=`) |
| GET | `/api/societes/registration/:registrationNumber` | Société par n° d'enregistrement |
| GET | `/api/societes/:id/territories` | Territoires de compétence |
| GET | `/api/societes/:id` | Détail d'une société |
| POST | `/api/societes` | Créer une société (body `territoryId` optionnel : admin l'associe librement, sinon territoire de l'utilisateur connecté) |
| PUT | `/api/societes/:id` | Mettre à jour une société |
| DELETE | `/api/societes/:id` | Supprimer une société |

> ⚠️ La route `/registration/:registrationNumber` est déclarée **avant** `/:id`
> pour éviter le conflit Express.

## 🔒 Sécurité / Contraintes

- Toutes les routes protégées par **`authMiddleware`** (JWT obligatoire).
- **Types limités** : PUBLIC_COMPANY, PRIVATE_COMPANY, UTILITY, NGO (enum PostgreSQL).
- **Unicité** du n° d'enregistrement (contrainte BDD + vérification service).
- **Suppression protégée** : une société référencée (utilisateurs, missions,
  territoires, équipes) ne peut pas être supprimée (`BadRequestError` sur FK 23503).
- Caches Redis invalidés à chaque mutation (`societes:all:*`, `societes:id:*`).

## 🧪 Tests

| Fichier | Couverture |
|---|---|
| `test/societe.repositories.spec.ts` | CRUD, transactions, ROLLBACK (23505/23503), cache, territoires |
| `test/societes.services.spec.ts` | Succès + erreurs (BadRequest/NotFound), unicité n° enregistrement |
| `test/societes.controllers.spec.ts` | 200/201, validation Zod 400 (type invalide, UUID invalide), erreurs → next |

## 🔄 Dépendances / Intégration

- **Auth** : les techniciens sont rattachés à une société (`auth.organization_id`).
- **Territory** : une société possède des **territoires de compétence**
  (`organization_territories`) où elle est habilitée à intervenir.
- **Missions / Interventions** : une mission est assignée à une société
  (`missions.assigned_organization_id`), et ses équipes (`field_teams`) exécutent
  les interventions.
- **Permissions** : le module de permission référence
  `organizations` comme module RBAC (`organizations.manage`).