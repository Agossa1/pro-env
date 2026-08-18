import type { Request, Response, NextFunction } from 'express';
import { LogoutService } from '../services/logout.service';

export class LogoutController {
  constructor(private readonly logoutService: LogoutService) {}

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Le Refresh Token à révoquer peut venir du cookie ou du body
      const token = req.cookies?.refreshToken || req.body?.refreshToken;

      if (token) {
        // Révocation de la session en base de données
        await this.logoutService.logout(token);
      }

      // Nettoyage du cookie HttpOnly — les options doivent correspondre exactement au cookie créé
      const isProduction = process.env.NODE_ENV === 'production';
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
      });

      // Réponse standardisée (même si le token était absent, on renvoie 200 par idempotence)
      res.status(200).json({
        success: true,
        message: 'Déconnexion réussie.',
      });
    } catch (error) {
      next(error);
    }
  };
}
