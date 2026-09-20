"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
class AuthRoutes {
    constructor(registerController, loginController, verifyAccountController, logoutController, refreshTokenController, resendCodeController, meController, getUsersController, toggleUserActiveController, updateUserController, deleteUserController, forgotPasswordController, resetPasswordController) {
        this.registerController = registerController;
        this.loginController = loginController;
        this.verifyAccountController = verifyAccountController;
        this.logoutController = logoutController;
        this.refreshTokenController = refreshTokenController;
        this.resendCodeController = resendCodeController;
        this.meController = meController;
        this.getUsersController = getUsersController;
        this.toggleUserActiveController = toggleUserActiveController;
        this.updateUserController = updateUserController;
        this.deleteUserController = deleteUserController;
        this.forgotPasswordController = forgotPasswordController;
        this.resetPasswordController = resetPasswordController;
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
        this.router.post('/forgot-password', this.forgotPasswordController.forgotPassword.bind(this.forgotPasswordController));
        this.router.post('/reset-password', this.resetPasswordController.resetPassword.bind(this.resetPasswordController));
        // Endpoints authentifiés
        this.router.get('/me', auth_middleware_1.authMiddleware, this.meController.me);
        // GET /auth/users — liste paginée des utilisateurs (réservé au super admin)
        this.router.get('/users', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('super_admin'), this.getUsersController.getUsers);
        // POST /auth/register-admin — création d'un utilisateur par le super admin uniquement
        this.router.post('/register-admin', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('super_admin'), this.registerController.registerAdmin);
        // PATCH /auth/users/:id/toggle-active — active/désactive un utilisateur
        this.router.patch('/users/:id/toggle-active', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('super_admin'), this.toggleUserActiveController.toggle);
        // PUT /auth/users/:id — mise à jour d'un utilisateur
        this.router.put('/users/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('super_admin'), this.updateUserController.update);
        // DELETE /auth/users/:id — suppression définitive d'un utilisateur
        this.router.delete('/users/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.requireRole)('super_admin'), this.deleteUserController.delete);
    }
}
exports.AuthRoutes = AuthRoutes;
//# sourceMappingURL=auth.route.js.map