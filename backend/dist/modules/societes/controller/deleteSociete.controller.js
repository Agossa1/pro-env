"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteSocieteController = void 0;
const zod_1 = require("zod");
const societe_validations_1 = require("../validations/societe.validations");
class DeleteSocieteController {
    constructor(deleteSocieteService) {
        this.deleteSocieteService = deleteSocieteService;
        this.deleteSociete = async (req, res, next) => {
            try {
                const { id } = societe_validations_1.IdParamSchema.parse(req.params);
                await this.deleteSocieteService.deleteSociete(id);
                res.status(200).json({
                    success: true,
                    message: 'Société supprimée avec succès.',
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
exports.DeleteSocieteController = DeleteSocieteController;
//# sourceMappingURL=deleteSociete.controller.js.map