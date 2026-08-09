/*
|--------------------------------------------------------------------------
| AUTH API — Frontend
|--------------------------------------------------------------------------
| Toutes les communications avec les endpoints /auth du backend.
| Utilise le client fetch natif (api-client.ts) déjà en place.
|--------------------------------------------------------------------------
*/

import { apiClient, setAccessToken } from '../../../libs/api-client';
import type {
  LoginDto,
  RegisterDto,
  VerifyAccountDto,
  ResendCodeDto,
  LoginResponse,
  RegisterResponse,
  AuthUser,
} from './auth.types';
import type { ApiResponse } from '../../../libs/api-client';

/** POST /auth/login — Connexion d'un utilisateur */
export async function loginUser(dto: LoginDto): Promise<LoginResponse> {
  const res = await apiClient.post<ApiResponse<any>>(
    '/auth/login',
    dto,
    { skipAuthRefresh: true },
  );

  const raw = res.data;

  // Normaliser la réponse backend (flat) → type AuthUser (objet role)
  const user: AuthUser = {
    id:             raw.user.id,
    fullName:       raw.user.fullName,
    email:          raw.user.email,
    phone:          raw.user.phone ?? null,
    territoryId:    raw.user.territoryId ?? null,
    organizationId: raw.user.organizationId ?? null,
    isActive:       raw.user.isActive,
    isVerified:     raw.user.isVerified,
    createdAt:      raw.user.createdAt ?? '',
    updatedAt:      raw.user.updatedAt ?? '',
    role: {
      id:            raw.user.roleId   ?? '',
      code:          raw.user.roleCode ?? '',
      name:          raw.user.roleName ?? raw.user.roleCode ?? '',
      tier:          raw.user.roleTier ?? null,
      canManageUsers: raw.user.canManageUsers ?? false,
    },
  };

  // Stocker l'access token en mémoire
  setAccessToken(raw.accessToken);
  return { user, accessToken: raw.accessToken };
}

/** POST /auth/register — Inscription d'un nouvel utilisateur */
export async function registerUser(dto: RegisterDto): Promise<RegisterResponse> {
  const res = await apiClient.post<ApiResponse<RegisterResponse>>(
    '/auth/register',
    dto,
    { skipAuthRefresh: true },
  );
  return res.data;
}

/** POST /auth/verify — Vérification du compte via OTP */
export async function verifyAccount(dto: VerifyAccountDto): Promise<void> {
  await apiClient.post<ApiResponse<null>>(
    '/auth/verify',
    dto,
    { skipAuthRefresh: true },
  );
}

/** POST /auth/resend-code — Renvoi du code OTP */
export async function resendCode(dto: ResendCodeDto): Promise<void> {
  await apiClient.post<ApiResponse<null>>(
    '/auth/resend-code',
    dto,
    { skipAuthRefresh: true },
  );
}

/** POST /auth/logout — Déconnexion (invalide le cookie refresh token) */
export async function logoutUser(): Promise<void> {
  await apiClient.post<ApiResponse<null>>('/auth/logout');
}

/** GET /auth/me — Profil de l'utilisateur connecté */
export async function fetchMe(): Promise<AuthUser> {
  const res = await apiClient.get<ApiResponse<any>>('/auth/me');
  const raw = res.data;

  // Normaliser la réponse backend → AuthUser
  return {
    id:             raw.id,
    fullName:       raw.fullName,
    email:          raw.email,
    phone:          raw.phone ?? null,
    territoryId:    raw.territoryId ?? null,
    organizationId: raw.organizationId ?? null,
    isActive:       raw.isActive,
    isVerified:     raw.isVerified,
    createdAt:      raw.createdAt ?? '',
    updatedAt:      raw.updatedAt ?? '',
    role: {
      id:             raw.roleId  ?? '',
      code:           raw.roleCode ?? '',
      name:           raw.roleName ?? raw.roleCode ?? '',
      tier:           raw.roleTier ?? null,
      canManageUsers: raw.canManageUsers ?? false,
    },
  };
}

/** GET /auth/users — Liste paginée des utilisateurs (super admin) */
export async function fetchUsers(
  page = 1,
  limit = 50,
): Promise<import('./auth.types').PaginatedUsersResult> {
  const res = await apiClient.get<ApiResponse<any>>('/auth/users', {
    params: { page, limit },
  });

  return {
    data:       Array.isArray(res.data) ? res.data : [],
    total:      res.pagination?.total ?? (Array.isArray(res.data) ? res.data.length : 0),
    page:       res.pagination?.page ?? page,
    limit:      res.pagination?.limit ?? limit,
    totalPages: res.pagination?.totalPages ?? 1,
  };
}

/** POST /auth/register-admin — Création d'un utilisateur par le super admin */
export async function adminCreateUser(dto: RegisterDto): Promise<import('./auth.types').AppUser> {
  const res = await apiClient.post<ApiResponse<import('./auth.types').AppUser>>('/auth/register-admin', dto);
  return res.data;
}
