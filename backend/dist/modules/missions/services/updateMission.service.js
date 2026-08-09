"use strict";
/*
 * |--------------------------------------------------------------------------
 * | UPDATE MISSION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de mise à jour d'une mission.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMissionService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class UpdateMissionService {
    constructor(missionRepository, logger) {
        this.missionRepository = missionRepository;
        this.logger = logger;
    }
    /**
     * Met à jour une mission existante.
     * @param id Identifiant UUID de la mission
     * @param payload Champs modifiables (statut, assignation, dates...)
     */
    async updateMission(id, payload) {
        try {
            const updated = await this.missionRepository.updateMission(id, payload);
            if (!updated) {
                throw new appErrors_1.NotFoundError('Mission introuvable.');
            }
            this.logger.info(`Mission mise à jour : ${updated.title}`);
            return updated;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur updateMission (service): ${error.message}`);
            throw error;
        }
    }
}
exports.UpdateMissionService = UpdateMissionService;
//# sourceMappingURL=updateMission.service.js.map