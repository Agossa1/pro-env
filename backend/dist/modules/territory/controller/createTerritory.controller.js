"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTerritoryController = void 0;
const zod_1 = require("zod");
const territory_validations_1 = require("../validations/territory.validations");
class CreateTerritoryController {
    constructor(createTerritoryService) {
        this.createTerritoryService = createTerritoryService;
        this.createTerritory = async (req, res, next) => {
            try {
                // 1. Validation des données d'entrée (avec GeoJSON uploadé)
                const payload = territory_validations_1.CreateTerritorySchema.parse(req.body);
                // 2. Contexte créateur (utilisateur authentifié si présent)
                const creatorId = req.user?.userId ?? null;
                // 3. Appel au service métier
                const territory = await this.createTerritoryService.createTerritory(payload, creatorId);
                // 4. Réponse standardisée
                res.status(201).json({
                    success: true,
                    message: 'Territoire créé avec succès.',
                    data: territory,
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        success: false,
                        message: 'Erreur de validation des données.',
                        errors: error.issues,
                    });
                    return;
                }
                next(error);
            }
        };
    }
}
exports.CreateTerritoryController = CreateTerritoryController;
//# sourceMappingURL=createTerritory.controller.js.map