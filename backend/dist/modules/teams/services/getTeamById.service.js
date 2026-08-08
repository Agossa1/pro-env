"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET TEAM BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'une équipe par son identifiant UUID.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTeamByIdService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetTeamByIdService {
    constructor(teamRepository, logger) {
        this.teamRepository = teamRepository;
        this.logger = logger;
    }
    /** Récupère une équipe par son identifiant UUID. */
    async getTeamById(id) {
        try {
            const team = await this.teamRepository.getTeamById(id);
            if (!team) {
                throw new appErrors_1.NotFoundError('Équipe introuvable.');
            }
            this.logger.info(`Équipe récupérée par ID : ${team.name}`);
            return team;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getTeamById (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetTeamByIdService = GetTeamByIdService;
//# sourceMappingURL=getTeamById.service.js.map