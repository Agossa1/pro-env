"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMemberToTeamController = void 0;
const zod_1 = require("zod");
const team_validations_1 = require("../validations/team.validations");
class AddMemberToTeamController {
    constructor(addMemberToTeamService) {
        this.addMemberToTeamService = addMemberToTeamService;
        this.addMemberToTeam = async (req, res, next) => {
            try {
                const { id } = team_validations_1.IdParamSchema.parse(req.params);
                const { fullName, email, phone, role, organizationId } = team_validations_1.AddMemberSchema.parse(req.body);
                const member = await this.addMemberToTeamService.addMemberToTeam(id, {
                    fullName,
                    email,
                    phone: phone || undefined,
                    role: role || undefined,
                    organizationId: organizationId || null,
                });
                res.status(201).json({
                    success: true,
                    message: 'Membre ajouté à l\'équipe avec succès.',
                    data: member,
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
exports.AddMemberToTeamController = AddMemberToTeamController;
//# sourceMappingURL=addMemberToTeam.controller.js.map