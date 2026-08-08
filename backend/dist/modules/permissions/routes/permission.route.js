"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
class PermissionRoutes {
    constructor(getPermissionsController, getPermissionByIdController, createPermissionController, updatePermissionController, deletePermissionController, getPermissionsByRoleController, assignPermissionsToRoleController, removePermissionFromRoleController, getRolesWithPermissionsController) {
        this.getPermissionsController = getPermissionsController;
        this.getPermissionByIdController = getPermissionByIdController;
        this.createPermissionController = createPermissionController;
        this.updatePermissionController = updatePermissionController;
        this.deletePermissionController = deletePermissionController;
        this.getPermissionsByRoleController = getPermissionsByRoleController;
        this.assignPermissionsToRoleController = assignPermissionsToRoleController;
        this.removePermissionFromRoleController = removePermissionFromRoleController;
        this.getRolesWithPermissionsController = getRolesWithPermissionsController;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // ── Routes protégées par authentification ──────────────────────────────
        this.router.use(auth_middleware_1.authMiddleware);
        // ── Roles with permissions ─────────────────────────────────────────────
        // GET /api/permissions/roles — rôles avec permissions agrégées
        // (déclaré avant /:id pour éviter le conflit de route)
        this.router.get('/roles', this.getRolesWithPermissionsController.getRolesWithPermissions);
        // GET /api/permissions/roles/:roleId — permissions d'un rôle
        this.router.get('/roles/:roleId', this.getPermissionsByRoleController.getPermissionsByRole);
        // POST /api/permissions/roles/:roleId — assigner des permissions à un rôle
        this.router.post('/roles/:roleId', this.assignPermissionsToRoleController.assignPermissionsToRole);
        // DELETE /api/permissions/roles/:roleId/:permissionId — retirer une permission d'un rôle
        this.router.delete('/roles/:roleId/:permissionId', this.removePermissionFromRoleController.removePermissionFromRole);
        // ── Permissions CRUD ───────────────────────────────────────────────────
        // GET /api/permissions
        this.router.get('/', this.getPermissionsController.getPermissions);
        // GET /api/permissions/:id
        this.router.get('/:id', this.getPermissionByIdController.getPermissionById);
        // POST /api/permissions
        this.router.post('/', this.createPermissionController.createPermission);
        // PUT /api/permissions/:id
        this.router.put('/:id', this.updatePermissionController.updatePermission);
        // DELETE /api/permissions/:id
        this.router.delete('/:id', this.deletePermissionController.deletePermission);
    }
}
exports.PermissionRoutes = PermissionRoutes;
//# sourceMappingURL=permission.route.js.map