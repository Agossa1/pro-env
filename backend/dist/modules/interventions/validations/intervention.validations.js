"use strict";
/*
 * |--------------------------------------------------------------------------
 * | INTERVENTION VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Interventions.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdParamSchema = exports.CreateFieldReportSchema = exports.UpdateInterventionSchema = exports.CreateInterventionSchema = void 0;
const zod_1 = require("zod");
const intervention_enums_1 = require("../types/intervention.enums");
const StatusEnum = zod_1.z.enum(Object.values(intervention_enums_1.InterventionStatus));
exports.CreateInterventionSchema = zod_1.z.object({
    missionId: zod_1.z.string().uuid("La mission doit être un UUID valide"),
    assignedTeamId: zod_1.z.string().uuid("L'équipe doit être un UUID valide"),
    assignedToUserId: zod_1.z.string().uuid("L'utilisateur doit être un UUID valide").nullable().optional(),
    interventionType: zod_1.z.string().min(1, 'Le type d\'intervention est requis').max(100),
    vehicleNotes: zod_1.z.string().nullable().optional(),
    equipmentNotes: zod_1.z.string().nullable().optional(),
});
exports.UpdateInterventionSchema = zod_1.z.object({
    status: StatusEnum.optional(),
    assignedToUserId: zod_1.z.string().uuid("L'utilisateur doit être un UUID valide").nullable().optional(),
    vehicleNotes: zod_1.z.string().nullable().optional(),
    equipmentNotes: zod_1.z.string().nullable().optional(),
    startedAt: zod_1.z.coerce.date().nullable().optional(),
    endedAt: zod_1.z.coerce.date().nullable().optional(),
});
exports.CreateFieldReportSchema = zod_1.z.object({
    reportId: zod_1.z.string().uuid("Le rapport doit être un UUID valide").nullable().optional(),
    workDone: zod_1.z.string().nullable().optional(),
    blockageRemovedPct: zod_1.z.number().min(0).max(100).nullable().optional(),
    finalConditionScore: zod_1.z.number().min(0).max(100).nullable().optional(),
    recommendations: zod_1.z.string().nullable().optional(),
    completed: zod_1.z.boolean().optional(),
});
exports.IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("L'identifiant doit être un UUID valide"),
});
//# sourceMappingURL=intervention.validations.js.map