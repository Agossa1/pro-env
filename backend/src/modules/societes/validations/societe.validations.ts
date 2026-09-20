/*
 * |--------------------------------------------------------------------------
 * | SOCIETE VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Societes.
 * |--------------------------------------------------------------------------
 */

import { z } from 'zod';
import { SocieteType } from '../types/societe.enums';

/** Liste des types valides pour une société */
const TypeEnum = z.enum(Object.values(SocieteType) as [string, ...string[]]);

export const CreateSocieteSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom ne doit pas dépasser 255 caractères'),
  type: TypeEnum,
  registrationNumber: z
    .string()
    .max(100, 'Le n° d\'enregistrement ne doit pas dépasser 100 caractères')
    .nullable()
    .optional(),
  contactEmail: z.string().email('Email invalide'),
  contactPhone: z.string().max(20, 'Le téléphone ne doit pas dépasser 20 caractères').nullable().optional(),
  isActive: z.boolean().optional(),
  // Commune (zone de compétence) à laquelle associer la société.
  // Optionnel : si absent, aucune association n'est créée.
  municipalityId: z
    .string()
    .uuid("La commune d'association doit être un UUID valide")
    .nullable()
    .optional(),
});

export const UpdateSocieteSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255).optional(),
  type: TypeEnum.optional(),
  registrationNumber: z.string().max(100).nullable().optional(),
  contactEmail: z.string().email('Email invalide').nullable().optional(),
  contactPhone: z.string().max(20).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const IdParamSchema = z.object({
  id: z.string().uuid("L'identifiant doit être un UUID valide"),
});

export const RegistrationNumberParamSchema = z.object({
  registrationNumber: z.string().min(1, 'Le n° d\'enregistrement est requis'),
});