"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSocieteByRegistrationNumberController = void 0;
const zod_1 = require("zod");
const societe_validations_1 = require("../validations/societe.validations");
class GetSocieteByRegistrationNumberController {
    constructor(getSocieteByRegistrationNumberService) {
        this.getSocieteByRegistrationNumberService = getSocieteByRegistrationNumberService;
        this.getSocieteByRegistrationNumber = async (req, res, next) => {
            try {
                const { registrationNumber } = societe_validations_1.RegistrationNumberParamSchema.parse(req.params);
                const societe = await this.getSocieteByRegistrationNumberService
                    .getSocieteByRegistrationNumber(registrationNumber);
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
exports.GetSocieteByRegistrationNumberController = GetSocieteByRegistrationNumberController;
//# sourceMappingURL=getSocieteByRegistrationNumber.controller.js.map