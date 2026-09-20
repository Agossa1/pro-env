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
  regionId?: string | null;
  municipalityId?: string | null;
  districtId?: string | null;
  neighborhoodId?: string | null;
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
  regionId?: string;
  municipalityId?: string;
  districtId?: string;
  neighborhoodId?: string;
  organizationId?: string;
}

export interface UpdateUserDto {
  id: string;
  fullName?: string;
  phone?: string;
  roleId?: string;
  regionId?: string | null;
  municipalityId?: string | null;
  districtId?: string | null;
  neighborhoodId?: string | null;
}
