export const TeamType = {
  INSTITUTION: 'institution',
  PROVIDER: 'provider',
} as const;

export type TeamType = typeof TeamType[keyof typeof TeamType];

export const TeamMemberRole = {
  COMMAND_LEAD: 'COMMAND_LEAD',
  OPS_OPERATOR: 'OPS_OPERATOR',
  LOG_OFFICER: 'LOG_OFFICER',
  SAFETY_OFFICER: 'SAFETY_OFFICER',
} as const;

export type TeamMemberRole = typeof TeamMemberRole[keyof typeof TeamMemberRole];

export interface FieldTeam {
  id: string;
  organizationId: string | null;
  teamType: TeamType;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface FieldTeamMember {
  id: string;
  teamId: string;
  userId: string;
  userFullName?: string;
  userEmail?: string;
  userPhone?: string | null;
  roleInTeam: TeamMemberRole;
  isActive: boolean;
  joinedAt: string;
  leftAt: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTeamPayload {
  name: string;
  teamType: TeamType;
  organizationId?: string | null;
}

export interface UpdateTeamPayload {
  name?: string;
  isActive?: boolean;
  teamType?: TeamType;
  organizationId?: string | null;
}

export interface AddTeamMemberPayload {
  fullName: string;
  email: string;
  phone?: string;
  roleInTeam: TeamMemberRole;
  organizationId?: string | null;
}