"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSocieteTerritoriesController = void 0;
const zod_1 = require("zod");
const societe_validations_1 = require("../validations/societe.validations");
class GetSocieteTerritoriesController {
    constructor(getSocieteTerritoriesService) {
        this.getSocieteTerritoriesService = getSocieteTerritoriesService;
        this.getSocieteTerritories = async (req, res, next) => {
            try {
                const { id } = societe_validations_1.IdParamSchema.parse(req.params);
                const territories = await this.getSocieteTerritoriesService.getSocieteTerritories(id);
                res.status(200).json({
                    success: true,
                    message: 'Territoires de compétence récupérés avec succès.',
                    data: territories,
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
exports.GetSocieteTerritoriesController = GetSocieteTerritoriesController;
//# sourceMappingURL=getSocieteTerritories.controller.js.map