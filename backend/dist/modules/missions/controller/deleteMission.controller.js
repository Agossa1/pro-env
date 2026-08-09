"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteMissionController = void 0;
const zod_1 = require("zod");
const mission_validations_1 = require("../validations/mission.validations");
class DeleteMissionController {
    constructor(deleteMissionService) {
        this.deleteMissionService = deleteMissionService;
        this.deleteMission = async (req, res, next) => {
            try {
                const { id } = mission_validations_1.IdParamSchema.parse(req.params);
                await this.deleteMissionService.deleteMission(id);
                res.status(200).json({
                    success: true,
                    message: 'Mission supprimée avec succès.',
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
exports.DeleteMissionController = DeleteMissionController;
//# sourceMappingURL=deleteMission.controller.js.map