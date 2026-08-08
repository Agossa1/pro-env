import { Router } from 'express';
import { RegisterController } from '../controller/register.controller';
import { LoginController } from '../controller/login.controller';
import { VerifyAccountController } from '../controller/verifyAccount.controller';
import { LogoutController } from '../controller/logout.controller';
import { RefreshTokenController } from '../controller/refreshtoken.controller';
import { ResendCodeController } from '../controller/resend-code.controller';

export class AuthRoutes {
  public router: Router;

  constructor(
    private readonly registerController: RegisterController,
    private readonly loginController: LoginController,
    private readonly verifyAccountController: VerifyAccountController,
    private readonly logoutController: LogoutController,
    private readonly refreshTokenController: RefreshTokenController,
    private readonly resendCodeController: ResendCodeController
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
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
