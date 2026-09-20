"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSocieteController = void 0;
const zod_1 = require("zod");
const societe_validations_1 = require("../validations/societe.validations");
class CreateSocieteController {
    constructor(createSocieteService) {
        this.createSocieteService = createSocieteService;
        this.createSociete = async (req, res, next) => {
            try {
                const payload = societe_validations_1.CreateSocieteSchema.parse(req.body);
                // Contexte de l'utilisateur connecté :
                // - une mairie/ministère crée sa société → municipalityId = req.user.municipalityId
                // - un admin fournit le municipalityId dans le body (association libre)
                const creator = {
                    userId: req.user?.userId ?? undefined,
                    municipalityId: req.user?.municipalityId ?? null,
                };
                const societe = await this.createSocieteService.createSociete(payload, creator);
                res.status(201).json({
                    success: true,
                    message: 'Société créée avec succès.',
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
exports.CreateSocieteController = CreateSocieteController;
//# sourceMappingURL=createSociete.controller.js.map