/*
 * |--------------------------------------------------------------------------
 * | TEAM TYPES
 * |--------------------------------------------------------------------------
 * | Row types   → structure brute PostgreSQL (snake_case)
 * | Domain types → objets métier camelCase (services & controllers)
 * | Payload types → données d'entrée vers le repository
 * |--------------------------------------------------------------------------
 */

import { TeamType, TeamMemberRole } from './team.enums';

// ─────────────────────────────────────────────────────────────────────────────
// ROW TYPES — structure brute PostgreSQL (snake_case)
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldTeamRow {
  id: string;
  organization_id: string | null;
  team_type: TeamType;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface FieldTeamMemberRow {
  id: string;
  team_id: string;
  user_id: string;
  role_in_team: TeamMemberRole;
  is_active: boolean;
  joined_at: Date;
  left_at: Date | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TYPES — objets métier camelCase
// ─────────────────────────────────────────────────────────────────────────────

export interface FieldTeam {
  id: string;
  organizationId: string | null;
  teamType: TeamType;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface FieldTeamMember {
  id: string;
  teamId: string;
  userId: string;
  roleInTeam: TeamMemberRole;
  isActive: boolean;
  joinedAt: Date;
  leftAt: Date | null;
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

export interface CreateTeamPayload {
  name: string;
  teamType: TeamType;
  /** Requis si teamType = provider ; null si institution */
  organizationId?: string | null;
}

export interface UpdateTeamPayload {
  name?: string;
  isActive?: boolean;
  teamType?: TeamType;
  organizationId?: string | null;
}