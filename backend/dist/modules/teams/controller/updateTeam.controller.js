"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTeamController = void 0;
const zod_1 = require("zod");
const team_validations_1 = require("../validations/team.validations");
class UpdateTeamController {
    constructor(updateTeamService) {
        this.updateTeamService = updateTeamService;
        this.updateTeam = async (req, res, next) => {
            try {
                const { id } = team_validations_1.IdParamSchema.parse(req.params);
                const payload = team_validations_1.UpdateTeamSchema.parse(req.body);
                const team = await this.updateTeamService.updateTeam(id, payload);
                res.status(200).json({
                    success: true,
                    message: 'Équipe mise à jour avec succès.',
                    data: team,
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
exports.UpdateTeamController = UpdateTeamController;
//# sourceMappingURL=updateTeam.controller.js.map