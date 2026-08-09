import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RefreshTokenService } from '../services/refreshtoken.service';
import { UnauthorizedError } from '../../../shared/errors/appErrors';

export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {}

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Le Refresh Token peut venir soit d'un Cookie HttpOnly (recommandé), soit du corps de la requête
      const token = req.cookies?.refreshToken || req.body?.refreshToken;

      if (!token) {
        throw new UnauthorizedError('Refresh Token manquant.');
      }

      // Appel au service métier (qui vérifie la validité cryptographique et en base de données)
      const result = await this.refreshTokenService.refresh(token);
      
      // Sécurité : Remplacer l'ancien cookie par le nouveau (Rotation du Refresh Token)
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000, 
      };
      
      res.cookie('refreshToken', result.refreshToken, cookieOptions);

      // Réponse standardisée
      res.status(200).json({
        success: true,
        message: 'Token rafraîchi avec succès.',
        data: {
          accessToken: result.accessToken,
        }
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
