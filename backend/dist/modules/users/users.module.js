"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initUsersModule = void 0;
const logger_1 = require("../../config/loggers/logger");
const users_repositories_1 = require("./repositories/users.repositories");
const auth_repositories_1 = require("../auth/repositories/auth.repositories");
const permission_repositories_1 = require("../permissions/repositories/permission.repositories");
const register_service_1 = require("../auth/services/register.service");
const passwordServices_1 = require("../../config/passwords/passwordServices");
const users_service_1 = require("./services/users.service");
const createUser_controller_1 = require("./controller/createUser.controller");
const getUsers_controller_1 = require("./controller/getUsers.controller");
const users_routes_1 = require("./routes/users.routes");
const initUsersModule = (db) => {
    // Dépendances de Auth pour le RegisterService
    const authRepository = new auth_repositories_1.AuthRepository(db, logger_1.logger);
    const passwordService = new passwordServices_1.PasswordService();
    const registerService = new register_service_1.RegisterService(authRepository, logger_1.logger, passwordService);
    // Repositories
    const usersRepository = new users_repositories_1.UsersRepository(db, logger_1.logger);
    // Services
    const usersService = new users_service_1.UsersService(usersRepository, registerService, logger_1.logger);
    // Controllers
    const createUserController = new createUser_controller_1.CreateUserController(usersService);
    const getUsersController = new getUsers_controller_1.GetUsersController(usersService);
    const permissionRepository = new permission_repositories_1.PermissionRepository(db, logger_1.logger);
    // Routes
    return (0, users_routes_1.configureUsersRoutes)(createUserController, getUsersController, permissionRepository);
};
exports.initUsersModule = initUsersModule;
//# sourceMappingURL=users.module.js.map