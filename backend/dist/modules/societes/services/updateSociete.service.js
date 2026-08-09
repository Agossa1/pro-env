"use strict";
/*
 * |--------------------------------------------------------------------------
 * | UPDATE SOCIETE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de mise à jour d'une société.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSocieteService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class UpdateSocieteService {
    constructor(societeRepository, logger) {
        this.societeRepository = societeRepository;
        this.logger = logger;
    }
    /**
     * Met à jour une société existante.
     * @param id Identifiant UUID de la société
     * @param payload Champs modifiables (name, type, ...)
     */
    async updateSociete(id, payload) {
        try {
            const updated = await this.societeRepository.updateSociete(id, payload);
            if (!updated) {
                throw new appErrors_1.NotFoundError('Société introuvable.');
            }
            this.logger.info(`Société mise à jour : ${updated.name}`);
            return updated;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur updateSociete (service): ${error.message}`);
            throw error;
        }
    }
}
exports.UpdateSocieteService = UpdateSocieteService;
//# sourceMappingURL=updateSociete.service.js.map