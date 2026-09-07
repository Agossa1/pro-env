/*
 * |--------------------------------------------------------------------------
 * | MISSION TYPES
 * |--------------------------------------------------------------------------
 * | Row types   → structure brute PostgreSQL (snake_case)
 * | Domain types → objets métier camelCase (services & controllers)
 * | Payload types → données d'entrée vers le repository
 * |--------------------------------------------------------------------------
 */

import { MissionType, MissionStatus, PriorityLevel } from './mission.enums';

// ─────────────────────────────────────────────────────────────────────────────
// ROW TYPES — structure brute PostgreSQL (snake_case)
// ─────────────────────────────────────────────────────────────────────────────

export interface MissionRow {
  id: string;
  territory_id: string;
  report_id: string | null;
  infrastructure_id: string | null;
  mission_type: MissionType;
  priority_level: PriorityLevel;
  title: string;
  description: string | null;
  status: MissionStatus;
  assigned_organization_id: string | null;
  assigned_team_id: string | null;
  rejected_reason: string | null;
  scheduled_at: Date | null;
  due_date: Date | null;
  completed_at: Date | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  location: any;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface MissionChecklistRow {
  id: string;
  mission_id: string;
  label: string;
  done: boolean;
  done_by: string | null;
  done_at: Date | null;
  sort_order: number;
  created_at: Date;
}

export interface MissionAssignmentRow {
  id: string;
  mission_id: string;
  user_id: string;
  assigned_by: string | null;
  is_active: boolean;
  assigned_at: Date;
  unassigned_at: Date | null;
}

export interface MissionReportRow {
  id: string;
  mission_id: string;
  submitted_by: string;
  report: string | null;
  completion_percentage: number | null;
  created_at: Date;
}

export interface MissionStatusHistoryRow {
  id: string;
  mission_id: string;
  old_status: MissionStatus | null;
  new_status: MissionStatus;
  changed_by: string | null;
  created_at: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TYPES — objets métier camelCase
// ─────────────────────────────────────────────────────────────────────────────

export interface Mission {
  id: string;
  territoryId: string;
  territoryName?: string;
  reportId: string | null;
  infrastructureId: string | null;
  missionType: MissionType;
  priorityLevel: PriorityLevel;
  title: string;
  description: string | null;
  status: MissionStatus;
  assignedOrganizationId: string | null;
  assignedTeamId: string | null;
  rejectedReason: string | null;
  scheduledAt: Date | null;
  dueDate: Date | null;
  completedAt: Date | null;
  estimatedHours: number | null;
  actualHours: number | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface MissionChecklistItem {
  id: string;
  missionId: string;
  label: string;
  done: boolean;
  doneBy: string | null;
  doneAt: Date | null;
  sortOrder: number;
  createdAt: Date;
}

export interface MissionAssignment {
  id: string;
  missionId: string;
  userId: string;
  assignedBy: string | null;
  isActive: boolean;
  assignedAt: Date;
  unassignedAt: Date | null;
}

export interface MissionReport {
  id: string;
  missionId: string;
  submittedBy: string;
  report: string | null;
  completionPercentage: number | null;
  createdAt: Date;
}

export interface MissionStatusHistory {
  id: string;
  missionId: string;
  oldStatus: MissionStatus | null;
  newStatus: MissionStatus;
  changedBy: string | null;
  createdAt: Date;
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

export interface CreateMissionPayload {
  territoryId: string;
  reportId?: string | null;
  infrastructureId?: string | null;
  missionType: MissionType;
  priorityLevel?: PriorityLevel;
  title: string;
  description?: string | null;
  status?: MissionStatus;
  assignedOrganizationId?: string | null;
  scheduledAt?: Date | null;
  dueDate?: Date | null;
  estimatedHours?: number | null;
  createdBy?: string | null;
}

export interface UpdateMissionPayload {
  title?: string;
  description?: string | null;
  infrastructureId?: string | null;
  missionType?: MissionType;
  priorityLevel?: PriorityLevel;
  status?: MissionStatus;
  assignedOrganizationId?: string | null;
  assignedTeamId?: string | null;
  rejectedReason?: string | null;
  scheduledAt?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
}