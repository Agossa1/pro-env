import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { VerifyAccountService } from '../services/verifyAccount.service';
import { VerifySchema } from '../validations/auth.validations';

export class VerifyAccountController {
  constructor(private readonly verifyAccountService: VerifyAccountService) {}

  public verify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Validation des données d'entrée
      const { email, code } = VerifySchema.parse(req.body);
      
      // 2. Appel au service métier
      await this.verifyAccountService.verify(email, code);
      
      // 3. Réponse standardisée
      res.status(200).json({
        success: true,
        message: 'Compte vérifié avec succès. Vous pouvez maintenant vous connecter.',
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
