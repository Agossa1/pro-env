"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTerritoryByCodeController = void 0;
const zod_1 = require("zod");
const territory_validations_1 = require("../validations/territory.validations");
class GetTerritoryByCodeController {
    constructor(getTerritoryByCodeService) {
        this.getTerritoryByCodeService = getTerritoryByCodeService;
        this.getTerritoryByCode = async (req, res, next) => {
            try {
                const { code } = territory_validations_1.CodeParamSchema.parse(req.params);
                const territory = await this.getTerritoryByCodeService.getTerritoryByCode(code);
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
exports.GetTerritoryByCodeController = GetTerritoryByCodeController;
//# sourceMappingURL=getTerritoryByCode.controller.js.map