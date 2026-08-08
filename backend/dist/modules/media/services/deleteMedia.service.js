"use strict";
/*
 * |--------------------------------------------------------------------------
 * | DELETE MEDIA SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression d'un media :
 * | 1. Supprime la métadonnée en base
 * 2. Supprime le fichier Cloudinary
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMediaService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class DeleteMediaService {
    constructor(mediaRepository, cloudinaryService, logger) {
        this.mediaRepository = mediaRepository;
        this.cloudinaryService = cloudinaryService;
        this.logger = logger;
    }
    /** Supprime un media (BDD + Cloudinary). */
    async deleteMedia(id) {
        try {
            const media = await this.mediaRepository.getMediaById(id);
            if (!media) {
                throw new appErrors_1.NotFoundError('Media introuvable.');
            }
            // Supprime en base
            await this.mediaRepository.deleteMedia(id);
            // Supprime le fichier Cloudinary (best-effort : ne bloque pas si échec Cloudinary)
            try {
                await this.cloudinaryService.remove(media.publicId);
            }
            catch {
                // Ignorer l'échec Cloudinary : la métadonnée est déjà supprimée
            }
            this.logger.info(`Media supprimé : ${media.fileName}`);
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur deleteMedia (service): ${error.message}`);
            throw error;
        }
    }
}
exports.DeleteMediaService = DeleteMediaService;
//# sourceMappingURL=deleteMedia.service.js.map