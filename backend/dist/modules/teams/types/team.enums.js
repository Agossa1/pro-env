"use strict";
/*
 * |--------------------------------------------------------------------------
 * | TEAM ENUMS
 * |--------------------------------------------------------------------------
 * | Types d'équipes et rôles des membres. Reflète les enums PostgreSQL
 * | du module 10 (interventions) : role_tier_enum, team_member_role_enum.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMemberRole = exports.TeamType = void 0;
/** Deuxtypes d'équipes terrain */
var TeamType;
(function (TeamType) {
    /**
     * Équipe d'institution publique (mairie, ministère, préfecture).
     * Techniciens publics qui créent les signalements terrain.
     * organization_id = NULL.
     */
    TeamType["INSTITUTION"] = "institution";
    /**
     * Équipe d'une société prestataire (SONEB, SBEE, SGDS, BTP...).
     * Exécute les missions et interventions sur le terrain.
     * organization_id requis (FK organizations).
     */
    TeamType["PROVIDER"] = "provider";
})(TeamType || (exports.TeamType = TeamType = {}));
/** Rôle d'un membre dans une équipe */
var TeamMemberRole;
(function (TeamMemberRole) {
    TeamMemberRole["LEADER"] = "leader";
    TeamMemberRole["MEMBER"] = "member";
})(TeamMemberRole || (exports.TeamMemberRole = TeamMemberRole = {}));
//# sourceMappingURL=team.enums.js.map