"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initPermissionModule = void 0;
const logger_1 = require("../../config/loggers/logger");
// Repositories
const permission_repositories_1 = require("./repositories/permission.repositories");
// Services
const getPermissions_service_1 = require("./services/getPermissions.service");
const getPermissionById_service_1 = require("./services/getPermissionById.service");
const createPermission_service_1 = require("./services/createPermission.service");
const updatePermission_service_1 = require("./services/updatePermission.service");
const deletePermission_service_1 = require("./services/deletePermission.service");
const getPermissionsByRole_service_1 = require("./services/getPermissionsByRole.service");
const assignPermissionsToRole_service_1 = require("./services/assignPermissionsToRole.service");
const removePermissionFromRole_service_1 = require("./services/removePermissionFromRole.service");
const getRolesWithPermissions_service_1 = require("./services/getRolesWithPermissions.service");
// Controllers
const getPermissions_controller_1 = require("./controller/getPermissions.controller");
const getPermissionById_controller_1 = require("./controller/getPermissionById.controller");
const createPermission_controller_1 = require("./controller/createPermission.controller");
const updatePermission_controller_1 = require("./controller/updatePermission.controller");
const deletePermission_controller_1 = require("./controller/deletePermission.controller");
const getPermissionsByRole_controller_1 = require("./controller/getPermissionsByRole.controller");
const assignPermissionsToRole_controller_1 = require("./controller/assignPermissionsToRole.controller");
const removePermissionFromRole_controller_1 = require("./controller/removePermissionFromRole.controller");
const getRolesWithPermissions_controller_1 = require("./controller/getRolesWithPermissions.controller");
// Routes
const permission_route_1 = require("./routes/permission.route");
const initPermissionModule = (db) => {
    // 1. Initialiser le Repository
    const permissionRepository = new permission_repositories_1.PermissionRepository(db, logger_1.logger);
    // 2. Initialiser les Services Métiers
    const getPermissionsService = new getPermissions_service_1.GetPermissionsService(permissionRepository, logger_1.logger);
    const getPermissionByIdService = new getPermissionById_service_1.GetPermissionByIdService(permissionRepository, logger_1.logger);
    const createPermissionService = new createPermission_service_1.CreatePermissionService(permissionRepository, logger_1.logger);
    const updatePermissionService = new updatePermission_service_1.UpdatePermissionService(permissionRepository, logger_1.logger);
    const deletePermissionService = new deletePermission_service_1.DeletePermissionService(permissionRepository, logger_1.logger);
    const getPermissionsByRoleService = new getPermissionsByRole_service_1.GetPermissionsByRoleService(permissionRepository, logger_1.logger);
    const assignPermissionsToRoleService = new assignPermissionsToRole_service_1.AssignPermissionsToRoleService(permissionRepository, logger_1.logger);
    const removePermissionFromRoleService = new removePermissionFromRole_service_1.RemovePermissionFromRoleService(permissionRepository, logger_1.logger);
    const getRolesWithPermissionsService = new getRolesWithPermissions_service_1.GetRolesWithPermissionsService(permissionRepository, logger_1.logger);
    // 3. Initialiser les Contrôleurs
    const getPermissionsController = new getPermissions_controller_1.GetPermissionsController(getPermissionsService);
    const getPermissionByIdController = new getPermissionById_controller_1.GetPermissionByIdController(getPermissionByIdService);
    const createPermissionController = new createPermission_controller_1.CreatePermissionController(createPermissionService);
    const updatePermissionController = new updatePermission_controller_1.UpdatePermissionController(updatePermissionService);
    const deletePermissionController = new deletePermission_controller_1.DeletePermissionController(deletePermissionService);
    const getPermissionsByRoleController = new getPermissionsByRole_controller_1.GetPermissionsByRoleController(getPermissionsByRoleService);
    const assignPermissionsToRoleController = new assignPermissionsToRole_controller_1.AssignPermissionsToRoleController(assignPermissionsToRoleService);
    const removePermissionFromRoleController = new removePermissionFromRole_controller_1.RemovePermissionFromRoleController(removePermissionFromRoleService);
    const getRolesWithPermissionsController = new getRolesWithPermissions_controller_1.GetRolesWithPermissionsController(getRolesWithPermissionsService);
    // 4. Lier les Contrôleurs aux Routes
    const permissionRoutes = new permission_route_1.PermissionRoutes(getPermissionsController, getPermissionByIdController, createPermissionController, updatePermissionController, deletePermissionController, getPermissionsByRoleController, assignPermissionsToRoleController, removePermissionFromRoleController, getRolesWithPermissionsController);
    return permissionRoutes.router;
};
exports.initPermissionModule = initPermissionModule;
//# sourceMappingURL=permission.module.js.map