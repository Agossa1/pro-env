"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET MISSION BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'une mission par son identifiant UUID.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMissionByIdService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetMissionByIdService {
    constructor(missionRepository, logger) {
        this.missionRepository = missionRepository;
        this.logger = logger;
    }
    /**
     * Récupère une mission par son identifiant UUID.
     * @param id Identifiant UUID de la mission
     */
    async getMissionById(id) {
        try {
            const mission = await this.missionRepository.getMissionById(id);
            if (!mission) {
                throw new appErrors_1.NotFoundError('Mission introuvable.');
            }
            this.logger.info(`Mission récupérée par ID : ${mission.title}`);
            return mission;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getMissionById (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetMissionByIdService = GetMissionByIdService;
//# sourceMappingURL=getMissionById.service.js.map