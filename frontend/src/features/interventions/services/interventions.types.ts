export const InterventionStatus = {
  NOT_STARTED: 'not_started',
  STARTED: 'started',
  PAUSED: 'paused',
  RESUMED: 'resumed',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;
export type InterventionStatus = typeof InterventionStatus[keyof typeof InterventionStatus];

export interface Intervention {
  id: string;
  missionId: string;
  assignedTeamId: string;
  assignedToUserId: string | null;
  interventionType: string;
  status: InterventionStatus;
  vehicleNotes: string | null;
  equipmentNotes: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FieldInterventionReport {
  id: string;
  interventionId: string;
  reportId: string | null;
  createdBy: string;
  workDone: string | null;
  blockageRemovedPct: number | null;
  finalConditionScore: number | null;
  recommendations: string | null;
  completed: boolean;
  createdAt: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateInterventionPayload {
  missionId: string;
  assignedSocieteId: string;
  assignedToUserId?: string | null;
  interventionType: string;
  vehicleNotes?: string | null;
  equipmentNotes?: string | null;
}

export interface UpdateInterventionPayload {
  status?: InterventionStatus;
  assignedToUserId?: string | null;
  vehicleNotes?: string | null;
  equipmentNotes?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
}

export interface CreateFieldReportPayload {
  interventionId: string;
  reportId?: string | null;
  workDone?: string | null;
  blockageRemovedPct?: number | null;
  finalConditionScore?: number | null;
  recommendations?: string | null;
  completed?: boolean;
}
