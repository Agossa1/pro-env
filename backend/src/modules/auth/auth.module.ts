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

// Controllers
import { RegisterController } from './controller/register.controller';
import { LoginController } from './controller/login.controller';
import { VerifyAccountController } from './controller/verifyAccount.controller';
import { LogoutController } from './controller/logout.controller';
import { RefreshTokenController } from './controller/refreshtoken.controller';
import { ResendCodeController } from './controller/resend-code.controller';

// Routes
import { AuthRoutes } from './routes/auth.route';

export const initAuthModule = (db: PostgresDatabase): Router => {
  // 1. Initialiser le Token Manager
  const tokenManager = new TokenManager();

  // 2. Initialiser le Repository
  const authRepository = new AuthRepository(db, logger);

  // 3. Initialiser les Services Métiers
  const registerService = new RegisterService(authRepository, logger, passwordServiceInstance);
  const verifyAccountService = new VerifyAccountService(authRepository, logger);
  const loginService = new LoginService(authRepository, logger, passwordServiceInstance, tokenManager);
  const logoutService = new LogoutService(authRepository, logger);
  const refreshTokenService = new RefreshTokenService(authRepository, logger, tokenManager);
  const resendCodeService = new ResendCodeService(authRepository, logger, passwordServiceInstance);

  // 4. Initialiser les Contrôleurs
  const registerController = new RegisterController(registerService);
  const verifyAccountController = new VerifyAccountController(verifyAccountService);
  const loginController = new LoginController(loginService);
  const logoutController = new LogoutController(logoutService);
  const refreshTokenController = new RefreshTokenController(refreshTokenService);
  const resendCodeController = new ResendCodeController(resendCodeService);

  // 5. Lier les Contrôleurs aux Routes
  const authRoutes = new AuthRoutes(
    registerController,
    loginController,
    verifyAccountController,
    logoutController,
    refreshTokenController,
    resendCodeController
  );

  return authRoutes.router;
};
