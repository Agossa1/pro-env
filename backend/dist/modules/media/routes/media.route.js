"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
const upload_middleware_1 = require("../../../shared/middlewares/upload.middleware");
class MediaRoutes {
    constructor(getMediaController, getMediaByIdController, uploadMediaController, deleteMediaController, getEntityMediaController) {
        this.getMediaController = getMediaController;
        this.getMediaByIdController = getMediaByIdController;
        this.uploadMediaController = uploadMediaController;
        this.deleteMediaController = deleteMediaController;
        this.getEntityMediaController = getEntityMediaController;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // ── Routes protégées par authentification ──────────────────────────────
        this.router.use(auth_middleware_1.authMiddleware);
        // POST /api/media/upload — upload (multer, multipart/form-data)
        this.router.post('/upload', upload_middleware_1.uploadMiddleware.single('file'), this.uploadMediaController.uploadMedia);
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
exports.MediaRoutes = MediaRoutes;
//# sourceMappingURL=media.route.js.map