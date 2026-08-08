import { z } from 'zod';

export const CreateTerritoryTypeSchema = z.object({
  code: z.string().min(1, 'Le code du type de territoire est requis'),
  name: z.string().min(1, 'Le nom du type de territoire est requis'),
  hierarchyLevel: z.number().int().min(0, 'Le niveau hiérarchique doit être >= 0'),
});

export const UpdateTerritoryTypeSchema = z.object({
  name: z.string().min(1, 'Le nom du type de territoire est requis').optional(),
  hierarchyLevel: z.number().int().min(0, 'Le niveau hiérarchique doit être >= 0').optional(),
});

/** GeoJSON (Feature ou Geometry) minimal pour l'upload d'un territoire */
export const GeoJsonSchema = z.record(z.string(), z.any());

export const CreateTerritorySchema = z.object({
  territoryTypeId: z.string().uuid("Le type de territoire doit être un UUID valide"),
  parentTerritoryId: z.string().uuid("Le parent doit être un UUID valide").nullable().optional(),
  organizationId: z.string().uuid("L'organisation doit être un UUID valide").nullable().optional(),
  code: z.string().min(1, 'Le code est requis').optional(),
  name: z.string().min(1, 'Le nom du territoire est requis'),
  geometry: GeoJsonSchema.optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  initialSector: z
    .object({
      name: z.string().min(1, 'Le nom du secteur est requis'),
      geometry: GeoJsonSchema.optional(),
    })
    .nullable()
    .optional(),
  assignOrganizationId: z.string().uuid("L'organisation assignée doit être un UUID valide").nullable().optional(),
});

export const IdParamSchema = z.object({
  id: z.string().uuid("L'identifiant doit être un UUID valide"),
});

export const CodeParamSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
});