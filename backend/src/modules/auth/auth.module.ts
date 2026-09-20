import { Router } from 'express';
import PostgresDatabase from '../../config/database/postgres';
import { logger } from '../../config/loggers/logger';

// Utils / Configs
import { passwordServiceInstance } from '../../config/passwords/passwordServices';
import { TokenManager } from '../../config/tokens/tokenManager';

// Repositories
import { AuthRepository } from './repositories/auth.repositories';

// Services
import { RegisterService } from './services/register.service';
import { LoginService } from './services/login.service';
import { VerifyAccountService } from './services/verifyAccount.service';
import { LogoutService } from './services/logout.service';
import { RefreshTokenService } from './services/refreshtoken.service';
import { ResendCodeService } from './services/resend-code.service';
import { GetUsersService } from './services/getUsers.service';
import { ToggleUserActiveService } from './services/toggleUserActive.service';
import { UpdateUserService } from './services/updateUser.service';
import { DeleteUserService } from './services/deleteUser.service';
import { ForgotPasswordService } from './services/forgot-password.service';
import { ResetPasswordService } from './services/reset-password.service';

// Controllers
import { RegisterController } from './controller/register.controller';
import { LoginController } from './controller/login.controller';
import { VerifyAccountController } from './controller/verifyAccount.controller';
import { LogoutController } from './controller/logout.controller';
import { RefreshTokenController } from './controller/refreshtoken.controller';
import { ResendCodeController } from './controller/resend-code.controller';
import { MeController } from './controller/me.controller';
import { GetUsersController } from './controller/getUsers.controller';
import { ToggleUserActiveController } from './controller/toggleUserActive.controller';
import { UpdateUserController } from './controller/updateUser.controller';
import { DeleteUserController } from './controller/deleteUser.controller';
import { ForgotPasswordController } from './controller/forgot-password.controller';
import { ResetPasswordController } from './controller/reset-password.controller';

// Routes
import { AuthRoutes } from './routes/auth.route';

export const initAuthModule = (db: PostgresDatabase): Router => {
  // 1. Initialiser le Token Manager
  const tokenManager = new TokenManager();

  // 2. Initialiser le Repository
  const authRepository = new AuthRepository(db, logger);

  // 3. Initialiser les Services Métiers
  const registerService = new RegisterService(authRepository, logger, passwordServiceInstance);
  const verifyAccountService = new VerifyAccountService(authRepository, logger, passwordServiceInstance);
  const loginService = new LoginService(authRepository, logger, passwordServiceInstance, tokenManager);
  const logoutService = new LogoutService(authRepository, logger);
  const refreshTokenService = new RefreshTokenService(authRepository, logger, tokenManager);
  const resendCodeService = new ResendCodeService(authRepository, logger, passwordServiceInstance);
  const getUsersService = new GetUsersService(authRepository, logger);
  const toggleUserActiveService = new ToggleUserActiveService(authRepository);
  const updateUserService = new UpdateUserService(authRepository, logger);
  const deleteUserService = new DeleteUserService(authRepository, logger);
  const forgotPasswordService = new ForgotPasswordService(authRepository, logger, passwordServiceInstance);
  const resetPasswordService = new ResetPasswordService(authRepository, logger, passwordServiceInstance);

  // 4. Initialiser les Contrôleurs
  const registerController = new RegisterController(registerService);
  const verifyAccountController = new VerifyAccountController(verifyAccountService);
  const loginController = new LoginController(loginService);
  const logoutController = new LogoutController(logoutService);
  const refreshTokenController = new RefreshTokenController(refreshTokenService);
  const resendCodeController = new ResendCodeController(resendCodeService);
  const meController = new MeController(authRepository);
  const getUsersController = new GetUsersController(getUsersService);
  const toggleUserActiveController = new ToggleUserActiveController(toggleUserActiveService);
  const updateUserController = new UpdateUserController(updateUserService);
  const deleteUserController = new DeleteUserController(deleteUserService);
  const forgotPasswordController = new ForgotPasswordController(forgotPasswordService);
  const resetPasswordController = new ResetPasswordController(resetPasswordService);

  // 5. Lier les Contrôleurs aux Routes
  const authRoutes = new AuthRoutes(
    registerController,
    loginController,
    verifyAccountController,
    logoutController,
    refreshTokenController,
    resendCodeController,
    meController,
    getUsersController,
    toggleUserActiveController,
    updateUserController,
    deleteUserController,
    forgotPasswordController,
    resetPasswordController
  );

  return authRoutes.router;
};
