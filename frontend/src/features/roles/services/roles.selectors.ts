/*
 * |--------------------------------------------------------------------------
 * | ROLES SELECTORS
 * |--------------------------------------------------------------------------
 * | Sélecteurs mémoïsés pour accéder au state des rôles.
 * |--------------------------------------------------------------------------
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../core/store';

// ─────────────────────────────────────────────────────────────────────────────
// Sélecteurs de base
// ─────────────────────────────────────────────────────────────────────────────

const selectRolesState = (state: RootState) => state.roles;

export const selectRoles         = (state: RootState) => state.roles.list;
export const selectSelectedRole  = (state: RootState) => state.roles.selected;
export const selectRolesStatus   = (state: RootState) => state.roles.status;
export const selectRolesMutating = (state: RootState) => state.roles.mutating;
export const selectRolesError    = (state: RootState) => state.roles.error;
export const selectRolesPagination = (state: RootState) => state.roles.pagination;

// ─────────────────────────────────────────────────────────────────────────────
// Sélecteurs dérivés (mémoïsés)
// ─────────────────────────────────────────────────────────────────────────────

/** Indique si les rôles sont en cours de chargement. */
export const selectRolesLoading = createSelector(
  selectRolesState,
  (s) => s.status === 'loading',
);

/** Indique si une mutation (create/update/delete) est en cours. */
export const selectIsMutating = createSelector(
  selectRolesState,
  (s) => s.mutating === 'loading',
);

/** Retourne les rôles filtrés par tier. */
export const selectRolesByTier = createSelector(
  [selectRoles, (_state: RootState, tier: string) => tier],
  (roles, tier) => roles.filter((r) => r.tier === tier),
);

/** Retourne le nombre total de rôles (depuis la pagination). */
export const selectRolesTotalCount = createSelector(
  selectRolesState,
  (s) => s.pagination.total,
);
