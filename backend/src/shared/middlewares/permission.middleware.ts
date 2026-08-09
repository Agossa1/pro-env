import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/appErrors';
import { PermissionRepository } from '../../modules/permissions/repositories/permission.repositories';

/**
 * Middleware de contrôle d'accès par permission (RBAC).
 * Vérifie que l'utilisateur authentifié (req.user.userId) possède la
 * permission (module + action) via son rôle (jointure auth → roles →
 * role_permissions → permissions).
 *
 * Usage :
 *   router.get('/', authMiddleware, requirePermission(PermissionRepository, 'territory', 'read'), handler)
 */
export const requirePermission = (
  permissionRepository: PermissionRepository,
  module: string,
  action: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        throw new UnauthorizedError('Accès non autorisé. Token manquant.');
      }

      // Super admin : accès complet (contourne la vérification)
      const userRoles = Array.isArray((user as any).roles) ? (user as any).roles : [];
      if (userRoles.includes('super_admin') || user.roleCode === 'super_admin') {
        return next();
      }

      const hasPermission = await permissionRepository.userHasPermission(
        user.userId,
        module,
        action
      );

      if (!hasPermission) {
        throw new ForbiddenError(
          `Permission refusée : ${module}.${action}.`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};