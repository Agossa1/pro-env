/**
 * API Client - Point d'entrée unique pour toutes les communications avec le backend.
 *
 * Utilise fetch natif, envoie les cookies (refreshToken HttpOnly) automatiquement
 * et gère la capture des erreurs backend, BDD et réseau de manière centralisée.
 */

// ============================================================================
// Configuration
// ============================================================================

/** URL de base du backend. Peut être surchargée via VITE_API_URL dans .env */
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

/** Access token conservé uniquement en mémoire (jamais persisté — sécurité anti-XSS) */
let accessToken: string | null = null;

// ============================================================================
// Types
// ============================================================================

/** Métadonnées de pagination renvoyées par le backend */
export interface ApiPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Réponse standardisée du backend en cas de succès */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: ApiPagination;
}

/** Erreur de validation par champ (format Zod du backend) */
export interface ApiFieldError {
  field: string;
  message: string;
}

/** Erreur API normalisée côté frontend */
export class ApiError extends Error {
  /** Code HTTP retourné (ex: 400, 401, 500) ou 0 pour une erreur réseau */
  readonly status: number;
  /** Liste des erreurs de validation par champ (si présentes) */
  readonly errors?: ApiFieldError[];
  /** Corps brut de la réponse (non modifié) */
  readonly rawBody?: unknown;

  constructor(
    message: string,
    status: number = 0,
    errors?: ApiFieldError[],
    rawBody?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.rawBody = rawBody;
  }
}

/** Options de requête personnalisées */
export interface ApiRequestOptions {
  /** Corps de la requête (objet sérialisé en JSON, ou FormData pour upload) */
  body?: unknown;
  /** Query params ajoutés à l'URL (ex: { page: 2, limit: 10 }) */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Headers supplémentaires (surchargent les headers par défaut) */
  headers?: Record<string, string>;
  /** Désactive la tentative de refresh automatique sur 401 */
  skipAuthRefresh?: boolean;
}

// ============================================================================
// Gestion du token d'accès (en mémoire uniquement, jamais persistant)
// ============================================================================

/**
 * Stocke l'access token en mémoire.
 * Aucun stockage persistant (localStorage/sessionStorage) : les tokens ne sont
 * jamais exposés aux attaques XSS. La session est restaurée au démarrage
 * via le refresh token en cookie HttpOnly (initAuthSession).
 */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** Récupère l'access token en mémoire */
export function getAccessToken(): string | null {
  return accessToken;
}

/** Supprime l'access token en mémoire */
export function clearAccessToken(): void {
  accessToken = null;
}

// ============================================================================
// Helpers internes
// ============================================================================

/** Messages d'erreur par défaut selon le code HTTP */
const DEFAULT_HTTP_MESSAGES: Record<number, string> = {
  400: 'Requête invalide.',
  401: 'Session expirée ou non autorisée.',
  403: "Accès refusé. Vous n'avez pas les permissions nécessaires.",
  404: 'Ressource introuvable.',
  409: 'Conflit avec une ressource existante.',
  422: 'Données invalides.',
  429: 'Trop de requêtes. Veuillez réessayer plus tard.',
  500: 'Erreur interne du serveur. Veuillez réessayer plus tard.',
  502: 'Service temporairement indisponible.',
  503: 'Service indisponible. Veuillez réessayer plus tard.',
};

/** Sérialise les query params en chaîne d'URL */
function buildQueryString(params?: ApiRequestOptions['params']): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

/** Extrait la charge utile JSON d'une réponse, avec fallback sur texte brut */
async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Normalise une erreur reçue du backend (format { status, message, errors }) en ApiError */
function normalizeBackendError(body: unknown, status: number): ApiError {
  if (body && typeof body === 'object') {
    const b = body as Record<string, unknown>;

    // Format backend : { status: 'error', message: '...', errors: [{ field, message }] }
    if (typeof b.message === 'string') {
      const errors = Array.isArray(b.errors)
        ? (b.errors as ApiFieldError[])
        : undefined;

      // Certains controllers zod renvoient error.issues directement
      if (Array.isArray(b.issues)) {
        const zodErrors = (b.issues as Array<{ path?: (string | number)[]; message?: string }>).map(
          (issue) => ({
            field: (issue.path ?? []).join('.'),
            message: issue.message ?? 'Valeur invalide.',
          })
        );
        return new ApiError(
          typeof b.message === 'string' ? b.message : 'Erreur de validation.',
          status,
          zodErrors,
          body
        );
      }

      return new ApiError(b.message as string, status, errors, body);
    }
  }

  return new ApiError(DEFAULT_HTTP_MESSAGES[status] ?? 'Erreur inconnue.', status, undefined, body);
}

/** Tente de rafraîchir la session via POST /auth/refresh (cookie HttpOnly) */
async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return null;

    const body = (await parseResponseBody(response)) as
      | { data?: { accessToken?: string } }
      | undefined;

    return body?.data?.accessToken ?? null;
  } catch {
    return null;
  }
}

/**
 * Restaure la session au démarrage de l'application.
 * Utilise le refresh token (cookie HttpOnly envoyé automatiquement) pour
 * obtenir un nouvel access token stocké en mémoire.
 *
 * À appeler une fois au boot de l'app (main.tsx).
 *
 * @returns true si la session a été restaurée, false sinon (non bloquant).
 */
export async function initAuthSession(): Promise<boolean> {
  const token = await refreshAccessToken();
  if (token) {
    setAccessToken(token);
    return true;
  }
  clearAccessToken();
  return false;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface InternalRequestOptions extends ApiRequestOptions {
  method: HttpMethod;
}

/** Envoie la requête fetch et normalise la réponse ou l'erreur */
async function request<T>(url: string, options: InternalRequestOptions): Promise<T> {
  const { method, body, params, headers, skipAuthRefresh = false } = options;

  const fullUrl = `${BASE_URL}${url}${buildQueryString(params)}`;

  // Préparation des headers
  const requestHeaders: Record<string, string> = { ...(headers ?? {}) };

  const token = getAccessToken();
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Sérialisation du corps
  let requestBody: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      requestBody = body; // pas de Content-Type pour FormData (le navigateur gère la boundary)
    } else if (typeof body === 'string') {
      requestBody = body;
      if (!requestHeaders['Content-Type']) {
        requestHeaders['Content-Type'] = 'application/json';
      }
    } else {
      requestBody = JSON.stringify(body);
      if (!requestHeaders['Content-Type']) {
        requestHeaders['Content-Type'] = 'application/json';
      }
    }
  }

  let response: Response;

  try {
    response = await fetch(fullUrl, {
      method,
      credentials: 'include', // envoie les cookies (refreshToken HttpOnly)
      headers: requestHeaders,
      body: requestBody,
    });
  } catch (error) {
    // Erreur réseau : backend down, BDD inaccessible, CORS, DNS...
    if (error instanceof TypeError) {
      throw new ApiError(
        'Impossible de contacter le serveur. Vérifiez patienter et ressayer quelques minutes.',
        0,
        undefined,
        error
      );
    }
    throw error;
  }

  // Cas 401 : tentative de refresh du token puis rejeu de la requête
  if (response.status === 401 && !skipAuthRefresh) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      setAccessToken(newToken);
      return request<T>(url, { ...options, method, skipAuthRefresh: true });
    }

    clearAccessToken();
  }

  // Parsing du corps
  const rawBody = await parseResponseBody(response);

  // Réponse en succès
  if (response.ok) {
    return rawBody as T;
  }

  // Réponse en erreur
  throw normalizeBackendError(rawBody, response.status);
}

// ============================================================================
// API Client public
// ============================================================================

export const apiClient = {
  /** GET — Récupère des données */
  get<T>(url: string, options?: Omit<ApiRequestOptions, 'body'>): Promise<T> {
    return request<T>(url, { ...options, method: 'GET' });
  },

  /** POST — Crée une ressource */
  post<T>(url: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return request<T>(url, { ...options, body, method: 'POST' });
  },

  /** PUT — Remplace une ressource */
  put<T>(url: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return request<T>(url, { ...options, body, method: 'PUT' });
  },

  /** PATCH — Met à jour partiellement une ressource */
  patch<T>(url: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
    return request<T>(url, { ...options, body, method: 'PATCH' });
  },

  /** DELETE — Supprime une ressource */
  delete<T>(url: string, options?: Omit<ApiRequestOptions, 'body'>): Promise<T> {
    return request<T>(url, { ...options, method: 'DELETE' });
  },

  /** Health check du backend */
  health(): Promise<{ status: string; timestamp?: string }> {
    return request<{ status: string; timestamp?: string }>('/health', { method: 'GET' });
  },
};

/** Vérifie si une erreur est une ApiError */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}