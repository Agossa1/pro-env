# FEATURE MEDIAS — Gestion des médias

## 📌 Rôle

Feature de gestion des **fichiers médias** (images, documents) attachés aux entités
de la plateforme (signalements, interventions, etc.). Fournit un hook et un service
pour uploader, lister et supprimer des médias.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `components/medias.tsx` | Composant de gestion et visualisation des médias |
| `hooks/useMedias.ts` | Accès Redux + dispatch des thunks médias |
| `services/medias.api.ts` | Appels HTTP `/media/*` |
| `services/medias.thunk.ts` | AsyncThunks Redux |
| `services/medias.slices.ts` | Slice Redux `medias` |
| `services/medias.selectors.ts` | Sélecteurs memoïsés |
| `services/medias.types.ts` | Types TS : `Media`, `UploadPayload`, etc. |

## 🌐 API appelées

| Méthode HTTP | Endpoint | Description |
|---|---|---|
| POST | `/media/upload` | Upload d'un fichier (FormData : file, module, entityId) |
| GET | `/media/entity/:entityId` | Médias associés à une entité |
| DELETE | `/media/:id` | Suppression d'un média |

## 💡 Usage dans les autres features

- **Reports** : `reports.api.ts` appelle directement `/media/upload` et `/media/entity/:reportId` pour les médias de signalement.
- `useMedias` est utilisé pour les contextes nécessitant un accès centralisé aux médias (galeries, previews).
