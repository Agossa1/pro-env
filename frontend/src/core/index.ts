/**
 * Point d'entrée central de l'application.
 * Exporte le store Redux, ses types, ainsi que le client API.
 */

// Store Redux
export { store } from './store';
export type { RootState, AppDispatch } from './store';

// API Client
export {
  apiClient,
  ApiError,
  setAccessToken,
  getAccessToken,
  clearAccessToken,
  initAuthSession,
  isApiError,
} from '../libs/api-client';
export type {
  ApiResponse,
  ApiFieldError,
  ApiRequestOptions,
} from '../libs/api-client';