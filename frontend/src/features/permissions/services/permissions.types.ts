/*
 * |--------------------------------------------------------------------------
 * | PERMISSIONS TYPES (frontend)
 * |--------------------------------------------------------------------------
 * | Miroir des types backend : permission.types.ts
 * |--------------------------------------------------------------------------
 */

// ─────────────────────────────────────────────────────────────────────────────
// Domain types
// ─────────────────────────────────────────────────────────────────────────────

export interface Permission {
  id:          string;
  module:      string;
  action:      string;
  description: string | null;
}

export interface RoleWithPermissions {
  id:             string;
  code:           string;
  name:           string;
  tier:           string | null;
  canManageUsers: boolean;
  canManageRoles: boolean;
  permissions:    Permission[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginatedPermissionsResult {
  data:       Permission[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO — données envoyées vers le backend
// ─────────────────────────────────────────────────────────────────────────────

export interface CreatePermissionDto {
  module:      string;
  action:      string;
  description?: string | null;
}

export interface UpdatePermissionDto {
  description?: string | null;
}

export interface AssignPermissionsDto {
  permissionIds: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers UI
// ─────────────────────────────────────────────────────────────────────────────

/** Couleur de badge par action */
export const ACTION_COLORS: Record<string, string> = {
  manage: 'bg-gray-50 text-gray-700 border-gray-200',
  create: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  read:   'bg-benin-green-light text-benin-green border-benin-green/30',
  update: 'bg-amber-50 text-amber-700 border-amber-200',
  delete: 'bg-rose-50 text-rose-700 border-rose-200',
  assign: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};
