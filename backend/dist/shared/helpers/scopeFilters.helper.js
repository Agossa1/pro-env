"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScopeFilters = getScopeFilters;
/**
 * Rôles dont la visibilité est restreinte par territoire (commune ou département).
 */
const TERRITORY_RESTRICTED_ROLES = ['admin_mairie', 'prefecture', 'technicien'];
/**
 * Rôles dont la visibilité est restreinte à leurs propres créations.
 */
const CREATOR_RESTRICTED_ROLES = ['technicien'];
/**
 * Retourne les filtres d'accès à appliquer automatiquement selon le rôle de l'utilisateur.
 */
function getScopeFilters(req) {
    const user = req.user;
    if (!user)
        return {};
    const role = user.roleCode;
    let filters = {};
    if (TERRITORY_RESTRICTED_ROLES.includes(role)) {
        // Si l'utilisateur n'a pas de territoire assigné, on lui met une valeur qui ne matchera rien
        // au lieu de le laisser voir tout le pays (fail-safe).
        if (user.neighborhoodId)
            filters.forcedNeighborhoodId = user.neighborhoodId;
        else if (user.districtId)
            filters.forcedDistrictId = user.districtId;
        else if (user.municipalityId)
            filters.forcedMunicipalityId = user.municipalityId;
        else if (user.regionId)
            filters.forcedRegionId = user.regionId;
        else
            filters.forcedRegionId = '00000000-0000-0000-0000-000000000000';
    }
    if (CREATOR_RESTRICTED_ROLES.includes(role)) {
        // Le technicien ne voit que les données liées à son équipe / ses créations
        filters.forcedCreatedBy = user.userId;
        filters.forcedUserIdForTeamScopes = user.userId;
    }
    return filters;
}
//# sourceMappingURL=scopeFilters.helper.js.map