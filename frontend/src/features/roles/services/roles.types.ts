/*
 * |--------------------------------------------------------------------------
 * | ROLES TYPES (frontend)
 * |--------------------------------------------------------------------------
 * | Miroir des types backend : role.types.ts + auth.enums.ts
 * | Uniquement les interfaces nécessaires côté client.
 * |--------------------------------------------------------------------------
 */

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export const RoleTier = {
  PLATFORM:   'platform',
  TERRITORIAL: 'territorial',
  FIELD:      'field',
} as const;

export type RoleTier = typeof RoleTier[keyof typeof RoleTier];

export const UserRoleCode = {
  SUPER_ADMIN:     'super_admin',
  ADMIN_MINISTERE: 'admin_ministere',
  ADMIN_MAIRIE:    'admin_mairie',
  TECHNICIEN:      'technicien',
  PREFECTURE:      'prefecture',
  CITOYEN:         'citoyen',
} as const;

export type UserRoleCode = typeof UserRoleCode[keyof typeof UserRoleCode];

// ─────────────────────────────────────────────────────────────────────────────
// Domain types (camelCase — retournés par le backend)
// ─────────────────────────────────────────────────────────────────────────────

export interface AppRole {
  id:             string;
  code:           string;
  name:           string;
  description:    string | null;
  tier:           RoleTier | null;
  routePrefix:    string | null;
  dashboardPath:  string | null;
  pageIds:        string[];
  canManageUsers: boolean;
  canManageRoles: boolean;
  createdAt:      string;
  updatedAt:      string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginatedRolesResult {
  data:       AppRole[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// DTO — données envoyées vers le backend
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateRoleDto {
  code:           string;
  name:           string;
  description?:   string | null;
  tier?:          RoleTier | null;
  routePrefix?:   string | null;
  dashboardPath?: string | null;
  pageIds?:       string[];
  canManageUsers?: boolean;
  canManageRoles?: boolean;
}

export interface UpdateRoleDto {
  name?:          string;
  description?:   string | null;
  tier?:          RoleTier | null;
  routePrefix?:   string | null;
  dashboardPath?: string | null;
  pageIds?:       string[];
  canManageUsers?: boolean;
  canManageRoles?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers UI
// ─────────────────────────────────────────────────────────────────────────────

/** Libellé lisible du tier */
export const TIER_LABELS: Record<string, string> = {
  platform:    'Plateforme',
  territorial: 'Territorial',
  field:       'Terrain',
};

/** Couleur Tailwind par tier */
export const TIER_COLORS: Record<string, string> = {
  platform:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  territorial: 'bg-amber-50 text-amber-700 border-amber-200',
  field:       'bg-rose-50 text-rose-700 border-rose-200',
};
