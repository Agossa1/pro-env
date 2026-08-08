"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTerritoryTypeByCodeController = void 0;
const zod_1 = require("zod");
const territory_validations_1 = require("../validations/territory.validations");
class GetTerritoryTypeByCodeController {
    constructor(getTerritoryTypeByCodeService) {
        this.getTerritoryTypeByCodeService = getTerritoryTypeByCodeService;
        this.getTerritoryTypeByCode = async (req, res, next) => {
            try {
                const { code } = territory_validations_1.CodeParamSchema.parse(req.params);
                const territoryType = await this.getTerritoryTypeByCodeService.getTerritoryTypeByCode(code);
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
exports.GetTerritoryTypeByCodeController = GetTerritoryTypeByCodeController;
//# sourceMappingURL=getTerritoryTypeByCode.controller.js.map