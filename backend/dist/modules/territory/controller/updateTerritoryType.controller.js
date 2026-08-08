"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTerritoryTypeController = void 0;
const zod_1 = require("zod");
const territory_validations_1 = require("../validations/territory.validations");
class UpdateTerritoryTypeController {
    constructor(updateTerritoryTypeService) {
        this.updateTerritoryTypeService = updateTerritoryTypeService;
        this.updateTerritoryType = async (req, res, next) => {
            try {
                const { id } = territory_validations_1.IdParamSchema.parse(req.params);
                const payload = territory_validations_1.UpdateTerritoryTypeSchema.parse(req.body);
                const territoryType = await this.updateTerritoryTypeService.updateTerritoryType(id, payload);
                res.status(200).json({
                    success: true,
                    message: 'Type de territoire mis à jour avec succès.',
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
exports.UpdateTerritoryTypeController = UpdateTerritoryTypeController;
//# sourceMappingURL=updateTerritoryType.controller.js.map