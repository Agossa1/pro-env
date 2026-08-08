"use strict";
/*
 * |--------------------------------------------------------------------------
 * | DELETE SOCIETE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression d'une société.
 * | La suppression est bloquée si des références existent (FK).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteSocieteService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class DeleteSocieteService {
    constructor(societeRepository, logger) {
        this.societeRepository = societeRepository;
        this.logger = logger;
    }
    /**
     * Supprime une société par son identifiant UUID.
     * @param id Identifiant UUID de la société à supprimer
     */
    async deleteSociete(id) {
        try {
            await this.societeRepository.deleteSociete(id);
            this.logger.info(`Société supprimée : ${id}`);
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError || error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur deleteSociete (service): ${error.message}`);
            throw error;
        }
    }
}
exports.DeleteSocieteService = DeleteSocieteService;
//# sourceMappingURL=deleteSociete.service.js.map