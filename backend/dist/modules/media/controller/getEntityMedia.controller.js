"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEntityMediaController = void 0;
const zod_1 = require("zod");
const media_validations_1 = require("../validations/media.validations");
class GetEntityMediaController {
    constructor(getEntityMediaService) {
        this.getEntityMediaService = getEntityMediaService;
        this.getEntityMedia = async (req, res, next) => {
            try {
                const { entityId } = media_validations_1.EntityIdParamSchema.parse(req.params);
                const media = await this.getEntityMediaService.getEntityMedia(entityId);
                res.status(200).json({
                    success: true,
                    message: 'Médias de l\'entité récupérés avec succès.',
                    data: media,
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
exports.GetEntityMediaController = GetEntityMediaController;
//# sourceMappingURL=getEntityMedia.controller.js.map