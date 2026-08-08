"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTeamController = void 0;
const zod_1 = require("zod");
const team_validations_1 = require("../validations/team.validations");
class DeleteTeamController {
    constructor(deleteTeamService) {
        this.deleteTeamService = deleteTeamService;
        this.deleteTeam = async (req, res, next) => {
            try {
                const { id } = team_validations_1.IdParamSchema.parse(req.params);
                await this.deleteTeamService.deleteTeam(id);
                res.status(200).json({
                    success: true,
                    message: 'Équipe supprimée avec succès.',
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
exports.DeleteTeamController = DeleteTeamController;
//# sourceMappingURL=deleteTeam.controller.js.map