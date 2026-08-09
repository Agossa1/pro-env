"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTeamMembersController = void 0;
const zod_1 = require("zod");
const team_validations_1 = require("../validations/team.validations");
class GetTeamMembersController {
    constructor(getTeamMembersService) {
        this.getTeamMembersService = getTeamMembersService;
        this.getTeamMembers = async (req, res, next) => {
            try {
                const { id } = team_validations_1.IdParamSchema.parse(req.params);
                const members = await this.getTeamMembersService.getTeamMembers(id);
                res.status(200).json({
                    success: true,
                    message: 'Membres de l\'équipe récupérés avec succès.',
                    data: members,
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
exports.GetTeamMembersController = GetTeamMembersController;
//# sourceMappingURL=getTeamMembers.controller.js.map