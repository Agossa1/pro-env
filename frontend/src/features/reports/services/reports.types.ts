export const IssueCategory = {
  DRAINAGE: 'drainage',
  ROAD: 'road',
  WASTE: 'waste',
  BIODIVERSITY: 'biodiversity',
  ENVIRONMENT: 'environment',
  OTHER: 'other',
} as const;

export type IssueCategory = typeof IssueCategory[keyof typeof IssueCategory];

export const ReportStatus = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  ARCHIVED: 'archived',
} as const;

export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];

export const PriorityLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical',
} as const;

export type PriorityLevel = typeof PriorityLevel[keyof typeof PriorityLevel];

export const RiskLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type RiskLevel = typeof RiskLevel[keyof typeof RiskLevel];

export const WaterFlowStatus = {
  FREE: 'free',
  RESTRICTED: 'restricted',
  BLOCKED: 'blocked',
} as const;

export type WaterFlowStatus = typeof WaterFlowStatus[keyof typeof WaterFlowStatus];

export interface Report {
  id: string;
  territoryId: string;
  infrastructureId: string | null;
  mappedAreaId: string | null;
  title: string;
  description: string | null;
  issueCategory: IssueCategory;
  priority: PriorityLevel;
  riskLevel: RiskLevel;
  status: ReportStatus;
  latitude: number | null;
  longitude: number | null;
  createdBy: string;
  reportedAt: string;
  assignedTo: string | null;
  resolvedAt: string | null;
  slaHours: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  /** Nom complet du créateur (JOIN auth) */
  createdByName?: string | null;
  /** Nom du rôle du créateur (JOIN roles) */
  createdByRole?: string | null;
  /** Nom du territoire (JOIN territories) */
  territoryName?: string | null;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportDetailsPayload {
  blockageLevelPct?: number;
  waterLevelCm?: number;
  flowStatus?: WaterFlowStatus;
  damageSurfaceM2?: number;
  potholeDepthCm?: number;
  estimatedVolumeM3?: number;
  wasteType?: string;
  speciesName?: string;
  observationType?: string;
  count?: number;
  sensorId?: string;
  measuredValue?: number;
  unit?: string;
}

export interface CreateReportPayload {
  territoryId: string;
  infrastructureId?: string | null;
  mappedAreaId?: string | null;
  title: string;
  description?: string | null;
  issueCategory: IssueCategory;
  priority?: PriorityLevel;
  riskLevel?: RiskLevel;
  latitude?: number | null;
  longitude?: number | null;
  slaHours?: number;
  status?: ReportStatus;
  details?: ReportDetailsPayload | null;
}

export interface UpdateReportPayload {
  title?: string;
  description?: string | null;
  issueCategory?: IssueCategory;
  priority?: PriorityLevel;
  riskLevel?: RiskLevel;
  status?: ReportStatus;
  assignedTo?: string | null;
  resolvedAt?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}
