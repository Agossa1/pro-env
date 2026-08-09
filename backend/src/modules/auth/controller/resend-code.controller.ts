import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ResendCodeService } from '../services/resend-code.service';
import { ResendCodeSchema } from '../validations/auth.validations';

export class ResendCodeController {
  constructor(private readonly resendCodeService: ResendCodeService) {}

  public resend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validation des données d'entrée
      const { email } = ResendCodeSchema.parse(req.body);
      
      // 2. Appel au service métier
      await this.resendCodeService.resend(email);
      
      // 3. Réponse standardisée
      res.status(200).json({
        success: true,
        message: 'Un nouveau code de vérification a été envoyé à votre adresse email.',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: 'Erreur de validation des données.', 
          errors: error.issues
        });
        return;
      }
      next(error);
    }
  };
}
