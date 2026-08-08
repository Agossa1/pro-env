"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAuthModule = void 0;
const logger_1 = require("@/config/loggers/logger");
// Utils / Configs
const passwordServices_1 = require("@/config/passwords/passwordServices");
const tokenManager_1 = require("@/config/tokens/tokenManager");
// Repositories
const auth_repositories_1 = require("./repositories/auth.repositories");
// Services
const register_service_1 = require("./services/register.service");
const login_service_1 = require("./services/login.service");
const verifyAccount_service_1 = require("./services/verifyAccount.service");
const logout_service_1 = require("./services/logout.service");
const refreshtoken_service_1 = require("./services/refreshtoken.service");
const resend_code_service_1 = require("./services/resend-code.service");
// Controllers
const register_controller_1 = require("./controller/register.controller");
const login_controller_1 = require("./controller/login.controller");
const verifyAccount_controller_1 = require("./controller/verifyAccount.controller");
const logout_controller_1 = require("./controller/logout.controller");
const refreshtoken_controller_1 = require("./controller/refreshtoken.controller");
const resend_code_controller_1 = require("./controller/resend-code.controller");
// Routes
const auth_route_1 = require("./routes/auth.route");
const initAuthModule = (db) => {
    // 1. Initialiser le Token Manager
    const tokenManager = new tokenManager_1.TokenManager();
    // 2. Initialiser le Repository
    const authRepository = new auth_repositories_1.AuthRepository(db, logger_1.logger);
    // 3. Initialiser les Services Métiers
    const registerService = new register_service_1.RegisterService(authRepository, logger_1.logger, passwordServices_1.passwordServiceInstance);
    const verifyAccountService = new verifyAccount_service_1.VerifyAccountService(authRepository, logger_1.logger);
    const loginService = new login_service_1.LoginService(authRepository, logger_1.logger, passwordServices_1.passwordServiceInstance, tokenManager);
    const logoutService = new logout_service_1.LogoutService(authRepository, logger_1.logger);
    const refreshTokenService = new refreshtoken_service_1.RefreshTokenService(authRepository, logger_1.logger, tokenManager);
    const resendCodeService = new resend_code_service_1.ResendCodeService(authRepository, logger_1.logger, passwordServices_1.passwordServiceInstance);
    // 4. Initialiser les Contrôleurs
    const registerController = new register_controller_1.RegisterController(registerService);
    const verifyAccountController = new verifyAccount_controller_1.VerifyAccountController(verifyAccountService);
    const loginController = new login_controller_1.LoginController(loginService);
    const logoutController = new logout_controller_1.LogoutController(logoutService);
    const refreshTokenController = new refreshtoken_controller_1.RefreshTokenController(refreshTokenService);
    const resendCodeController = new resend_code_controller_1.ResendCodeController(resendCodeService);
    // 5. Lier les Contrôleurs aux Routes
    const authRoutes = new auth_route_1.AuthRoutes(registerController, loginController, verifyAccountController, logoutController, refreshTokenController, resendCodeController);
    return authRoutes.router;
};
exports.initAuthModule = initAuthModule;
//# sourceMappingURL=auth.module.js.map