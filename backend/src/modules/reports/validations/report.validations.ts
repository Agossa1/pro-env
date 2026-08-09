/*
 * |--------------------------------------------------------------------------
 * | REPORT VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Reports.
 * |--------------------------------------------------------------------------
 */

import { z } from 'zod';
import {
  IssueCategory,
  ReportStatus,
  PriorityLevel,
  RiskLevel,
  WaterFlowStatus,
} from '../types/report.enums';

const IssueCategoryEnum = z.enum(Object.values(IssueCategory) as [string, ...string[]]);
const StatusEnum = z.enum(Object.values(ReportStatus) as [string, ...string[]]);
const PriorityEnum = z.enum(Object.values(PriorityLevel) as [string, ...string[]]);
const RiskEnum = z.enum(Object.values(RiskLevel) as [string, ...string[]]);
const FlowStatusEnum = z.enum(Object.values(WaterFlowStatus) as [string, ...string[]]);

export const CreateReportSchema = z.object({
  territoryId: z.string().uuid("Le territoire doit être un UUID valide"),
  infrastructureId: z.string().uuid("L'infrastructure doit être un UUID valide").nullable().optional(),
  mappedAreaId: z.string().uuid("La zone cartographiée doit être un UUID valide").nullable().optional(),
  title: z.string().min(1, 'Le titre est requis').max(255, 'Le titre ne doit pas dépasser 255 caractères'),
  description: z.string().max(2000, 'La description ne doit pas dépasser 2000 caractères').nullable().optional(),
  issueCategory: IssueCategoryEnum,
  priority: PriorityEnum.optional(),
  riskLevel: RiskEnum.optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  slaHours: z.number().int().positive().optional(),
  status: StatusEnum.optional(),
  details: z
    .object({
      blockageLevelPct: z.number().min(0).max(100).optional(),
      waterLevelCm: z.number().min(0).optional(),
      flowStatus: FlowStatusEnum.optional(),
      damageSurfaceM2: z.number().min(0).optional(),
      potholeDepthCm: z.number().min(0).optional(),
      estimatedVolumeM3: z.number().min(0).optional(),
      wasteType: z.string().max(100).optional(),
      speciesName: z.string().max(255).optional(),
      observationType: z.string().max(50).optional(),
      count: z.number().int().min(0).optional(),
      sensorId: z.string().uuid("Le capteur doit être un UUID valide").optional(),
      measuredValue: z.number().optional(),
      unit: z.string().max(20).optional(),
    })
    .nullable()
    .optional(),
});

export const UpdateReportSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).nullable().optional(),
  issueCategory: IssueCategoryEnum.optional(),
  priority: PriorityEnum.optional(),
  riskLevel: RiskEnum.optional(),
  status: StatusEnum.optional(),
  assignedTo: z.string().uuid("L'assignataire doit être un UUID valide").nullable().optional(),
  resolvedAt: z.coerce.date().nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

export const IdParamSchema = z.object({
  id: z.string().uuid("L'identifiant doit être un UUID valide"),
});