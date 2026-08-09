"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMissionByIdController = void 0;
const zod_1 = require("zod");
const mission_validations_1 = require("../validations/mission.validations");
class GetMissionByIdController {
    constructor(getMissionByIdService) {
        this.getMissionByIdService = getMissionByIdService;
        this.getMissionById = async (req, res, next) => {
            try {
                const { id } = mission_validations_1.IdParamSchema.parse(req.params);
                const mission = await this.getMissionByIdService.getMissionById(id);
                res.status(200).json({
                    success: true,
                    message: 'Mission récupérée avec succès.',
                    data: mission,
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
exports.GetMissionByIdController = GetMissionByIdController;
//# sourceMappingURL=getMissionById.controller.js.map