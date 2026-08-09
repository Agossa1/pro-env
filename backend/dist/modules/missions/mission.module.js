"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMissionModule = void 0;
const logger_1 = require("../../config/loggers/logger");
// Repositories
const mission_repositories_1 = require("./repositories/mission.repositories");
// Services
const getMissions_service_1 = require("./services/getMissions.service");
const getMissionById_service_1 = require("./services/getMissionById.service");
const createMission_service_1 = require("./services/createMission.service");
const updateMission_service_1 = require("./services/updateMission.service");
const deleteMission_service_1 = require("./services/deleteMission.service");
const getMissionChecklist_service_1 = require("./services/getMissionChecklist.service");
const addChecklistItem_service_1 = require("./services/addChecklistItem.service");
const assignUserToMission_service_1 = require("./services/assignUserToMission.service");
const getMissionStatusHistory_service_1 = require("./services/getMissionStatusHistory.service");
// Controllers
const getMissions_controller_1 = require("./controller/getMissions.controller");
const getMissionById_controller_1 = require("./controller/getMissionById.controller");
const createMission_controller_1 = require("./controller/createMission.controller");
const updateMission_controller_1 = require("./controller/updateMission.controller");
const deleteMission_controller_1 = require("./controller/deleteMission.controller");
const getMissionChecklist_controller_1 = require("./controller/getMissionChecklist.controller");
const addChecklistItem_controller_1 = require("./controller/addChecklistItem.controller");
const assignUserToMission_controller_1 = require("./controller/assignUserToMission.controller");
const getMissionStatusHistory_controller_1 = require("./controller/getMissionStatusHistory.controller");
// Routes
const mission_route_1 = require("./routes/mission.route");
const initMissionModule = (db) => {
    // 1. Initialiser le Repository
    const missionRepository = new mission_repositories_1.MissionRepository(db, logger_1.logger);
    // 2. Initialiser les Services Métiers
    const getMissionsService = new getMissions_service_1.GetMissionsService(missionRepository, logger_1.logger);
    const getMissionByIdService = new getMissionById_service_1.GetMissionByIdService(missionRepository, logger_1.logger);
    const createMissionService = new createMission_service_1.CreateMissionService(missionRepository, logger_1.logger);
    const updateMissionService = new updateMission_service_1.UpdateMissionService(missionRepository, logger_1.logger);
    const deleteMissionService = new deleteMission_service_1.DeleteMissionService(missionRepository, logger_1.logger);
    const getMissionChecklistService = new getMissionChecklist_service_1.GetMissionChecklistService(missionRepository, logger_1.logger);
    const addChecklistItemService = new addChecklistItem_service_1.AddChecklistItemService(missionRepository, logger_1.logger);
    const assignUserToMissionService = new assignUserToMission_service_1.AssignUserToMissionService(missionRepository, logger_1.logger);
    const getMissionStatusHistoryService = new getMissionStatusHistory_service_1.GetMissionStatusHistoryService(missionRepository, logger_1.logger);
    // 3. Initialiser les Contrôleurs
    const getMissionsController = new getMissions_controller_1.GetMissionsController(getMissionsService);
    const getMissionByIdController = new getMissionById_controller_1.GetMissionByIdController(getMissionByIdService);
    const createMissionController = new createMission_controller_1.CreateMissionController(createMissionService);
    const updateMissionController = new updateMission_controller_1.UpdateMissionController(updateMissionService);
    const deleteMissionController = new deleteMission_controller_1.DeleteMissionController(deleteMissionService);
    const getMissionChecklistController = new getMissionChecklist_controller_1.GetMissionChecklistController(getMissionChecklistService);
    const addChecklistItemController = new addChecklistItem_controller_1.AddChecklistItemController(addChecklistItemService);
    const assignUserToMissionController = new assignUserToMission_controller_1.AssignUserToMissionController(assignUserToMissionService);
    const getMissionStatusHistoryController = new getMissionStatusHistory_controller_1.GetMissionStatusHistoryController(getMissionStatusHistoryService);
    // 4. Lier les Contrôleurs aux Routes
    const missionRoutes = new mission_route_1.MissionRoutes(getMissionsController, getMissionByIdController, createMissionController, updateMissionController, deleteMissionController, getMissionChecklistController, addChecklistItemController, assignUserToMissionController, getMissionStatusHistoryController);
    return missionRoutes.router;
};
exports.initMissionModule = initMissionModule;
//# sourceMappingURL=mission.module.js.map