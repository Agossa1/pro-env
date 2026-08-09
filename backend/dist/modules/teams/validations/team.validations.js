"use strict";
/*
 * |--------------------------------------------------------------------------
 * | TEAM VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Teams.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberIdParamSchema = exports.IdParamSchema = exports.AddMemberSchema = exports.UpdateTeamSchema = exports.CreateTeamSchema = void 0;
const zod_1 = require("zod");
const team_enums_1 = require("../types/team.enums");
const TeamTypeEnum = zod_1.z.enum(Object.values(team_enums_1.TeamType));
const RoleEnum = zod_1.z.enum(Object.values(team_enums_1.TeamMemberRole));
exports.CreateTeamSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Le nom est requis').max(255),
    teamType: TeamTypeEnum,
    organizationId: zod_1.z
        .string()
        .uuid("La société doit être un UUID valide")
        .nullable()
        .optional(),
});
exports.UpdateTeamSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    isActive: zod_1.z.boolean().optional(),
    teamType: TeamTypeEnum.optional(),
    organizationId: zod_1.z
        .string()
        .uuid("La société doit être un UUID valide")
        .nullable()
        .optional(),
});
exports.AddMemberSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid("L'utilisateur doit être un UUID valide"),
    role: RoleEnum.optional(),
});
exports.IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("L'identifiant doit être un UUID valide"),
});
exports.MemberIdParamSchema = zod_1.z.object({
    memberId: zod_1.z.string().uuid("Le membre doit être un UUID valide"),
});
//# sourceMappingURL=team.validations.js.map