"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMediaController = void 0;
class GetMediaController {
    constructor(getMediaService) {
        this.getMediaService = getMediaService;
        this.getMedia = async (req, res, next) => {
            try {
                const query = {
                    page: req.query.page ? parseInt(req.query.page, 10) : undefined,
                    limit: req.query.limit ? parseInt(req.query.limit, 10) : undefined,
                    module: req.query.module,
                    entityId: req.query.entityId,
                    uploadedBy: req.query.uploadedBy,
                };
                const result = await this.getMediaService.getMedia(query);
                res.status(200).json({
                    success: true,
                    message: 'Liste des médias récupérée avec succès.',
                    data: result.data,
                    pagination: {
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: result.totalPages,
                    },
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.GetMediaController = GetMediaController;
//# sourceMappingURL=getMedia.controller.js.map