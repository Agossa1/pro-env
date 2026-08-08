"use strict";
/*
 * |--------------------------------------------------------------------------
 * | CREATE MISSION SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'une mission.
 * | Injecte le créateur (utilisateur connecté) et valide les champs requis.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMissionService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreateMissionService {
    constructor(missionRepository, logger) {
        this.missionRepository = missionRepository;
        this.logger = logger;
    }
    /**
     * Crée une nouvelle mission.
     * @param payload Données de la mission (territoire, type, titre...)
     * @param creator Contexte de l'utilisateur connecté (userId)
     */
    async createMission(payload, creator) {
        try {
            if (!payload.territoryId || !payload.title || !payload.missionType) {
                throw new appErrors_1.BadRequestError('Le territoire, le titre et le type de la mission sont requis.');
            }
            const created = await this.missionRepository.createMission({
                ...payload,
                createdBy: creator?.userId ?? payload.createdBy ?? null,
            });
            this.logger.info(`Mission créée : ${created.title} (${created.missionType})`);
            return created;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur createMission (service): ${error.message}`);
            throw error;
        }
    }
}
exports.CreateMissionService = CreateMissionService;
//# sourceMappingURL=createMission.service.js.map