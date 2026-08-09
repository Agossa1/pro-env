"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET ENTITY MEDIA SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération de tous les médias liés à une entité.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEntityMediaService = void 0;
class GetEntityMediaService {
    constructor(mediaRepository, logger) {
        this.mediaRepository = mediaRepository;
        this.logger = logger;
    }
    /** Récupère les médias d'une entité (par entityId). */
    async getEntityMedia(entityId) {
        try {
            const result = await this.mediaRepository.getAllMedia({ entityId });
            this.logger.info(`Médias de l'entité ${entityId} : ${result.total} résultat(s)`);
            return result.data;
        }
        catch (error) {
            this.logger.error(`Erreur getEntityMedia (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetEntityMediaService = GetEntityMediaService;
//# sourceMappingURL=getEntityMedia.service.js.map