"use strict";
/*
 * |--------------------------------------------------------------------------
 * | INFRASTRUCTURE VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Infrastructures.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdParamSchema = exports.UpdateInfrastructureSchema = exports.CreateInfrastructureSchema = void 0;
const zod_1 = require("zod");
const infrastructure_enums_1 = require("../types/infrastructure.enums");
const TypeEnum = zod_1.z.enum(Object.values(infrastructure_enums_1.InfrastructureType));
const ConditionEnum = zod_1.z.enum(Object.values(infrastructure_enums_1.InfrastructureCondition));
const StatusEnum = zod_1.z.enum(Object.values(infrastructure_enums_1.InfrastructureStatus));
exports.CreateInfrastructureSchema = zod_1.z.object({
    municipalityId: zod_1.z.string().uuid("Le territoire doit être un UUID valide"),
    mappedAreaId: zod_1.z.string().uuid("La zone cartographiée doit être un UUID valide").nullable().optional(),
    name: zod_1.z.string().min(1, 'Le nom est requis').max(255),
    referenceCode: zod_1.z.string().max(100).nullable().optional(),
    type: TypeEnum,
    condition: ConditionEnum.optional(),
    status: StatusEnum.optional(),
    description: zod_1.z.string().nullable().optional(),
    material: zod_1.z.string().max(100).nullable().optional(),
    dimensions: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).nullable().optional(),
    installationDate: zod_1.z.coerce.date().nullable().optional(),
    lastMaintainedAt: zod_1.z.coerce.date().nullable().optional(),
    location: zod_1.z.any().optional(),
    geometry: zod_1.z.any().optional(),
    latitude: zod_1.z.number().min(-90).max(90).nullable().optional(),
    longitude: zod_1.z.number().min(-180).max(180).nullable().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).nullable().optional(),
});
exports.UpdateInfrastructureSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Le nom est requis').max(255).optional(),
    referenceCode: zod_1.z.string().max(100).nullable().optional(),
    type: TypeEnum.optional(),
    condition: ConditionEnum.optional(),
    status: StatusEnum.optional(),
    description: zod_1.z.string().nullable().optional(),
    material: zod_1.z.string().max(100).nullable().optional(),
    dimensions: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).nullable().optional(),
    installationDate: zod_1.z.coerce.date().nullable().optional(),
    lastMaintainedAt: zod_1.z.coerce.date().nullable().optional(),
    location: zod_1.z.any().optional(),
    geometry: zod_1.z.any().optional(),
    latitude: zod_1.z.number().min(-90).max(90).nullable().optional(),
    longitude: zod_1.z.number().min(-180).max(180).nullable().optional(),
    metadata: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).nullable().optional(),
});
exports.IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("L'identifiant doit être un UUID valide"),
});
//# sourceMappingURL=infrastructure.validations.js.map