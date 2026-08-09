import { Router } from 'express';
import { RegisterController } from '../controller/register.controller';
import { LoginController } from '../controller/login.controller';
import { VerifyAccountController } from '../controller/verifyAccount.controller';
import { LogoutController } from '../controller/logout.controller';
import { RefreshTokenController } from '../controller/refreshtoken.controller';
import { ResendCodeController } from '../controller/resend-code.controller';
import { MeController } from '../controller/me.controller';
import { GetUsersController } from '../controller/getUsers.controller';
import { authMiddleware, requireRole } from '../../../shared/middlewares/auth.middleware';

export class AuthRoutes {
  public router: Router;

  constructor(
    private readonly registerController: RegisterController,
    private readonly loginController: LoginController,
    private readonly verifyAccountController: VerifyAccountController,
    private readonly logoutController: LogoutController,
    private readonly refreshTokenController: RefreshTokenController,
    private readonly resendCodeController: ResendCodeController,
    private readonly meController: MeController,
    private readonly getUsersController: GetUsersController
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
    this.router.post('/logout', this.logoutController.logout);

    // Endpoints authentifiés
    this.router.get('/me', authMiddleware, this.meController.me);

    // GET /auth/users — liste paginée des utilisateurs (réservé au super admin)
    this.router.get('/users', authMiddleware, requireRole('super_admin'), this.getUsersController.getUsers);

    // POST /auth/register-admin — création d'un utilisateur par le super admin uniquement
    this.router.post('/register-admin', authMiddleware, requireRole('super_admin'), this.registerController.registerAdmin);
  }
}
