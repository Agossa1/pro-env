"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMissionStatusHistoryController = void 0;
const zod_1 = require("zod");
const mission_validations_1 = require("../validations/mission.validations");
class GetMissionStatusHistoryController {
    constructor(getMissionStatusHistoryService) {
        this.getMissionStatusHistoryService = getMissionStatusHistoryService;
        this.getMissionStatusHistory = async (req, res, next) => {
            try {
                const { id } = mission_validations_1.IdParamSchema.parse(req.params);
                const history = await this.getMissionStatusHistoryService.getMissionStatusHistory(id);
                res.status(200).json({
                    success: true,
                    message: 'Historique des statuts récupéré avec succès.',
                    data: history,
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
exports.GetMissionStatusHistoryController = GetMissionStatusHistoryController;
//# sourceMappingURL=getMissionStatusHistory.controller.js.map