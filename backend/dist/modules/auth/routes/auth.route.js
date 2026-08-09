"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
class AuthRoutes {
    constructor(registerController, loginController, verifyAccountController, logoutController, refreshTokenController, resendCodeController, meController, getUsersController) {
        this.registerController = registerController;
        this.loginController = loginController;
        this.verifyAccountController = verifyAccountController;
        this.logoutController = logoutController;
        this.refreshTokenController = refreshTokenController;
        this.resendCodeController = resendCodeController;
        this.meController = meController;
        this.getUsersController = getUsersController;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Endpoints publics
        this.router.post('/register', this.registerController.register);
        this.router.post('/login', this.loginController.login);
        this.router.post('/verify', this.verifyAccountController.verify);
        this.router.post('/resend-code', this.resendCodeController.resend);
        this.router.post('/refresh', this.refreshTokenController.refresh);
        this.router.post('/logout', this.logoutController.logout);
        // Endpoints authentifiés
        this.router.get('/me', auth_middleware_1.authMiddleware, this.meController.me);
        // GET /auth/users — liste paginée des utilisateurs (réservé au super admin)
        this.router.get('/users', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('super_admin'), this.getUsersController.getUsers);
        // POST /auth/register-admin — création d'un utilisateur par le super admin uniquement
        this.router.post('/register-admin', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('super_admin'), this.registerController.registerAdmin);
    }
}
exports.AuthRoutes = AuthRoutes;
//# sourceMappingURL=auth.route.js.map