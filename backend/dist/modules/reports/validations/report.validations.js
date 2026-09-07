"use strict";
/*
 * |--------------------------------------------------------------------------
 * | REPORT VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Reports.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdParamSchema = exports.UpdateReportSchema = exports.CreateReportSchema = void 0;
const zod_1 = require("zod");
const report_enums_1 = require("../types/report.enums");
const IssueCategoryEnum = zod_1.z.enum(Object.values(report_enums_1.IssueCategory));
const StatusEnum = zod_1.z.enum(Object.values(report_enums_1.ReportStatus));
const PriorityEnum = zod_1.z.enum(Object.values(report_enums_1.PriorityLevel));
const RiskEnum = zod_1.z.enum(Object.values(report_enums_1.RiskLevel));
const FlowStatusEnum = zod_1.z.enum(Object.values(report_enums_1.WaterFlowStatus));
exports.CreateReportSchema = zod_1.z.object({
    territoryId: zod_1.z.string().uuid("Le territoire doit être un UUID valide"),
    infrastructureId: zod_1.z.string().uuid("L'infrastructure doit être un UUID valide").nullable().optional(),
    mappedAreaId: zod_1.z.string().uuid("La zone cartographiée doit être un UUID valide").nullable().optional(),
    title: zod_1.z.string().min(1, 'Le titre est requis').max(255, 'Le titre ne doit pas dépasser 255 caractères'),
    description: zod_1.z.string().max(2000, 'La description ne doit pas dépasser 2000 caractères').nullable().optional(),
    issueCategory: IssueCategoryEnum,
    priority: PriorityEnum.optional(),
    riskLevel: RiskEnum.optional(),
    latitude: zod_1.z.number().min(-90).max(90).nullable().optional(),
    longitude: zod_1.z.number().min(-180).max(180).nullable().optional(),
    slaHours: zod_1.z.number().int().positive().optional(),
    status: StatusEnum.optional(),
    details: zod_1.z
        .object({
        blockageLevelPct: zod_1.z.number().min(0).max(100).optional(),
        waterLevelCm: zod_1.z.number().min(0).optional(),
        flowStatus: FlowStatusEnum.optional(),
        damageSurfaceM2: zod_1.z.number().min(0).optional(),
        potholeDepthCm: zod_1.z.number().min(0).optional(),
        estimatedVolumeM3: zod_1.z.number().min(0).optional(),
        wasteType: zod_1.z.string().max(100).optional(),
        speciesName: zod_1.z.string().max(255).optional(),
        observationType: zod_1.z.string().max(50).optional(),
        count: zod_1.z.number().int().min(0).optional(),
        sensorId: zod_1.z.string().uuid("Le capteur doit être un UUID valide").optional(),
        measuredValue: zod_1.z.number().optional(),
        unit: zod_1.z.string().max(20).optional(),
    })
        .nullable()
        .optional(),
});
exports.UpdateReportSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255).optional(),
    description: zod_1.z.string().max(2000).nullable().optional(),
    issueCategory: IssueCategoryEnum.optional(),
    priority: PriorityEnum.optional(),
    riskLevel: RiskEnum.optional(),
    status: StatusEnum.optional(),
    assignedTo: zod_1.z.string().uuid("L'assignataire doit être un UUID valide").nullable().optional(),
    resolvedAt: zod_1.z.coerce.date().nullable().optional(),
    latitude: zod_1.z.number().min(-90).max(90).nullable().optional(),
    longitude: zod_1.z.number().min(-180).max(180).nullable().optional(),
    infrastructureId: zod_1.z.string().uuid("L'infrastructure doit être un UUID valide").nullable().optional(),
});
exports.IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("L'identifiant doit être un UUID valide"),
});
//# sourceMappingURL=report.validations.js.map