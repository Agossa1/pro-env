"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMediaByIdController = void 0;
const zod_1 = require("zod");
const media_validations_1 = require("../validations/media.validations");
class GetMediaByIdController {
    constructor(getMediaByIdService) {
        this.getMediaByIdService = getMediaByIdService;
        this.getMediaById = async (req, res, next) => {
            try {
                const { id } = media_validations_1.IdParamSchema.parse(req.params);
                const media = await this.getMediaByIdService.getMediaById(id);
                res.status(200).json({
                    success: true,
                    message: 'Media récupéré avec succès.',
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
exports.GetMediaByIdController = GetMediaByIdController;
//# sourceMappingURL=getMediaById.controller.js.map