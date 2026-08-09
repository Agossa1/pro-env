"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureUsersRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
const permission_middleware_1 = require("../../../shared/middlewares/permission.middleware");
const configureUsersRoutes = (createUserController, getUsersController, permissionRepository) => {
    const router = (0, express_1.Router)();
    // Toutes les routes utilisateurs nécessitent d'être authentifié
    router.use(auth_middleware_1.authMiddleware);
    // Création d'un agent
    router.post('/', (0, permission_middleware_1.requirePermission)(permissionRepository, 'users', 'manage'), // Seuls les rôles ayant la permission 'manage' sur 'users'
    createUserController.execute);
    // Liste des agents
    router.get('/', (0, permission_middleware_1.requirePermission)(permissionRepository, 'users', 'read'), getUsersController.execute);
    return router;
};
exports.configureUsersRoutes = configureUsersRoutes;
//# sourceMappingURL=users.routes.js.map