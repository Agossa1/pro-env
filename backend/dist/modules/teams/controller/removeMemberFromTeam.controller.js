"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveMemberFromTeamController = void 0;
const zod_1 = require("zod");
const team_validations_1 = require("../validations/team.validations");
class RemoveMemberFromTeamController {
    constructor(removeMemberFromTeamService) {
        this.removeMemberFromTeamService = removeMemberFromTeamService;
        this.removeMemberFromTeam = async (req, res, next) => {
            try {
                const allowedRoles = ['societe', 'admin_mairie'];
                if (!req.user || !allowedRoles.includes(req.user.roleCode)) {
                    res.status(403).json({
                        success: false,
                        message: 'Action non autorisée. Seuls les entreprises (prestataires) et les DST (mairies) peuvent retirer des membres.',
                    });
                    return;
                }
                const { id } = team_validations_1.IdParamSchema.parse(req.params);
                const { memberId } = team_validations_1.MemberIdParamSchema.parse(req.params);
                await this.removeMemberFromTeamService.removeMemberFromTeam(id, memberId);
                res.status(200).json({
                    success: true,
                    message: 'Membre retiré de l\'équipe avec succès.',
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
exports.RemoveMemberFromTeamController = RemoveMemberFromTeamController;
//# sourceMappingURL=removeMemberFromTeam.controller.js.map