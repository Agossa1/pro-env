/*
 * |--------------------------------------------------------------------------
 * | PERMISSION TYPES
 * |--------------------------------------------------------------------------
 * | Row types   → structure brute PostgreSQL (snake_case)
 * | Domain types → objets métier camelCase (services & controllers)
 * | Payload types → données d'entrée vers le repository
 * |--------------------------------------------------------------------------
 */

import { PermissionModule, PermissionAction } from './permission.enums';

// ─────────────────────────────────────────────────────────────────────────────
// ROW TYPES — structure brute PostgreSQL (snake_case)
// ─────────────────────────────────────────────────────────────────────────────

export interface PermissionRow {
  id: string;
  module: string;
  action: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface RolePermissionRow {
  id: string;
  role_id: string;
  permission_id: string;
  created_at: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TYPES — objets métier camelCase
// ─────────────────────────────────────────────────────────────────────────────

export interface Permission {
  id: string;
  module: string;
  action: string;
  description: string | null;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
}

export interface RoleWithPermissions {
  id: string;
  code: string;
  name: string;
  tier: string | null;
  canManageUsers: boolean;
  canManageRoles: boolean;
  permissions: Permission[];
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

export interface CreatePermissionPayload {
  module: PermissionModule | string;
  action: PermissionAction | string;
  description?: string | null;
}

export interface UpdatePermissionPayload {
  description?: string | null;
}

export interface AssignPermissionsPayload {
  roleId: string;
  permissionIds: string[];
}