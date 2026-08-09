"use strict";
/*
 * |--------------------------------------------------------------------------
 * | GET SOCIETE BY REGISTRATION NUMBER SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de récupération d'une société par son n° d'enregistrement.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSocieteByRegistrationNumberService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class GetSocieteByRegistrationNumberService {
    constructor(societeRepository, logger) {
        this.societeRepository = societeRepository;
        this.logger = logger;
    }
    /**
     * Récupère une société par son numéro d'enregistrement.
     * @param registrationNumber Numéro d'enregistrement de la société
     */
    async getSocieteByRegistrationNumber(registrationNumber) {
        try {
            const societe = await this.societeRepository.getSocieteByRegistrationNumber(registrationNumber);
            if (!societe) {
                throw new appErrors_1.NotFoundError(`Société introuvable avec le n° d'enregistrement : ${registrationNumber}`);
            }
            this.logger.info(`Société récupérée par n° d'enregistrement : ${societe.name}`);
            return societe;
        }
        catch (error) {
            if (error instanceof appErrors_1.NotFoundError)
                throw error;
            this.logger.error(`Erreur getSocieteByRegistrationNumber (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetSocieteByRegistrationNumberService = GetSocieteByRegistrationNumberService;
//# sourceMappingURL=getSocieteByRegistrationNumber.service.js.map