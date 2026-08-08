"use strict";
/*
 * |--------------------------------------------------------------------------
 * | CREATE TERRITORY SERVICE
 * |--------------------------------------------------------------------------
 * | Service métier de création d'un territoire.
 * | Applique les règles de contrôle : type existant, code unique, cohérence
 * | hiérarchique du parent, organisation valide — avant d'appeler le
 * | repository (qui reste 100% SQL).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTerritoryService = void 0;
const appErrors_1 = require("../../../shared/errors/appErrors");
class CreateTerritoryService {
    constructor(territoryRepository, logger) {
        this.territoryRepository = territoryRepository;
        this.logger = logger;
    }
    /**
     * Crée un territoire avec toutes les validations métier.
     * @param dto Données du territoire (avec GeoJSON uploadé)
     * @param creatorId Identifiant de l'utilisateur connecté (optionnel)
     */
    async createTerritory(dto, creatorId) {
        try {
            // 1. Vérifier que le type de territoire existe
            if (!dto.territoryTypeId) {
                throw new appErrors_1.BadRequestError("L'identifiant du type de territoire est requis.");
            }
            const type = await this.territoryRepository.getTerritoryTypeById(dto.territoryTypeId);
            if (!type) {
                throw new appErrors_1.BadRequestError('Type de territoire introuvable.');
            }
            // 2. Vérifier l'unicité du code (si fourni, table `territories`)
            if (dto.code) {
                const trimmedCode = dto.code.trim().toUpperCase();
                dto.code = trimmedCode;
                const codeExists = await this.territoryRepository.existsTerritoryByCode(trimmedCode);
                if (codeExists) {
                    throw new appErrors_1.BadRequestError(`Un territoire existe déjà avec le code "${trimmedCode}".`);
                }
            }
            // 3. Si un parent est fourni, valider la cohérence hiérarchique
            if (dto.parentTerritoryId) {
                const parent = await this.territoryRepository.getTerritoryById(dto.parentTerritoryId);
                if (!parent) {
                    throw new appErrors_1.BadRequestError('Territoire parent introuvable.');
                }
                if (parent.deletedAt) {
                    throw new appErrors_1.BadRequestError('Le territoire parent est supprimé.');
                }
                // Le niveau hiérarchique du parent doit être strictement inférieur
                const parentType = parent.territoryTypeId
                    ? await this.territoryRepository.getTerritoryTypeById(parent.territoryTypeId)
                    : null;
                if (parentType && parentType.hierarchyLevel >= type.hierarchyLevel) {
                    throw new appErrors_1.BadRequestError(`Le type "${type.code}" (niveau ${type.hierarchyLevel}) ne peut pas être enfant du type "${parentType.code}" (niveau ${parentType.hierarchyLevel}).`);
                }
            }
            // 4. Vérifier que la géométrie est présente (un territoire doit être cartographié)
            if (!dto.geometry) {
                throw new appErrors_1.BadRequestError('La géométrie (GeoJSON) du territoire est requise.');
            }
            // 5. Appeler le repository (transaction SQL pure)
            const created = await this.territoryRepository.createTerritory({
                ...dto,
                createdBy: creatorId ?? dto.createdBy ?? null,
            });
            this.logger.info(`Territoire créé : ${created.name} (type ${type.code})`);
            return created;
        }
        catch (error) {
            if (error instanceof appErrors_1.BadRequestError)
                throw error;
            this.logger.error(`Erreur createTerritory (service): ${error.message}`);
            throw error;
        }
    }
}
exports.CreateTerritoryService = CreateTerritoryService;
//# sourceMappingURL=createTerritory.service.js.map