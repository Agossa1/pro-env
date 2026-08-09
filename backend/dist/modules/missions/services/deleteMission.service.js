"use strict";
/*
 * |--------------------------------------------------------------------------
 * | DELETE MISSION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de suppression logique d'une mission.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMissionService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class DeleteMissionService {
    constructor(missionRepository, logger) {
        this.missionRepository = missionRepository;
        this.logger = logger;
    }
    /**
     * Supprime logiquement une mission par son identifiant UUID (deleted_at).
     * @param id Identifiant UUID de la mission à supprimer
     */
    async deleteMission(id) {
        try {
            await this.missionRepository.deleteMission(id);
            this.logger.info(`Mission supprimée : ${id}`);
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur deleteMission (service): ${error.message}`);
            throw error;
        }
    }
}
exports.DeleteMissionService = DeleteMissionService;
//# sourceMappingURL=deleteMission.service.js.map