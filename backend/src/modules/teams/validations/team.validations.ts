/*
 * |--------------------------------------------------------------------------
 * | TEAM VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Teams.
 * |--------------------------------------------------------------------------
 */

import { z } from 'zod';
import { TeamType, TeamMemberRole } from '../types/team.enums';

const TeamTypeEnum = z.enum(Object.values(TeamType) as [string, ...string[]]);
const RoleEnum = z.enum(Object.values(TeamMemberRole) as [string, ...string[]]);

export const CreateTeamSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(255),
  teamType: TeamTypeEnum,
  organizationId: z
    .string()
    .uuid("La société doit être un UUID valide")
    .nullable()
    .optional(),
});

export const UpdateTeamSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  isActive: z.boolean().optional(),
  teamType: TeamTypeEnum.optional(),
  organizationId: z
    .string()
    .uuid("La société doit être un UUID valide")
    .nullable()
    .optional(),
});

export const AddMemberSchema = z.object({
  userId: z.string().uuid("L'utilisateur doit être un UUID valide"),
  role: RoleEnum.optional(),
});

export const IdParamSchema = z.object({
  id: z.string().uuid("L'identifiant doit être un UUID valide"),
});

export const MemberIdParamSchema = z.object({
  memberId: z.string().uuid("Le membre doit être un UUID valide"),
});