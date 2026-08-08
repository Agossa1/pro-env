"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET MEDIA BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'un media par son identifiant UUID.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMediaByIdService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetMediaByIdService {
    constructor(mediaRepository, logger) {
        this.mediaRepository = mediaRepository;
        this.logger = logger;
    }
    /** Récupère un media par son identifiant UUID. */
    async getMediaById(id) {
        try {
            const media = await this.mediaRepository.getMediaById(id);
            if (!media) {
                throw new appErrors_1.NotFoundError('Media introuvable.');
            }
            this.logger.info(`Media récupéré par ID : ${media.fileName}`);
            return media;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getMediaById (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetMediaByIdService = GetMediaByIdService;
//# sourceMappingURL=getMediaById.service.js.map