"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTerritoryTypeController = void 0;
const zod_1 = require("zod");
const territory_validations_1 = require("../validations/territory.validations");
class DeleteTerritoryTypeController {
    constructor(deleteTerritoryTypeService) {
        this.deleteTerritoryTypeService = deleteTerritoryTypeService;
        this.deleteTerritoryType = async (req, res, next) => {
            try {
                const { id } = territory_validations_1.IdParamSchema.parse(req.params);
                await this.deleteTerritoryTypeService.deleteTerritoryType(id);
                res.status(200).json({
                    success: true,
                    message: 'Type de territoire supprimé avec succès.',
                    data: null,
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
exports.DeleteTerritoryTypeController = DeleteTerritoryTypeController;
//# sourceMappingURL=deleteTerritoryType.controller.js.map