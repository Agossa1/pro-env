"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET MEDIA SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération paginée de la liste des médias.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMediaService = void 0;
class GetMediaService {
    constructor(mediaRepository, logger) {
        this.mediaRepository = mediaRepository;
        this.logger = logger;
    }
    /** Récupère la liste paginée des médias avec filtres optionnels. */
    async getMedia(query = {}) {
        try {
            const result = await this.mediaRepository.getAllMedia(query);
            this.logger.info(`Liste des médias récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur getMedia (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetMediaService = GetMediaService;
//# sourceMappingURL=getMedia.service.js.map