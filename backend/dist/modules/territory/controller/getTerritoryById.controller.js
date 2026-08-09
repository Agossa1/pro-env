"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTerritoryByIdController = void 0;
const zod_1 = require("zod");
const territory_validations_1 = require("../validations/territory.validations");
class GetTerritoryByIdController {
    constructor(getTerritoryByIdService) {
        this.getTerritoryByIdService = getTerritoryByIdService;
        this.getTerritoryById = async (req, res, next) => {
            try {
                const { id } = territory_validations_1.IdParamSchema.parse(req.params);
                const territory = await this.getTerritoryByIdService.getTerritoryById(id);
                res.status(200).json({
                    success: true,
                    message: 'Territoire récupéré avec succès.',
                    data: territory,
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
exports.GetTerritoryByIdController = GetTerritoryByIdController;
//# sourceMappingURL=getTerritoryById.controller.js.map