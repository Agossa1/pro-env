# MODULE MEDIA — Gestion des fichiers (images, documents)

## 📌 Rôle

Module central de gestion des **fichiers uploadés** (images, documents, vidéos)
avec **Cloudinary**. Toute entité (territoire, rapport, mission, intervention...)
peut être liée à des médias via `module` + `entityId`. Chaque upload passe par
**multer** (réception du fichier), **Sharp** (optimisation des images) puis
**Cloudinary** (stockage cloud), et les métadonnées sont persistées en base.

## 📁 Architecture

| Couche | Rôle |
|---|---|
| `controller/` | Reçoit les requêtes HTTP (upload + CRUD métadonnées) |
| `services/` | Logique : upload (Sharp + Cloudinary), suppression (BDD + Cloudinary) |
| `repositories/` | Accès SQL à la table `media` + cache Redis |
| `validations/` | Schémas Zod (module/enityId, params UUID) |
| `types/` | Types TypeScript (enums type/module, interfaces) |
| `shared/services/cloudinary.service.ts` | Service central Cloudinary (`uploadBuffer`, `remove`) |

## 🧩 Fichiers et responsabilités

| Fichier | Responsabilité |
|---|---|
| `services/getMedia.service.ts` | Liste paginée des médias (filtres module/entityId/uploadedBy) |
| `services/getMediaById.service.ts` | Métadonnées d'un media |
| `services/uploadMedia.service.ts` | Upload : Sharp (images) → Cloudinary → BDD |
| `services/deleteMedia.service.ts` | Suppression BDD + Cloudinary (best-effort) |
| `services/getEntityMedia.service.ts` | Tous les médias d'une entité |
| `repositories/media.repositories.ts` | CRUD métadonnées + cache Redis |
| `validations/media.validations.ts` | Schémas Zod (upload, params) |
| `types/media.enums.ts` | MediaType (4), MediaModule (6) |
| `types/media.types.ts` | Media, pagination |
| `routes/media.route.ts` | Routes `/api/media/*` |
| `media.module.ts` | Assemblage (repo → services → contrôleurs → routes) |

## 🌐 API / Routes

| Méthode | Chemin | Description |
|---|---|---|
| POST | `/api/media/upload` | Upload (multer, `multipart/form-data`, champ `file`) |
| GET | `/api/media` | Liste paginée (`?module=&entityId=&uploadedBy=`) |
| GET | `/api/media/:id` | Métadonnées d'un media |
| GET | `/api/media/entity/:entityId` | Médias d'une entité |
| DELETE | `/api/media/:id` | Suppression (métadonnées BDD + fichier Cloudinary) |

> ⚠️ Les routes `/:id` et `/entity/:entityId` **ne sont pas ambiguës** : `/entity/...` est déclarée avant `/:id` et `/upload` avant `/`.

## 🗂️ Table SQL `media`

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

## 🔒 Sécurité / Config

- Toutes les routes protégées par **`authMiddleware`**.
- **Config Cloudinary requise** dans `.env` :
  ```
  CLOUDINARY_CLOUD_NAME=...
  CLOUDINARY_API_KEY=...
  CLOUDINARY_API_SECRET=...
  ```
- **Multer** limite à 5 Mo (images jpeg/jpg/png/webp) — configurable.
- **Sharp** redimensionne les images à 1200px max (qualité JPEG 80) avant upload.
- `uploaded_by` est injecté depuis l'utilisateur connecté.
- La suppression Cloudinary est **best-effort** : la métadonnée BDD est toujours supprimée.
- Cache Redis invalidé à chaque mutation (`media:all:*`, `media:id:*`).

## 🧪 Tests

Les tests mockent `cloudinary` et `sharp` (aucun appel réseau réel) :

| Fichier | Couverture |
|---|---|
| `test/media.repositories.spec.ts` | CRUD métadonnées, pagination, filtres, cache |
| `test/media.services.spec.ts` | Upload (Sharp+Cloudinary), suppression (BDD+Cloudinary), fichiers mockés |
| `test/media.controllers.spec.ts` | 200/201, validation Zod 400, upload sans fichier |

## 🔄 Dépendances / Intégration

- **Multer** : réception des fichiers (`uploadMiddleware.single('file')`).
- **Sharp** : optimisation des images.
- **Cloudinary** : stockage cloud (`CloudinaryService`).
- **Auth** : `uploaded_by` référencé vers `auth(id)` (utilisateur connecté).
- **Tous les modules métier** (territory, reports, missions, interventions,
  societes, infrastructures) peuvent lier leurs entités via `module` + `entityId`
  et le flag `media` dans `permission.enums.ts`.
- **Permissions** : module RBAC `media` (`media.create`, `media.read`,
  `media.manage`...) — ajouté au seed des rôles.