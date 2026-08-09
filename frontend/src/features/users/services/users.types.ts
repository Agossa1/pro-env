/*
 * |--------------------------------------------------------------------------
 * | USERS TYPES (frontend)
 * |--------------------------------------------------------------------------
 */

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

export interface CreateUserDto {
  fullName: string;
  email: string;
  phone?: string;
  roleCode: string;
  territoryId?: string;
  organizationId?: string;
}
