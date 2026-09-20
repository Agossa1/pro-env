// ─────────────────────────────────────────────────────────────────────────────
// MISSIONS TYPES — miroir du backend (mission.enums.ts + mission.types.ts)
// ─────────────────────────────────────────────────────────────────────────────

export const MissionType = {
  REPAIR:       'repair',
  MAINTENANCE:  'maintenance',
  INSPECTION:   'inspection',
  CLEANING:     'cleaning',
  CONSTRUCTION: 'construction',
  OTHER:        'other',
} as const;
export type MissionType = typeof MissionType[keyof typeof MissionType];

export const MissionStatus = {
  DRAFT:       'draft',
  PLANNED:     'planned',
  ASSIGNED:    'assigned',
  ACCEPTED:    'accepted',
  REJECTED:    'rejected',
  IN_PROGRESS: 'in_progress',
  SUSPENDED:   'suspended',
  COMPLETED:   'completed',
  CANCELLED:   'cancelled',
  CLOSED:      'closed',
} as const;
export type MissionStatus = typeof MissionStatus[keyof typeof MissionStatus];

export const PriorityLevel = {
  LOW:      'low',
  MEDIUM:   'medium',
  HIGH:     'high',
  URGENT:   'urgent',
  CRITICAL: 'critical',
} as const;
export type PriorityLevel = typeof PriorityLevel[keyof typeof PriorityLevel];

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Mission {
  id: string;
  /** Commune d'intervention (découpage administratif 4 niveaux) */
  municipalityId: string | null;
  /** Nom de la commune (JOIN municipalities) */
  municipalityName?: string | null;
  /** Libellé du territoire d'intervention */
  territoryName?: string | null;
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
  scheduledAt: string | null;
  dueDate: string | null;
  completedAt: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface MissionChecklistItem {
  id: string;
  missionId: string;
  label: string;
  done: boolean;
  doneBy: string | null;
  doneAt: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface MissionAssignment {
  id: string;
  missionId: string;
  userId: string;
  assignedBy: string | null;
  isActive: boolean;
  assignedAt: string;
  unassignedAt: string | null;
}

export interface MissionStatusHistory {
  id: string;
  missionId: string;
  oldStatus: MissionStatus | null;
  newStatus: MissionStatus;
  changedBy: string | null;
  createdAt: string;
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
  municipalityId: string;
  reportId?: string | null;
  infrastructureId?: string | null;
  missionType: MissionType;
  priorityLevel?: PriorityLevel;
  title: string;
  description?: string | null;
  status?: MissionStatus;
  assignedOrganizationId?: string | null;
  scheduledAt?: string | null;
  dueDate?: string | null;
  estimatedHours?: number | null;
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
  scheduledAt?: string | null;
  dueDate?: string | null;
  completedAt?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
}
