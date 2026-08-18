import type { Request, Response, NextFunction } from 'express';
import { ForgotPasswordService } from '../services/forgot-password.service';
import { ForgotPasswordSchema } from '../validations/auth.validations';

export class ForgotPasswordController {
  constructor(private readonly forgotPasswordService: ForgotPasswordService) {}

  public async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Validation Zod
      const { email } = ForgotPasswordSchema.parse(req.body);

      // 2. Appel du service
      await this.forgotPasswordService.forgotPassword(email);

      // 3. Réponse
      res.status(200).json({
        success: true,
        message: "Un email de réinitialisation de mot de passe a été envoyé (si le compte existe).",
      });
    } catch (error) {
      next(error);
    }
  }
}
