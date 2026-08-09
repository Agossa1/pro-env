"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.NotFoundError = exports.AppError = exports.HttpCode = void 0;
/**
 * Liste des codes HTTP standards utilisés dans l'application.
 * centraliser ces codes évite les "magic numbers" dans le code.
 */
var HttpCode;
(function (HttpCode) {
    HttpCode[HttpCode["OK"] = 200] = "OK";
    HttpCode[HttpCode["CREATED"] = 201] = "CREATED";
    HttpCode[HttpCode["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpCode[HttpCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpCode[HttpCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    HttpCode[HttpCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    HttpCode[HttpCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpCode[HttpCode["CONFLICT"] = 409] = "CONFLICT";
    HttpCode[HttpCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HttpCode || (exports.HttpCode = HttpCode = {}));
/**
 * Classe de base pour toutes les erreurs personnalisées de l'application.
 * Elle hérite de la classe Error native de JavaScript.
 */
class AppError extends Error {
    /**
     * @param message Message d'erreur lisible par l'humain
     * @param statusCode Code HTTP associé (ex: 404, 500)
     * @param isOperational Définit si l'erreur est prévue (true) ou un crash inattendu (false)
     */
    constructor(message, statusCode = HttpCode.INTERNAL_SERVER_ERROR, isOperational = true) {
        super(message);
        // Restaure la chaîne de prototypes pour que 'instanceof' fonctionne correctement
        Object.setPrototypeOf(this, new.target.prototype);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        // Capture la pile d'appels pour faciliter le debugging
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * Erreur lancée lorsqu'une ressource n'existe pas (Dossier, Article, Utilisateur, etc.)
 */
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, HttpCode.NOT_FOUND);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * Erreur lancée lorsque les données envoyées par le client sont invalides ou malformées.
 */
class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(message, HttpCode.BAD_REQUEST);
    }
}
exports.BadRequestError = BadRequestError;
/**
 * Erreur d'authentification : le jeton est manquant ou invalide.
 */
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, HttpCode.UNAUTHORIZED);
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * Erreur de permission : l'utilisateur est connecté mais n'a pas le droit d'accéder à cette ressource.
 */
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, HttpCode.FORBIDDEN);
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * Erreur de conflit au niveau de l'état (ex: tenter de créer un utilisateur avec un email déjà pris).
 */
class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(message, HttpCode.CONFLICT);
    }
}
exports.ConflictError = ConflictError;
/**
 * Erreur spécifique à la validation (Zod, etc.) qui peut contenir une liste d'erreurs détaillées par champ.
 */
class ValidationError extends AppError {
    constructor(message = 'Validation failed', errors) {
        super(message, HttpCode.BAD_REQUEST);
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=appErrors.js.map