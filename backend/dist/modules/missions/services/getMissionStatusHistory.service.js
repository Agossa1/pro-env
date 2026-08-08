"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET MISSION STATUS HISTORY SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération de l'historique des statuts d'une mission.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMissionStatusHistoryService = void 0;
class GetMissionStatusHistoryService {
    constructor(missionRepository, logger) {
        this.missionRepository = missionRepository;
        this.logger = logger;
    }
    /** Récupère l'historique des statuts d'une mission. */
    async getMissionStatusHistory(missionId) {
        try {
            const history = await this.missionRepository.getMissionStatusHistory(missionId);
            this.logger.info(`Historique de la mission ${missionId} : ${history.length} entrée(s)`);
            return history;
        }
        catch (error) {
            this.logger.error(`Erreur getMissionStatusHistory (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetMissionStatusHistoryService = GetMissionStatusHistoryService;
//# sourceMappingURL=getMissionStatusHistory.service.js.map