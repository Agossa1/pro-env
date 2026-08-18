import type { Request, Response, NextFunction } from 'express';
import { ResetPasswordService } from '../services/reset-password.service';
import { ResetPasswordSchema } from '../validations/auth.validations';

export class ResetPasswordController {
  constructor(private readonly resetPasswordService: ResetPasswordService) {}

  public async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Validation Zod
      const { email, code, password } = ResetPasswordSchema.parse(req.body);

      // 2. Appel du service
      await this.resetPasswordService.resetPassword(email, code, password);

      // 3. Réponse
      res.status(200).json({
        success: true,
        message: "Votre mot de passe a été réinitialisé avec succès.",
      });
    } catch (error) {
      next(error);
    }
  }
}
