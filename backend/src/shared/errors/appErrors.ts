/**
 * Liste des codes HTTP standards utilisés dans l'application.
 * centraliser ces codes évite les "magic numbers" dans le code.
 */
export enum HttpCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

/**
 * Classe de base pour toutes les erreurs personnalisées de l'application.
 * Elle hérite de la classe Error native de JavaScript.
 */
export class AppError extends Error {
  public readonly statusCode: HttpCode;
  public readonly isOperational: boolean;

  /**
   * @param message Message d'erreur lisible par l'humain
   * @param statusCode Code HTTP associé (ex: 404, 500)
   * @param isOperational Définit si l'erreur est prévue (true) ou un crash inattendu (false)
   */
  constructor(message: string, statusCode: HttpCode = HttpCode.INTERNAL_SERVER_ERROR, isOperational = true) {
    super(message);
    // Restaure la chaîne de prototypes pour que 'instanceof' fonctionne correctement
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    // Capture la pile d'appels pour faciliter le debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erreur lancée lorsqu'une ressource n'existe pas (Dossier, Article, Utilisateur, etc.)
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, HttpCode.NOT_FOUND);
  }
}

/**
 * Erreur lancée lorsque les données envoyées par le client sont invalides ou malformées.
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request') {
    super(message, HttpCode.BAD_REQUEST);
  }
}

/**
 * Erreur d'authentification : le jeton est manquant ou invalide.
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, HttpCode.UNAUTHORIZED);
  }
}

/**
 * Erreur de permission : l'utilisateur est connecté mais n'a pas le droit d'accéder à cette ressource.
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, HttpCode.FORBIDDEN);
  }
}

/**
 * Erreur de conflit au niveau de l'état (ex: tenter de créer un utilisateur avec un email déjà pris).
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, HttpCode.CONFLICT);
  }
}

/**
 * Erreur spécifique à la validation (Zod, etc.) qui peut contenir une liste d'erreurs détaillées par champ.
 */
export class ValidationError extends AppError {
  public readonly errors?: any;
  constructor(message: string = 'Validation failed', errors?: any) {
    super(message, HttpCode.BAD_REQUEST);
    this.errors = errors;
  }
}