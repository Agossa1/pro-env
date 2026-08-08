"use strict";
/*
 * |--------------------------------------------------------------------------
 * | CREATE SOCIETE SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'une société.
 * | Vérifie l'unicité du n° d'enregistrement avant insertion et associe la
 * | société à un territoire (mairie/commune ou ministère) :
 * |   - Admin  : le territoryId est fourni dans le payload (association libre)
 * |   - Maire/Ministere : le territoryId est déduit du territoire de
 * |     l'utilisateur connecté (creator.territoryId)
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSocieteService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreateSocieteService {
    constructor(societeRepository, logger) {
        this.societeRepository = societeRepository;
        this.logger = logger;
    }
    /**
     * Crée une nouvelle société après validation de l'unicité du n° d'enregistrement.
     * @param payload Données de la société (name, type, ...)
     * @param creator Contexte de l'utilisateur connecté (optionnel)
     */
    async createSociete(payload, creator) {
        try {
            if (!payload.name || !payload.type) {
                throw new appErrors_1.BadRequestError('Le nom et le type de la société sont requis.');
            }
            if (payload.registrationNumber) {
                const existing = await this.societeRepository.getSocieteByRegistrationNumber(payload.registrationNumber);
                if (existing) {
                    throw new appErrors_1.BadRequestError(`Une société existe déjà avec le n° d'enregistrement "${payload.registrationNumber}".`);
                }
            }
            // Déterminer le territoire d'association :
            // - Si non fourni par un admin, on utilise le territoire de l'utilisateur connecté
            const territoryId = payload.territoryId ?? creator?.territoryId ?? null;
            const created = await this.societeRepository.createSociete({
                ...payload,
                territoryId,
            });
            this.logger.info(`Société créée : ${created.name}${territoryId ? ` (associée au territoire ${territoryId})` : ''}`);
            return created;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur createSociete (service): ${error.message}`);
            throw error;
        }
    }
}
exports.CreateSocieteService = CreateSocieteService;
//# sourceMappingURL=createSociete.service.js.map