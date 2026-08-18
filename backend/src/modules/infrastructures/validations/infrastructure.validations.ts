/*
 * |--------------------------------------------------------------------------
 * | INFRASTRUCTURE VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Infrastructures.
 * |--------------------------------------------------------------------------
 */

import { z } from 'zod';
import {
  InfrastructureType,
  InfrastructureCondition,
  InfrastructureStatus,
} from '../types/infrastructure.enums';

const TypeEnum = z.enum(Object.values(InfrastructureType) as [string, ...string[]]);
const ConditionEnum = z.enum(Object.values(InfrastructureCondition) as [string, ...string[]]);
const StatusEnum = z.enum(Object.values(InfrastructureStatus) as [string, ...string[]]);

export const CreateInfrastructureSchema = z.object({
  territoryId: z.string().uuid("Le territoire doit être un UUID valide"),
  mappedAreaId: z.string().uuid("La zone cartographiée doit être un UUID valide").nullable().optional(),
  name: z.string().min(1, 'Le nom est requis').max(255),
  referenceCode: z.string().max(100).nullable().optional(),
  type: TypeEnum,
  condition: ConditionEnum.optional(),
  status: StatusEnum.optional(),
  description: z.string().nullable().optional(),
  material: z.string().max(100).nullable().optional(),
  dimensions: z.record(z.string(), z.unknown()).nullable().optional(),
  installationDate: z.coerce.date().nullable().optional(),
  lastMaintainedAt: z.coerce.date().nullable().optional(),
  location: z.any().optional(),
  geometry: z.any().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const UpdateInfrastructureSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255).optional(),
  referenceCode: z.string().max(100).nullable().optional(),
  type: TypeEnum.optional(),
  condition: ConditionEnum.optional(),
  status: StatusEnum.optional(),
  description: z.string().nullable().optional(),
  material: z.string().max(100).nullable().optional(),
  dimensions: z.record(z.string(), z.unknown()).nullable().optional(),
  installationDate: z.coerce.date().nullable().optional(),
  lastMaintainedAt: z.coerce.date().nullable().optional(),
  location: z.any().optional(),
  geometry: z.any().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});

export const IdParamSchema = z.object({
  id: z.string().uuid("L'identifiant doit être un UUID valide"),
});