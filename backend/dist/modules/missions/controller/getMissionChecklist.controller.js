"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMissionChecklistController = void 0;
const zod_1 = require("zod");
const mission_validations_1 = require("../validations/mission.validations");
class GetMissionChecklistController {
    constructor(getMissionChecklistService) {
        this.getMissionChecklistService = getMissionChecklistService;
        this.getMissionChecklist = async (req, res, next) => {
            try {
                const { id } = mission_validations_1.IdParamSchema.parse(req.params);
                const checklist = await this.getMissionChecklistService.getMissionChecklist(id);
                res.status(200).json({
                    success: true,
                    message: 'Checklist récupérée avec succès.',
                    data: checklist,
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
exports.GetMissionChecklistController = GetMissionChecklistController;
//# sourceMappingURL=getMissionChecklist.controller.js.map