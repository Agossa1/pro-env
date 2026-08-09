import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors/appErrors';
import { TokenManager } from '../../config/tokens/tokenManager';
import { TokenPayload } from '../../modules/auth/types/auth.types';

const tokenService = new TokenManager();

// Extension de l'interface Request d'Express
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware d'authentification pour protéger les routes
 * Extrait le token des cookies (HttpOnly) ou du header Authorization
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError("Accès non autorisé. Token manquant.");
    }

    try {
      const decoded = tokenService.verifyAccessToken(token) as TokenPayload;
      req.user = decoded;
      next();
    } catch (err) {
      throw new UnauthorizedError("Session expirée ou invalide.");
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Verification du role
 * Retourne un middleware Express configuré avec les rôles autorisés.
 */
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw new UnauthorizedError("Accès non autorisé. Token manquant.");
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      const userRoles = Array.isArray(user.roles) ? user.roles : [];

      const isSuperAdmin = userRoles.includes('super_admin' as any);
      const hasRequiredRole = userRoles.some((role: any) => allowedRoles.includes(role));

      if (!isSuperAdmin && !hasRequiredRole) {
        throw new ForbiddenError("Accès non autorisé. Vous n'avez pas le rôle nécessaire.");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};