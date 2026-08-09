/*
|--------------------------------------------------------------------------
| useAuth — Hook personnalisé
|--------------------------------------------------------------------------
| Point d'entrée unique pour toute la logique d'authentification dans l'UI.
|--------------------------------------------------------------------------
*/

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../core/store';
import {
  selectAuthUser,
  selectAuthStatus,
  selectAuthError,
  selectPendingEmail,
  selectIsAuthenticated,
  selectAuthLoading,
} from '../services/auth.selectors';
import {
  loginThunk,
  logoutThunk,
  registerThunk,
  fetchMeThunk,
} from '../services/auth.thunk';
import { clearAuthError } from '../services/auth.slices';
import type { LoginDto, RegisterDto } from '../services/auth.types';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();

  const user            = useSelector(selectAuthUser);
  const status          = useSelector(selectAuthStatus);
  const error           = useSelector(selectAuthError);
  const pendingEmail    = useSelector(selectPendingEmail);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading       = useSelector(selectAuthLoading);

  const login = useCallback(
    (dto: LoginDto) => dispatch(loginThunk(dto)).unwrap(),
    [dispatch],
  );

  const register = useCallback(
    (dto: RegisterDto) => dispatch(registerThunk(dto)).unwrap(),
    [dispatch],
  );

  const logout = useCallback(
    () => dispatch(logoutThunk()).unwrap(),
    [dispatch],
  );

  const refreshProfile = useCallback(
    () => dispatch(fetchMeThunk()).unwrap(),
    [dispatch],
  );

  const clearError = useCallback(
    () => dispatch(clearAuthError()),
    [dispatch],
  );

  return {
    user,
    status,
    error,
    pendingEmail,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
    clearError,
  };
}
