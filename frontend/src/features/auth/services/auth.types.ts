/*
|--------------------------------------------------------------------------
| AUTH TYPES — Frontend
|--------------------------------------------------------------------------
| Miroir des types backend (auth.types.ts / auth.enums.ts)
|--------------------------------------------------------------------------
*/

// ─── Enums ────────────────────────────────────────────────────────────────────

export const RoleTier = {
  platform:    'platform',
  territorial: 'territorial',
  field:       'field',
} as const;

export type RoleTier = typeof RoleTier[keyof typeof RoleTier];

export const UserRoleCode = {
  super_admin:     'super_admin',
  admin_ministere: 'admin_ministere',
  admin_mairie:    'admin_mairie',
  technicien:      'technicien',
  prefecture:      'prefecture',
  citoyen:         'citoyen',
} as const;

export type UserRoleCode = typeof UserRoleCode[keyof typeof UserRoleCode];

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface AuthRole {
  id: string;
  code: string;
  name: string;
  tier: RoleTier | null;
  canManageUsers: boolean;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  territoryId: string | null;
  organizationId: string | null;
  isActive: boolean;
  isVerified: boolean;
  role: AuthRole;
  createdAt: string;
  updatedAt: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  roleCode: string;
  territoryId?: string;
  organizationId?: string;
}

export interface VerifyAccountDto {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

export interface ResendCodeDto {
  email: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

// ─── Réponses API ─────────────────────────────────────────────────────────────

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
}

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  roleId: string;
  roleName: string;
  roleCode: string;
  territoryId?: string | null;
  territoryName?: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface PaginatedUsersResult {
  data: AppUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
