"use strict";
/*
 * |--------------------------------------------------------------------------
 * | CREATE TEAM SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'une équipe (institution ou prestataire).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTeamService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
const team_enums_1 = require("../types/team.enums");
class CreateTeamService {
    constructor(teamRepository, logger) {
        this.teamRepository = teamRepository;
        this.logger = logger;
    }
    /** Crée une équipe terrain (institution publique ou société prestataire). */
    async createTeam(payload) {
        try {
            if (!payload.name || !payload.teamType) {
                throw new appErrors_1.BadRequestError('Le nom et le type de l\'équipe sont requis.');
            }
            if (payload.teamType === team_enums_1.TeamType.PROVIDER && !payload.organizationId) {
                throw new appErrors_1.BadRequestError('Une équipe prestataire (provider) doit être rattachée à une société (organizationId requis).');
            }
            if (payload.teamType === team_enums_1.TeamType.INSTITUTION && payload.organizationId) {
                throw new appErrors_1.BadRequestError('Une équipe d\'institution publique ne doit pas être rattachée à une société.');
            }
            const created = await this.teamRepository.createTeam({
                ...payload,
                organizationId: payload.teamType === team_enums_1.TeamType.PROVIDER ? payload.organizationId : null,
            });
            this.logger.info(`Équipe créée : ${created.name} (${created.teamType})`);
            return created;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur createTeam (service): ${error.message}`);
            throw error;
        }
    }
}
exports.CreateTeamService = CreateTeamService;
//# sourceMappingURL=createTeam.service.js.map