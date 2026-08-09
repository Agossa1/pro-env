"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTeamController = void 0;
const zod_1 = require("zod");
const team_validations_1 = require("../validations/team.validations");
class CreateTeamController {
    constructor(createTeamService) {
        this.createTeamService = createTeamService;
        this.createTeam = async (req, res, next) => {
            try {
                const payload = team_validations_1.CreateTeamSchema.parse(req.body);
                const team = await this.createTeamService.createTeam(payload);
                res.status(201).json({
                    success: true,
                    message: 'Équipe créée avec succès.',
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
exports.CreateTeamController = CreateTeamController;
//# sourceMappingURL=createTeam.controller.js.map