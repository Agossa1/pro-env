"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTerritoryTypeController = void 0;
const zod_1 = require("zod");
const territory_validations_1 = require("../validations/territory.validations");
class CreateTerritoryTypeController {
    constructor(createTerritoryTypeService) {
        this.createTerritoryTypeService = createTerritoryTypeService;
        this.createTerritoryType = async (req, res, next) => {
            try {
                const payload = territory_validations_1.CreateTerritoryTypeSchema.parse(req.body);
                const territoryType = await this.createTerritoryTypeService.createTerritoryType(payload);
                res.status(201).json({
                    success: true,
                    message: 'Type de territoire créé avec succès.',
                    data: territoryType,
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
exports.CreateTerritoryTypeController = CreateTerritoryTypeController;
//# sourceMappingURL=createTerritoryType.controller.js.map