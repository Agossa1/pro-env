/*
 * |--------------------------------------------------------------------------
 * | MISSION VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Missions.
 * |--------------------------------------------------------------------------
 */

import { z } from 'zod';
import { MissionType, MissionStatus, PriorityLevel } from '../types/mission.enums';

const MissionTypeEnum = z.enum(Object.values(MissionType) as [string, ...string[]]);
const StatusEnum = z.enum(Object.values(MissionStatus) as [string, ...string[]]);
const PriorityEnum = z.enum(Object.values(PriorityLevel) as [string, ...string[]]);

export const CreateMissionSchema = z.object({
  municipalityId: z.string().uuid("Le territoire doit être un UUID valide"),
  reportId: z.string().uuid("Le rapport doit être un UUID valide").nullable().optional(),
  infrastructureId: z.string().uuid("L'infrastructure doit être un UUID valide").nullable().optional(),
  missionType: MissionTypeEnum,
  priorityLevel: PriorityEnum.optional(),
  title: z.string().min(1, 'Le titre est requis').max(255, 'Le titre ne doit pas dépasser 255 caractères'),
  description: z.string().max(2000).nullable().optional(),
  status: StatusEnum.optional(),
  assignedOrganizationId: z.string().uuid("La société doit être un UUID valide").nullable().optional(),
  scheduledAt: z.coerce.date().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  estimatedHours: z.number().min(0).nullable().optional(),
});

export const UpdateMissionSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  infrastructureId: z.string().uuid("L'infrastructure doit être un UUID valide").nullable().optional(),
  missionType: MissionTypeEnum.optional(),
  priorityLevel: PriorityEnum.optional(),
  status: StatusEnum.optional(),
  assignedOrganizationId: z.string().uuid("La société doit être un UUID valide").nullable().optional(),
  assignedTeamId: z.string().uuid("L'équipe doit être un UUID valide").nullable().optional(),
  rejectedReason: z.string().nullable().optional(),
  scheduledAt: z.coerce.date().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  completedAt: z.coerce.date().nullable().optional(),
  estimatedHours: z.number().min(0).nullable().optional(),
  actualHours: z.number().min(0).nullable().optional(),
});

export const ChecklistItemSchema = z.object({
  label: z.string().min(1, 'Le libellé est requis').max(255),
});

export const AssignUserSchema = z.object({
  userId: z.string().uuid("L'utilisateur doit être un UUID valide"),
});

export const IdParamSchema = z.object({
  id: z.string().uuid("L'identifiant doit être un UUID valide"),
});