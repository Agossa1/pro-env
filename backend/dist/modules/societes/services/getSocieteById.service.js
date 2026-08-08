"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET SOCIETE BY ID SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'une société par son identifiant UUID.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSocieteByIdService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetSocieteByIdService {
    constructor(societeRepository, logger) {
        this.societeRepository = societeRepository;
        this.logger = logger;
    }
    /**
     * Récupère une société par son identifiant UUID.
     * @param id Identifiant UUID de la société
     */
    async getSocieteById(id) {
        try {
            const societe = await this.societeRepository.getSocieteById(id);
            if (!societe) {
                throw new appErrors_1.NotFoundError('Société introuvable.');
            }
            this.logger.info(`Société récupérée par ID : ${societe.name}`);
            return societe;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getSocieteById (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetSocieteByIdService = GetSocieteByIdService;
//# sourceMappingURL=getSocieteById.service.js.map