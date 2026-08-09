"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = void 0;
const appErrors_1 = require("../errors/appErrors");
/**
 * Middleware de contrôle d'accès par permission (RBAC).
 * Vérifie que l'utilisateur authentifié (req.user.userId) possède la
 * permission (module + action) via son rôle (jointure auth → roles →
 * role_permissions → permissions).
 *
 * Usage :
 *   router.get('/', authMiddleware, requirePermission(PermissionRepository, 'territory', 'read'), handler)
 */
const requirePermission = (permissionRepository, module, action) => {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                throw new appErrors_1.UnauthorizedError('Accès non autorisé. Token manquant.');
            }
            // Super admin : accès complet (contourne la vérification)
            const userRoles = Array.isArray(user.roles) ? user.roles : [];
            if (userRoles.includes('super_admin') || user.roleCode === 'super_admin') {
                return next();
            }
            const hasPermission = await permissionRepository.userHasPermission(user.userId, module, action);
            if (!hasPermission) {
                throw new appErrors_1.ForbiddenError(`Permission refusée : ${module}.${action}.`);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requirePermission = requirePermission;
//# sourceMappingURL=permission.middleware.js.map