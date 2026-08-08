"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTeamByIdController = void 0;
const zod_1 = require("zod");
const team_validations_1 = require("../validations/team.validations");
class GetTeamByIdController {
    constructor(getTeamByIdService) {
        this.getTeamByIdService = getTeamByIdService;
        this.getTeamById = async (req, res, next) => {
            try {
                const { id } = team_validations_1.IdParamSchema.parse(req.params);
                const team = await this.getTeamByIdService.getTeamById(id);
                res.status(200).json({
                    success: true,
                    message: 'Équipe récupérée avec succès.',
                    data: team,
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
exports.GetTeamByIdController = GetTeamByIdController;
//# sourceMappingURL=getTeamById.controller.js.map