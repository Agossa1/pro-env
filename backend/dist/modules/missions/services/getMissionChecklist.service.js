"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET MISSION CHECKLIST SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération de la checklist d'une mission.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMissionChecklistService = void 0;
class GetMissionChecklistService {
    constructor(missionRepository, logger) {
        this.missionRepository = missionRepository;
        this.logger = logger;
    }
    /** Récupère la checklist d'une mission. */
    async getMissionChecklist(missionId) {
        try {
            const checklist = await this.missionRepository.getMissionChecklist(missionId);
            this.logger.info(`Checklist de la mission ${missionId} : ${checklist.length} élément(s)`);
            return checklist;
        }
        catch (error) {
            this.logger.error(`Erreur getMissionChecklist (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetMissionChecklistService = GetMissionChecklistService;
//# sourceMappingURL=getMissionChecklist.service.js.map