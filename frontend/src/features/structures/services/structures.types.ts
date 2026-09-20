// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURES TYPES — miroir du backend (infrastructure.enums.ts + types.ts)
// ─────────────────────────────────────────────────────────────────────────────

export const InfrastructureType = {
  DRAIN: 'drain',
  ROAD: 'road',
  BRIDGE: 'bridge',
  WATER_PIPE: 'water_pipe',
  SEWER_PIPE: 'sewer_pipe',
  STREETLIGHT: 'streetlight',
  WASTE_BIN: 'waste_bin',
  WELL: 'well',
  MARKET: 'market',
  SCHOOL: 'school',
  HEALTH_CENTER: 'health_center',
  PUBLIC_TOILET: 'public_toilet',
  PARK: 'park',
  OTHER: 'other',
} as const;
export type InfrastructureType = typeof InfrastructureType[keyof typeof InfrastructureType];

export const InfrastructureCondition = {
  NEW: 'new',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  CRITICAL: 'critical',
  DESTROYED: 'destroyed',
} as const;
export type InfrastructureCondition = typeof InfrastructureCondition[keyof typeof InfrastructureCondition];

export const InfrastructureStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ARCHIVED: 'ARCHIVED',
} as const;
export type InfrastructureStatus = typeof InfrastructureStatus[keyof typeof InfrastructureStatus];

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Structure {
  id: string;
  /** Commune de rattachement (découpage administratif 4 niveaux) */
  municipalityId: string | null;
  districtId: string | null;
  neighborhoodId: string | null;
  /** Nom de la commune (JOIN municipalities) */
  municipalityName?: string | null;
  /** Libellé du territoire de rattachement */
  territoryName?: string | null;
  mappedAreaId: string | null;
  name: string;
  referenceCode: string | null;
  type: InfrastructureType;
  condition: InfrastructureCondition;
  status: InfrastructureStatus;
  description: string | null;
  material: string | null;
  dimensions: Record<string, unknown> | null;
  installationDate: string | null;
  lastMaintainedAt: string | null;
  location: any;
  geometry: any;
  latitude: number | null;
  longitude: number | null;
  metadata: Record<string, unknown> | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
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

export interface CreateStructurePayload {
  /** Commune de rattachement de la structure */
  municipalityId: string;
  districtId?: string | null;
  neighborhoodId?: string | null;
  mappedAreaId?: string | null;
  name: string;
  referenceCode?: string | null;
  type: InfrastructureType;
  condition?: InfrastructureCondition;
  status?: InfrastructureStatus;
  description?: string | null;
  material?: string | null;
  dimensions?: Record<string, unknown> | null;
  installationDate?: string | null;
  lastMaintainedAt?: string | null;
  location?: any;
  geometry?: any;
  latitude?: number | null;
  longitude?: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface UpdateStructurePayload {
  name?: string;
  referenceCode?: string | null;
  type?: InfrastructureType;
  condition?: InfrastructureCondition;
  status?: InfrastructureStatus;
  description?: string | null;
  material?: string | null;
  dimensions?: Record<string, unknown> | null;
  installationDate?: string | null;
  lastMaintainedAt?: string | null;
  location?: any;
  geometry?: any;
  latitude?: number | null;
  longitude?: number | null;
  metadata?: Record<string, unknown> | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA TYPES — photos attachées à une structure
// ─────────────────────────────────────────────────────────────────────────────

export interface StructureMedia {
  id: string;
  fileName: string;
  storagePath: string; // URL Cloudinary publique
  publicId: string;    // ID Cloudinary (pour la suppression)
  mimeType: string;
  sizeBytes: number;
  uploadedBy: string | null;
  createdAt: string;
}