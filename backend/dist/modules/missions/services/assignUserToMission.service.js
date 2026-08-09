"use strict";
/*
 * |--------------------------------------------------------------------------
 * | ASSIGN USER TO MISSION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier d'assignation d'un utilisateur à une mission.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignUserToMissionService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class AssignUserToMissionService {
    constructor(missionRepository, logger) {
        this.missionRepository = missionRepository;
        this.logger = logger;
    }
    /** Assigne un utilisateur à une mission (idempotent). */
    async assignUserToMission(missionId, userId, context) {
        try {
            if (!missionId || !userId) {
                throw new appErrors_1.BadRequestError('La mission et l\'utilisateur sont requis.');
            }
            const assignment = await this.missionRepository.assignUserToMission(missionId, userId, context?.assignedBy);
            this.logger.info(`Utilisateur ${userId} assigné à la mission ${missionId} (par ${context?.assignedBy ?? 'système'})`);
            return assignment;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur assignUserToMission (service): ${error.message}`);
            throw error;
        }
    }
}
exports.AssignUserToMissionService = AssignUserToMissionService;
//# sourceMappingURL=assignUserToMission.service.js.map