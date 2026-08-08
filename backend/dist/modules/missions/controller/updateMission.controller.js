"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMissionController = void 0;
const zod_1 = require("zod");
const mission_validations_1 = require("../validations/mission.validations");
class UpdateMissionController {
    constructor(updateMissionService) {
        this.updateMissionService = updateMissionService;
        this.updateMission = async (req, res, next) => {
            try {
                const { id } = mission_validations_1.IdParamSchema.parse(req.params);
                const payload = mission_validations_1.UpdateMissionSchema.parse(req.body);
                const mission = await this.updateMissionService.updateMission(id, payload);
                res.status(200).json({
                    success: true,
                    message: 'Mission mise à jour avec succès.',
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
exports.UpdateMissionController = UpdateMissionController;
//# sourceMappingURL=updateMission.controller.js.map