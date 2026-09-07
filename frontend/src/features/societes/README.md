# FEATURE SOCIETES — Gestion des organisations prestataires

## 📌 Rôle

Feature de gestion des **organisations** (sociétés prestataires, ONG, services publics)
qui exécutent les missions et interventions. Chaque société peut être associée à
plusieurs territoires d'intervention.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `components/` | Page liste, modale détail, modale création |
| `hooks/useSocietes.ts` | Accès Redux + dispatch des thunks |
| `services/societes.api.ts` | Appels HTTP `/societes/*` |
| `services/societes.thunk.ts` | AsyncThunks Redux |
| `services/societes.slices.ts` | Slice Redux `societes` |
| `services/societes.selectors.ts` | Sélecteurs memoïsés |
| `services/societes.types.ts` | Types TS : `AppSociete`, `SocieteType`, etc. |

## 🧩 Composants

| Composant | Description |
|---|---|
| `SocietesPage.tsx` | Page principale : liste paginée + filtres |
| `SocieteDetailsModal.tsx` | Détail : infos, territoires associés, statut actif |
| `CreateSocieteModal.tsx` | Formulaire de création d'une organisation |

## 🌐 API appelées (`societes.api.ts`)

| Méthode API | Méthode HTTP | Endpoint | Description |
|---|---|---|---|
| `getAll` | GET | `/societes` | Liste paginée des organisations |
| `getById` | GET | `/societes/:id` | Détail d'une organisation |
| `create` | POST | `/societes` | Création d'une organisation |
| `update` | PUT | `/societes/:id` | Mise à jour |
| `delete` | DELETE | `/societes/:id` | Suppression logique |
| `getTerritories` | GET | `/societes/:id/territories` | Territoires associés à l'organisation |

## 🔑 Types clés

| Type | Description |
|---|---|
| `AppSociete` | `{ id, name, type, registrationNumber, contactEmail, contactPhone, isActive, createdAt, updatedAt }` |
| `SocieteType` | `PUBLIC_COMPANY`, `PRIVATE_COMPANY`, `UTILITY`, `NGO` |
| `SocieteTerritory` | `{ id, societeId, territoryId, isActive }` |
| `CreateSocietePayload` | name, type, registrationNumber?, contactEmail?, contactPhone? |
| `UpdateSocietePayload` | Tous optionnels |
