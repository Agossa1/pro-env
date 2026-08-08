"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
class AuthRoutes {
    constructor(registerController, loginController, verifyAccountController, logoutController, refreshTokenController, resendCodeController) {
        this.registerController = registerController;
        this.loginController = loginController;
        this.verifyAccountController = verifyAccountController;
        this.logoutController = logoutController;
        this.refreshTokenController = refreshTokenController;
        this.resendCodeController = resendCodeController;
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
        // Endpoints nécessitant théoriquement d'être authentifié, 
        // mais le logout se base sur le refresh token
        this.router.post('/logout', this.logoutController.logout);
    }
}
exports.AuthRoutes = AuthRoutes;
//# sourceMappingURL=auth.route.js.map