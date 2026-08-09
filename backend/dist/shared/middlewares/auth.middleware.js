"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authMiddleware = void 0;
const appErrors_1 = require("../errors/appErrors");
const tokenManager_1 = require("../../config/tokens/tokenManager");
const tokenService = new tokenManager_1.TokenManager();
/**
 * Middleware d'authentification pour protéger les routes
 * Extrait le token des cookies (HttpOnly) ou du header Authorization
 */
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new appErrors_1.UnauthorizedError("Accès non autorisé. Token manquant.");
        }
        try {
            const decoded = tokenService.verifyAccessToken(token);
            req.user = decoded;
            next();
        }
        catch (err) {
            throw new appErrors_1.UnauthorizedError("Session expirée ou invalide.");
        }
    }
    catch (error) {
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
/**
 * Verification du role
 * Retourne un middleware Express configuré avec les rôles autorisés.
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                throw new appErrors_1.UnauthorizedError("Accès non autorisé. Token manquant.");
            }
            const allowedRoles = Array.isArray(roles) ? roles : [roles];
            const userRoles = Array.isArray(user.roles) ? user.roles : [];
            const isSuperAdmin = userRoles.includes('super_admin');
            const hasRequiredRole = userRoles.some((role) => allowedRoles.includes(role));
            if (!isSuperAdmin && !hasRequiredRole) {
                throw new appErrors_1.ForbiddenError("Accès non autorisé. Vous n'avez pas le rôle nécessaire.");
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.requireRole = requireRole;
//# sourceMappingURL=auth.middleware.js.map