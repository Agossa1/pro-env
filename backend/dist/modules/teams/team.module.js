"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTeamModule = void 0;
const logger_1 = require("../../config/loggers/logger");
// Repositories
const team_repositories_1 = require("./repositories/team.repositories");
const auth_repositories_1 = require("../auth/repositories/auth.repositories");
const passwordServices_1 = require("../../config/passwords/passwordServices");
// Services
const getTeams_service_1 = require("./services/getTeams.service");
const getTeamById_service_1 = require("./services/getTeamById.service");
const createTeam_service_1 = require("./services/createTeam.service");
const updateTeam_service_1 = require("./services/updateTeam.service");
const deleteTeam_service_1 = require("./services/deleteTeam.service");
const getTeamMembers_service_1 = require("./services/getTeamMembers.service");
const addMemberToTeam_service_1 = require("./services/addMemberToTeam.service");
const removeMemberFromTeam_service_1 = require("./services/removeMemberFromTeam.service");
// Controllers
const getTeams_controller_1 = require("./controller/getTeams.controller");
const getTeamById_controller_1 = require("./controller/getTeamById.controller");
const createTeam_controller_1 = require("./controller/createTeam.controller");
const updateTeam_controller_1 = require("./controller/updateTeam.controller");
const deleteTeam_controller_1 = require("./controller/deleteTeam.controller");
const getTeamMembers_controller_1 = require("./controller/getTeamMembers.controller");
const addMemberToTeam_controller_1 = require("./controller/addMemberToTeam.controller");
const removeMemberFromTeam_controller_1 = require("./controller/removeMemberFromTeam.controller");
// Routes
const team_route_1 = require("./routes/team.route");
const initTeamModule = (db) => {
    // 1. Repositories
    const teamRepository = new team_repositories_1.TeamRepository(db, logger_1.logger);
    const authRepository = new auth_repositories_1.AuthRepository(db, logger_1.logger);
    const passwordService = new passwordServices_1.PasswordService();
    // 2. Services
    const getTeamsService = new getTeams_service_1.GetTeamsService(teamRepository, logger_1.logger);
    const getTeamByIdService = new getTeamById_service_1.GetTeamByIdService(teamRepository, logger_1.logger);
    const createTeamService = new createTeam_service_1.CreateTeamService(teamRepository, logger_1.logger);
    const updateTeamService = new updateTeam_service_1.UpdateTeamService(teamRepository, logger_1.logger);
    const deleteTeamService = new deleteTeam_service_1.DeleteTeamService(teamRepository, logger_1.logger);
    const getTeamMembersService = new getTeamMembers_service_1.GetTeamMembersService(teamRepository, logger_1.logger);
    const addMemberToTeamService = new addMemberToTeam_service_1.AddMemberToTeamService(teamRepository, authRepository, passwordService, logger_1.logger);
    const removeMemberFromTeamService = new removeMemberFromTeam_service_1.RemoveMemberFromTeamService(teamRepository, logger_1.logger);
    // 3. Controllers
    const getTeamsController = new getTeams_controller_1.GetTeamsController(getTeamsService);
    const getTeamByIdController = new getTeamById_controller_1.GetTeamByIdController(getTeamByIdService);
    const createTeamController = new createTeam_controller_1.CreateTeamController(createTeamService);
    const updateTeamController = new updateTeam_controller_1.UpdateTeamController(updateTeamService);
    const deleteTeamController = new deleteTeam_controller_1.DeleteTeamController(deleteTeamService);
    const getTeamMembersController = new getTeamMembers_controller_1.GetTeamMembersController(getTeamMembersService);
    const addMemberToTeamController = new addMemberToTeam_controller_1.AddMemberToTeamController(addMemberToTeamService);
    const removeMemberFromTeamController = new removeMemberFromTeam_controller_1.RemoveMemberFromTeamController(removeMemberFromTeamService);
    // 4. Routes
    const teamRoutes = new team_route_1.TeamRoutes(getTeamsController, getTeamByIdController, createTeamController, updateTeamController, deleteTeamController, getTeamMembersController, addMemberToTeamController, removeMemberFromTeamController);
    return teamRoutes.router;
};
exports.initTeamModule = initTeamModule;
//# sourceMappingURL=team.module.js.map