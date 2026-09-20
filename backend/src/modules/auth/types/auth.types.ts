/*
|--------------------------------------------------------------------------
| AUTH TYPES
|--------------------------------------------------------------------------
| Row types   → structure brute retournée par PostgreSQL (snake_case)
| Domain types → objets métier mappés en camelCase (utilisés par les services)
| Payload types → données d'entrée vers le repository
|--------------------------------------------------------------------------
*/

import { RoleTier } from './auth.enums';

export interface TokenPayload {
  id: string; // ID of the session
  userId: string;
  email: string;
  roleCode: string;
  roleTier: RoleTier | null;
  regionId: string | null;
  municipalityId: string | null;
  districtId: string | null;
  neighborhoodId: string | null;
  organizationId: string | null;
  roles?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ROW TYPES — structure brute PostgreSQL (snake_case)
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role_id: string;
  region_id: string | null;
  municipality_id: string | null;
  district_id: string | null;
  neighborhood_id: string | null;
  organization_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface RoleRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  tier: RoleTier | null;
  route_prefix: string | null;
  dashboard_path: string | null;
  page_ids: string[];
  can_manage_users: boolean;
  can_manage_roles: boolean;
  created_at: Date;
  updated_at: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TYPES — objets métier camelCase (utilisés par services & controllers)
// ─────────────────────────────────────────────────────────────────────────────

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
  regionId: string | null;
  municipalityId: string | null;
  districtId: string | null;
  neighborhoodId: string | null;
  organizationId: string | null;
  isActive: boolean;
  isVerified: boolean;
  role: AuthRole;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOAD TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateUserPayload {
  fullName: string;
  email: string;
  phone?: string;
  passwordHash: string;
  roleId: string;
  regionId?: string | null;
  municipalityId?: string | null;
  districtId?: string | null;
  neighborhoodId?: string | null;
  organizationId?: string | null;
  createdBy?: string;
}

export interface CreateOtpPayload {
  authId: string;
  codeHash: string;
  type: import('./auth.enums').OtpType;
  expiresAt: Date;
}
export interface RegisterUserDTO {
  fullName: string;
  email: string;
  phone?: string;
  password?: string; // Optionnel (généré automatiquement s'il est vide)
  roleCode: string;
  regionId?: string;
  municipalityId?: string;
  districtId?: string;
  neighborhoodId?: string;
  organizationId?: string;
}

export interface CreateSessionPayload {
  authId: string;
  token: string;
  expiresAt: Date;
}

