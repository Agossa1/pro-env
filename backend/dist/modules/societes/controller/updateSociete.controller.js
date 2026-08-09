"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSocieteController = void 0;
const zod_1 = require("zod");
const societe_validations_1 = require("../validations/societe.validations");
class UpdateSocieteController {
    constructor(updateSocieteService) {
        this.updateSocieteService = updateSocieteService;
        this.updateSociete = async (req, res, next) => {
            try {
                const { id } = societe_validations_1.IdParamSchema.parse(req.params);
                const payload = societe_validations_1.UpdateSocieteSchema.parse(req.body);
                const societe = await this.updateSocieteService.updateSociete(id, payload);
                res.status(200).json({
                    success: true,
                    message: 'Société mise à jour avec succès.',
                    data: societe,
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
exports.UpdateSocieteController = UpdateSocieteController;
//# sourceMappingURL=updateSociete.controller.js.map