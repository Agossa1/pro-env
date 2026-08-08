"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTerritoryTypeByIdController = void 0;
const zod_1 = require("zod");
const territory_validations_1 = require("../validations/territory.validations");
class GetTerritoryTypeByIdController {
    constructor(getTerritoryTypeByIdService) {
        this.getTerritoryTypeByIdService = getTerritoryTypeByIdService;
        this.getTerritoryTypeById = async (req, res, next) => {
            try {
                const { id } = territory_validations_1.IdParamSchema.parse(req.params);
                const territoryType = await this.getTerritoryTypeByIdService.getTerritoryTypeById(id);
                res.status(200).json({
                    success: true,
                    message: 'Type de territoire récupéré avec succès.',
                    data: territoryType,
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        success: false,
                        message: 'Erreur de validation des paramètres.',
                        errors: error.issues,
                    });
                    return;
                }
                next(error);
            }
        };
    }
}
exports.GetTerritoryTypeByIdController = GetTerritoryTypeByIdController;
//# sourceMappingURL=getTerritoryTypeById.controller.js.map