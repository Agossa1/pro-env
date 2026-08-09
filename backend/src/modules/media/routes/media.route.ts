import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';
import { uploadMiddleware } from '../../../shared/middlewares/upload.middleware';

// Controllers
import { GetMediaController } from '../controller/getMedia.controller';
import { GetMediaByIdController } from '../controller/getMediaById.controller';
import { UploadMediaController } from '../controller/uploadMedia.controller';
import { DeleteMediaController } from '../controller/deleteMedia.controller';
import { GetEntityMediaController } from '../controller/getEntityMedia.controller';

export class MediaRoutes {
  public router: Router;

  constructor(
    private readonly getMediaController: GetMediaController,
    private readonly getMediaByIdController: GetMediaByIdController,
    private readonly uploadMediaController: UploadMediaController,
    private readonly deleteMediaController: DeleteMediaController,
    private readonly getEntityMediaController: GetEntityMediaController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // ── Routes protégées par authentification ──────────────────────────────
    this.router.use(authMiddleware);

    // POST /api/media/upload — upload (multer, multipart/form-data)
    this.router.post('/upload', uploadMiddleware.single('file'), this.uploadMediaController.uploadMedia);

    // GET /api/media/entity/:entityId — médias d'une entité
    this.router.get('/entity/:entityId', this.getEntityMediaController.getEntityMedia);

    // GET /api/media — liste paginée (filtres ?module=&entityId=&uploadedBy=)
    this.router.get('/', this.getMediaController.getMedia);

    // GET /api/media/:id — métadonnées d'un media
    this.router.get('/:id', this.getMediaByIdController.getMediaById);

    // DELETE /api/media/:id — suppression (BDD + Cloudinary)
    this.router.delete('/:id', this.deleteMediaController.deleteMedia);
  }
}