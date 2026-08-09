"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMissionController = void 0;
const zod_1 = require("zod");
const mission_validations_1 = require("../validations/mission.validations");
class CreateMissionController {
    constructor(createMissionService) {
        this.createMissionService = createMissionService;
        this.createMission = async (req, res, next) => {
            try {
                const payload = mission_validations_1.CreateMissionSchema.parse(req.body);
                // Injecte l'utilisateur connecté comme créateur de la mission
                const creator = {
                    userId: req.user?.userId ?? undefined,
                };
                const mission = await this.createMissionService.createMission(payload, creator);
                res.status(201).json({
                    success: true,
                    message: 'Mission créée avec succès.',
                    data: mission,
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
exports.CreateMissionController = CreateMissionController;
//# sourceMappingURL=createMission.controller.js.map