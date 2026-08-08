"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadMediaController = void 0;
class UploadMediaController {
    constructor(uploadMediaService) {
        this.uploadMediaService = uploadMediaService;
        this.uploadMedia = async (req, res, next) => {
            try {
                // Le fichier est fourni par le middleware multer (uploadMiddleware) via req.file
                const file = req.file;
                if (!file) {
                    res.status(400).json({
                        success: false,
                        message: 'Aucun fichier fourni.',
                    });
                    return;
                }
                const result = await this.uploadMediaService.uploadMedia({
                    buffer: file.buffer,
                    originalName: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                    module: req.body?.module ?? null,
                    entityId: req.body?.entityId ?? null,
                    uploadedBy: req.user?.userId ?? null,
                });
                res.status(201).json({
                    success: true,
                    message: 'Media uploadé avec succès.',
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.UploadMediaController = UploadMediaController;
//# sourceMappingURL=uploadMedia.controller.js.map