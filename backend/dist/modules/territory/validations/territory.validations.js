"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeParamSchema = exports.IdParamSchema = exports.CreateTerritorySchema = exports.GeoJsonSchema = exports.UpdateTerritoryTypeSchema = exports.CreateTerritoryTypeSchema = void 0;
const zod_1 = require("zod");
exports.CreateTerritoryTypeSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Le code du type de territoire est requis'),
    name: zod_1.z.string().min(1, 'Le nom du type de territoire est requis'),
    hierarchyLevel: zod_1.z.number().int().min(0, 'Le niveau hiérarchique doit être >= 0'),
});
exports.UpdateTerritoryTypeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Le nom du type de territoire est requis').optional(),
    hierarchyLevel: zod_1.z.number().int().min(0, 'Le niveau hiérarchique doit être >= 0').optional(),
});
/** GeoJSON (Feature ou Geometry) minimal pour l'upload d'un territoire */
exports.GeoJsonSchema = zod_1.z.record(zod_1.z.string(), zod_1.z.any());
exports.CreateTerritorySchema = zod_1.z.object({
    territoryTypeId: zod_1.z.string().uuid("Le type de territoire doit être un UUID valide"),
    parentTerritoryId: zod_1.z.string().uuid("Le parent doit être un UUID valide").nullable().optional(),
    organizationId: zod_1.z.string().uuid("L'organisation doit être un UUID valide").nullable().optional(),
    code: zod_1.z.string().min(1, 'Le code est requis').optional(),
    name: zod_1.z.string().min(1, 'Le nom du territoire est requis'),
    geometry: exports.GeoJsonSchema.optional(),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    initialSector: zod_1.z
        .object({
        name: zod_1.z.string().min(1, 'Le nom du secteur est requis'),
        geometry: exports.GeoJsonSchema.optional(),
    })
        .nullable()
        .optional(),
    assignOrganizationId: zod_1.z.string().uuid("L'organisation assignée doit être un UUID valide").nullable().optional(),
});
exports.IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("L'identifiant doit être un UUID valide"),
});
exports.CodeParamSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Le code est requis'),
});
//# sourceMappingURL=territory.validations.js.map