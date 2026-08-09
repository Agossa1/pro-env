"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRoleModule = void 0;
const logger_1 = require("../../config/loggers/logger");
// Repositories
const role_repositories_1 = require("./repositories/role.repositories");
// Services
const getRoles_service_1 = require("./services/getRoles.service");
const getRoleById_service_1 = require("./services/getRoleById.service");
const getRoleByCode_service_1 = require("./services/getRoleByCode.service");
const createRole_service_1 = require("./services/createRole.service");
const updateRole_service_1 = require("./services/updateRole.service");
const deleteRole_service_1 = require("./services/deleteRole.service");
// Controllers
const getRoles_controller_1 = require("./controller/getRoles.controller");
const getRoleById_controller_1 = require("./controller/getRoleById.controller");
const getRoleByCode_controller_1 = require("./controller/getRoleByCode.controller");
const createRole_controller_1 = require("./controller/createRole.controller");
const updateRole_controller_1 = require("./controller/updateRole.controller");
const deleteRole_controller_1 = require("./controller/deleteRole.controller");
// Routes
const role_route_1 = require("./routes/role.route");
const initRoleModule = (db) => {
    // 1. Initialiser le Repository
    const roleRepository = new role_repositories_1.RoleRepository(db, logger_1.logger);
    // 2. Initialiser les Services Métiers
    const getRolesService = new getRoles_service_1.GetRolesService(roleRepository, logger_1.logger);
    const getRoleByIdService = new getRoleById_service_1.GetRoleByIdService(roleRepository, logger_1.logger);
    const getRoleByCodeService = new getRoleByCode_service_1.GetRoleByCodeService(roleRepository, logger_1.logger);
    const createRoleService = new createRole_service_1.CreateRoleService(roleRepository, logger_1.logger);
    const updateRoleService = new updateRole_service_1.UpdateRoleService(roleRepository, logger_1.logger);
    const deleteRoleService = new deleteRole_service_1.DeleteRoleService(roleRepository, logger_1.logger);
    // 3. Initialiser les Contrôleurs
    const getRolesController = new getRoles_controller_1.GetRolesController(getRolesService);
    const getRoleByIdController = new getRoleById_controller_1.GetRoleByIdController(getRoleByIdService);
    const getRoleByCodeController = new getRoleByCode_controller_1.GetRoleByCodeController(getRoleByCodeService);
    const createRoleController = new createRole_controller_1.CreateRoleController(createRoleService);
    const updateRoleController = new updateRole_controller_1.UpdateRoleController(updateRoleService);
    const deleteRoleController = new deleteRole_controller_1.DeleteRoleController(deleteRoleService);
    // 4. Lier les Contrôleurs aux Routes
    const roleRoutes = new role_route_1.RoleRoutes(getRolesController, getRoleByIdController, getRoleByCodeController, createRoleController, updateRoleController, deleteRoleController);
    return roleRoutes.router;
};
exports.initRoleModule = initRoleModule;
//# sourceMappingURL=role.module.js.map