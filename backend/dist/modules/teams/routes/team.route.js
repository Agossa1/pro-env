"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
class TeamRoutes {
    constructor(getTeamsController, getTeamByIdController, createTeamController, updateTeamController, deleteTeamController, getTeamMembersController, addMemberToTeamController, removeMemberFromTeamController) {
        this.getTeamsController = getTeamsController;
        this.getTeamByIdController = getTeamByIdController;
        this.createTeamController = createTeamController;
        this.updateTeamController = updateTeamController;
        this.deleteTeamController = deleteTeamController;
        this.getTeamMembersController = getTeamMembersController;
        this.addMemberToTeamController = addMemberToTeamController;
        this.removeMemberFromTeamController = removeMemberFromTeamController;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.use(auth_middleware_1.authMiddleware);
        // GET /api/teams — liste paginée (?teamType=&organizationId=)
        this.router.get('/', this.getTeamsController.getTeams);
        // GET /api/teams/:id/members — membres
        this.router.get('/:id/members', this.getTeamMembersController.getTeamMembers);
        // POST /api/teams/:id/members — ajouter un membre
        this.router.post('/:id/members', this.addMemberToTeamController.addMemberToTeam);
        // DELETE /api/teams/:id/members/:memberId — retirer un membre
        this.router.delete('/:id/members/:memberId', this.removeMemberFromTeamController.removeMemberFromTeam);
        // GET /api/teams/:id — détail
        this.router.get('/:id', this.getTeamByIdController.getTeamById);
        // POST /api/teams — création
        this.router.post('/', this.createTeamController.createTeam);
        // PUT /api/teams/:id — mise à jour
        this.router.put('/:id', this.updateTeamController.updateTeam);
        // DELETE /api/teams/:id — suppression logique
        this.router.delete('/:id', this.deleteTeamController.deleteTeam);
    }
}
exports.TeamRoutes = TeamRoutes;
//# sourceMappingURL=team.route.js.map