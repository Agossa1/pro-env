"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMediaController = void 0;
const zod_1 = require("zod");
const media_validations_1 = require("../validations/media.validations");
class DeleteMediaController {
    constructor(deleteMediaService) {
        this.deleteMediaService = deleteMediaService;
        this.deleteMedia = async (req, res, next) => {
            try {
                const { id } = media_validations_1.IdParamSchema.parse(req.params);
                await this.deleteMediaService.deleteMedia(id);
                res.status(200).json({
                    success: true,
                    message: 'Media supprimé avec succès.',
                    data: null,
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        success: false,
                        message: 'Erreur de validation des paramètres.',
                        errors: error.issues,
                    });
                    return;
                }
                next(error);
            }
        };
    }
}
exports.DeleteMediaController = DeleteMediaController;
//# sourceMappingURL=deleteMedia.controller.js.map