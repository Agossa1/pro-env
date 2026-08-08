/*
 * |--------------------------------------------------------------------------
 * | MEDIA VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Media.
 * |--------------------------------------------------------------------------
 */

import { z } from 'zod';
import { MediaModule } from '../types/media.enums';

const ModuleEnum = z.enum(Object.values(MediaModule) as [string, ...string[]]);

export const UploadMediaSchema = z.object({
  module: ModuleEnum.nullable().optional(),
  entityId: z.string().uuid("L'entité doit être un UUID valide").nullable().optional(),
});

export const IdParamSchema = z.object({
  id: z.string().uuid("L'identifiant doit être un UUID valide"),
});

export const EntityIdParamSchema = z.object({
  entityId: z.string().uuid("L'entité doit être un UUID valide"),
});