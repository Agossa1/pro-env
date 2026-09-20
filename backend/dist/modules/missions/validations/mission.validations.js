"use strict";
/*
 * |--------------------------------------------------------------------------
 * | MISSION VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Missions.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdParamSchema = exports.AssignUserSchema = exports.ChecklistItemSchema = exports.UpdateMissionSchema = exports.CreateMissionSchema = void 0;
const zod_1 = require("zod");
const mission_enums_1 = require("../types/mission.enums");
const MissionTypeEnum = zod_1.z.enum(Object.values(mission_enums_1.MissionType));
const StatusEnum = zod_1.z.enum(Object.values(mission_enums_1.MissionStatus));
const PriorityEnum = zod_1.z.enum(Object.values(mission_enums_1.PriorityLevel));
exports.CreateMissionSchema = zod_1.z.object({
    municipalityId: zod_1.z.string().uuid("Le territoire doit être un UUID valide"),
    reportId: zod_1.z.string().uuid("Le rapport doit être un UUID valide").nullable().optional(),
    infrastructureId: zod_1.z.string().uuid("L'infrastructure doit être un UUID valide").nullable().optional(),
    missionType: MissionTypeEnum,
    priorityLevel: PriorityEnum.optional(),
    title: zod_1.z.string().min(1, 'Le titre est requis').max(255, 'Le titre ne doit pas dépasser 255 caractères'),
    description: zod_1.z.string().max(2000).nullable().optional(),
    status: StatusEnum.optional(),
    assignedOrganizationId: zod_1.z.string().uuid("La société doit être un UUID valide").nullable().optional(),
    scheduledAt: zod_1.z.coerce.date().nullable().optional(),
    dueDate: zod_1.z.coerce.date().nullable().optional(),
    estimatedHours: zod_1.z.number().min(0).nullable().optional(),
});
exports.UpdateMissionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(255).optional(),
    description: zod_1.z.string().max(2000).nullable().optional(),
    infrastructureId: zod_1.z.string().uuid("L'infrastructure doit être un UUID valide").nullable().optional(),
    missionType: MissionTypeEnum.optional(),
    priorityLevel: PriorityEnum.optional(),
    status: StatusEnum.optional(),
    assignedOrganizationId: zod_1.z.string().uuid("La société doit être un UUID valide").nullable().optional(),
    assignedTeamId: zod_1.z.string().uuid("L'équipe doit être un UUID valide").nullable().optional(),
    rejectedReason: zod_1.z.string().nullable().optional(),
    scheduledAt: zod_1.z.coerce.date().nullable().optional(),
    dueDate: zod_1.z.coerce.date().nullable().optional(),
    completedAt: zod_1.z.coerce.date().nullable().optional(),
    estimatedHours: zod_1.z.number().min(0).nullable().optional(),
    actualHours: zod_1.z.number().min(0).nullable().optional(),
});
exports.ChecklistItemSchema = zod_1.z.object({
    label: zod_1.z.string().min(1, 'Le libellé est requis').max(255),
});
exports.AssignUserSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid("L'utilisateur doit être un UUID valide"),
});
exports.IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("L'identifiant doit être un UUID valide"),
});
//# sourceMappingURL=mission.validations.js.map