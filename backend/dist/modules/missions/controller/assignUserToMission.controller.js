"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignUserToMissionController = void 0;
const zod_1 = require("zod");
const mission_validations_1 = require("../validations/mission.validations");
class AssignUserToMissionController {
    constructor(assignUserToMissionService) {
        this.assignUserToMissionService = assignUserToMissionService;
        this.assignUserToMission = async (req, res, next) => {
            try {
                const { id } = mission_validations_1.IdParamSchema.parse(req.params);
                const { userId } = mission_validations_1.AssignUserSchema.parse(req.body);
                const context = {
                    assignedBy: req.user?.userId ?? undefined,
                };
                const assignment = await this.assignUserToMissionService.assignUserToMission(id, userId, context);
                res.status(200).json({
                    success: true,
                    message: 'Utilisateur assigné à la mission avec succès.',
                    data: assignment,
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
exports.AssignUserToMissionController = AssignUserToMissionController;
//# sourceMappingURL=assignUserToMission.controller.js.map