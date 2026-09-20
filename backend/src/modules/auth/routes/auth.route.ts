import { Router } from 'express';
import { RegisterController } from '../controller/register.controller';
import { LoginController } from '../controller/login.controller';
import { VerifyAccountController } from '../controller/verifyAccount.controller';
import { LogoutController } from '../controller/logout.controller';
import { RefreshTokenController } from '../controller/refreshtoken.controller';
import { ResendCodeController } from '../controller/resend-code.controller';
import { MeController } from '../controller/me.controller';
import { GetUsersController } from '../controller/getUsers.controller';
import { ToggleUserActiveController } from '../controller/toggleUserActive.controller';
import { UpdateUserController } from '../controller/updateUser.controller';
import { DeleteUserController } from '../controller/deleteUser.controller';
import { ForgotPasswordController } from '../controller/forgot-password.controller';
import { ResetPasswordController } from '../controller/reset-password.controller';
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
    private readonly getUsersController: GetUsersController,
    private readonly toggleUserActiveController: ToggleUserActiveController,
    private readonly updateUserController: UpdateUserController,
    private readonly deleteUserController: DeleteUserController,
    private readonly forgotPasswordController: ForgotPasswordController,
    private readonly resetPasswordController: ResetPasswordController
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
    this.router.post('/forgot-password', this.forgotPasswordController.forgotPassword.bind(this.forgotPasswordController));
    this.router.post('/reset-password', this.resetPasswordController.resetPassword.bind(this.resetPasswordController));

    // Endpoints authentifiés
    this.router.get('/me', authMiddleware, this.meController.me);

    // GET /auth/users — liste paginée des utilisateurs (réservé au super admin)
    this.router.get('/users', authMiddleware, requireRole('super_admin'), this.getUsersController.getUsers);

    // POST /auth/register-admin — création d'un utilisateur par le super admin uniquement
    this.router.post('/register-admin', authMiddleware, requireRole('super_admin'), this.registerController.registerAdmin);

    // PATCH /auth/users/:id/toggle-active — active/désactive un utilisateur
    this.router.patch('/users/:id/toggle-active', authMiddleware, requireRole('super_admin'), this.toggleUserActiveController.toggle);

    // PUT /auth/users/:id — mise à jour d'un utilisateur
    this.router.put('/users/:id', authMiddleware, requireRole('super_admin'), this.updateUserController.update);

    // DELETE /auth/users/:id — suppression définitive d'un utilisateur
    this.router.delete('/users/:id', authMiddleware, requireRole('super_admin'), this.deleteUserController.delete);
  }
}
