/*
|--------------------------------------------------------------------------
| AUTH THUNKS — Redux Async Actions
|--------------------------------------------------------------------------
*/

import { createAsyncThunk } from '@reduxjs/toolkit';
import { isApiError } from '../../../libs/api-client';
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchMe,
  fetchUsers,
  adminCreateUser,
} from './auth.api';
import type {
  LoginDto,
  RegisterDto,
  LoginResponse,
  RegisterResponse,
  AuthUser,
  AppUser,
  PaginatedUsersResult,
} from './auth.types';
import { clearAccessToken } from '../../../libs/api-client';

function extractMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return 'Une erreur inattendue est survenue.';
}

/** Connexion */
export const loginThunk = createAsyncThunk<LoginResponse, LoginDto, { rejectValue: string }>(
  'auth/login',
  async (dto, { rejectWithValue }) => {
    try {
      return await loginUser(dto);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Inscription publique (citoyen) */
export const registerThunk = createAsyncThunk<RegisterResponse, RegisterDto, { rejectValue: string }>(
  'auth/register',
  async (dto, { rejectWithValue }) => {
    try {
      return await registerUser(dto);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Déconnexion */
export const logoutThunk = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutUser();
      clearAccessToken();
    } catch (error) {
      clearAccessToken();
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Récupération du profil utilisateur connecté */
export const fetchMeThunk = createAsyncThunk<AuthUser, void, { rejectValue: string }>(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchMe();
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Liste des utilisateurs (admin) */
export const fetchUsersThunk = createAsyncThunk<
  PaginatedUsersResult,
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>(
  'auth/fetchUsers',
  async (args, { rejectWithValue }) => {
    try {
      return await fetchUsers(args?.page, args?.limit);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Création d'un utilisateur par un admin */
export const adminCreateUserThunk = createAsyncThunk<
  AppUser,
  RegisterDto,
  { rejectValue: string }
>(
  'auth/adminCreateUser',
  async (dto, { rejectWithValue }) => {
    try {
      return await adminCreateUser(dto);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);
