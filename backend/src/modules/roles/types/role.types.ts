/*
 * |--------------------------------------------------------------------------
 * | ROLE TYPES
 * |--------------------------------------------------------------------------
 * | Row types   → structure brute PostgreSQL (snake_case)
 * | Domain types → objets métier camelCase (services & controllers)
 * | Payload types → données d'entrée vers le repository
 * |--------------------------------------------------------------------------
 */

import { RoleTier } from './role.enums';

// ─────────────────────────────────────────────────────────────────────────────
// ROW TYPES — structure brute PostgreSQL (snake_case)
// ─────────────────────────────────────────────────────────────────────────────

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
// DOMAIN TYPES — objets métier camelCase
// ─────────────────────────────────────────────────────────────────────────────

export interface AppRole {
  id: string;
  code: string;
  name: string;
  description: string | null;
  tier: RoleTier | null;
  routePrefix: string | null;
  dashboardPath: string | null;
  pageIds: string[];
  canManageUsers: boolean;
  canManageRoles: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOAD TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateRolePayload {
  code: string;
  name: string;
  description?: string | null;
  tier?: RoleTier | null;
  routePrefix?: string | null;
  dashboardPath?: string | null;
  pageIds?: string[];
  canManageUsers?: boolean;
  canManageRoles?: boolean;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string | null;
  tier?: RoleTier | null;
  routePrefix?: string | null;
  dashboardPath?: string | null;
  pageIds?: string[];
  canManageUsers?: boolean;
  canManageRoles?: boolean;
}