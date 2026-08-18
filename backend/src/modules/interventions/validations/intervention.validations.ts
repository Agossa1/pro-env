/*
 * |--------------------------------------------------------------------------
 * | INTERVENTION VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Interventions.
 * |--------------------------------------------------------------------------
 */

import { z } from 'zod';
import { InterventionStatus } from '../types/intervention.enums';

const StatusEnum = z.enum(Object.values(InterventionStatus) as [string, ...string[]]);

export const CreateInterventionSchema = z.object({
  missionId: z.string().uuid("La mission doit être un UUID valide"),
  assignedSocieteId: z.string().uuid("La société doit être un UUID valide"),
  assignedToUserId: z.string().uuid("L'utilisateur doit être un UUID valide").nullable().optional(),
  interventionType: z.string().min(1, 'Le type d\'intervention est requis').max(100),
  vehicleNotes: z.string().nullable().optional(),
  equipmentNotes: z.string().nullable().optional(),
});

export const UpdateInterventionSchema = z.object({
  status: StatusEnum.optional(),
  assignedToUserId: z.string().uuid("L'utilisateur doit être un UUID valide").nullable().optional(),
  vehicleNotes: z.string().nullable().optional(),
  equipmentNotes: z.string().nullable().optional(),
  startedAt: z.coerce.date().nullable().optional(),
  endedAt: z.coerce.date().nullable().optional(),
});

export const CreateFieldReportSchema = z.object({
  reportId: z.string().uuid("Le rapport doit être un UUID valide").nullable().optional(),
  workDone: z.string().nullable().optional(),
  blockageRemovedPct: z.number().min(0).max(100).nullable().optional(),
  finalConditionScore: z.number().min(0).max(100).nullable().optional(),
  recommendations: z.string().nullable().optional(),
  completed: z.boolean().optional(),
});

export const IdParamSchema = z.object({
  id: z.string().uuid("L'identifiant doit être un UUID valide"),
});