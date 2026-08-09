"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
class RoleRoutes {
    constructor(getRolesController, getRoleByIdController, getRoleByCodeController, createRoleController, updateRoleController, deleteRoleController) {
        this.getRolesController = getRolesController;
        this.getRoleByIdController = getRoleByIdController;
        this.getRoleByCodeController = getRoleByCodeController;
        this.createRoleController = createRoleController;
        this.updateRoleController = updateRoleController;
        this.deleteRoleController = deleteRoleController;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // ── Routes protégées par authentification ──────────────────────────────
        this.router.use(auth_middleware_1.authMiddleware);
        // GET /api/roles — liste paginée
        this.router.get('/', this.getRolesController.getRoles);
        // GET /api/roles/code/:code — rôle par code
        // (déclaré avant /:id pour éviter le conflit de route)
        this.router.get('/code/:code', this.getRoleByCodeController.getRoleByCode);
        // GET /api/roles/:id — rôle par ID
        this.router.get('/:id', this.getRoleByIdController.getRoleById);
        // POST /api/roles — création
        this.router.post('/', this.createRoleController.createRole);
        // PUT /api/roles/:id — mise à jour
        this.router.put('/:id', this.updateRoleController.updateRole);
        // DELETE /api/roles/:id — suppression
        this.router.delete('/:id', this.deleteRoleController.deleteRole);
    }
}
exports.RoleRoutes = RoleRoutes;
//# sourceMappingURL=role.route.js.map