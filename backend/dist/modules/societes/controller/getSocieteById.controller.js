"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSocieteByIdController = void 0;
const zod_1 = require("zod");
const societe_validations_1 = require("../validations/societe.validations");
class GetSocieteByIdController {
    constructor(getSocieteByIdService) {
        this.getSocieteByIdService = getSocieteByIdService;
        this.getSocieteById = async (req, res, next) => {
            try {
                const { id } = societe_validations_1.IdParamSchema.parse(req.params);
                const societe = await this.getSocieteByIdService.getSocieteById(id);
                res.status(200).json({
                    success: true,
                    message: 'Société récupérée avec succès.',
                    data: societe,
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
exports.GetSocieteByIdController = GetSocieteByIdController;
//# sourceMappingURL=getSocieteById.controller.js.map