// ─────────────────────────────────────────────────────────────────────────────
// SOCIETES TYPES — miroir du backend (societe.enums.ts + societe.types.ts)
// ─────────────────────────────────────────────────────────────────────────────

export const SocieteType = {
  PUBLIC_COMPANY: 'PUBLIC_COMPANY',
  PRIVATE_COMPANY: 'PRIVATE_COMPANY',
  UTILITY: 'UTILITY',
  NGO: 'NGO',
} as const;
export type SocieteType = typeof SocieteType[keyof typeof SocieteType];

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AppSociete {
  id: string;
  name: string;
  type: SocieteType;
  registrationNumber: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SocieteTerritory {
  id: string;
  societeId: string;
  municipalityId: string | null;
  isActive: boolean;
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

export interface CreateSocietePayload {
  name: string;
  type: SocieteType;
  registrationNumber?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  /** Commune (zone de compétence) à associer à la société */
  municipalityId?: string | null;
}

export interface UpdateSocietePayload {
  name?: string;
  type?: SocieteType;
  registrationNumber?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  isActive?: boolean;
}
