/*
 * |--------------------------------------------------------------------------
 * | PERMISSIONS SELECTORS
 * |--------------------------------------------------------------------------
 */

import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../../core/store';
import type { Permission } from './permissions.types';

export const selectPermissions = (state: RootState) => state.permissions.list;
export const selectPermissionsStatus = (state: RootState) => state.permissions.status;
export const selectPermissionsMutating = (state: RootState) => state.permissions.mutating;
export const selectPermissionsError = (state: RootState) => state.permissions.error;
export const selectPermissionsSelected = (state: RootState) => state.permissions.selected;
export const selectRolesPermissions = (state: RootState) => state.permissions.rolesPermissions;

/** Groupe les permissions par module (ex: 'users': [perm1, perm2]) */
export const selectPermissionsByModule = createSelector(
  selectPermissions,
  (permissions) => {
    return permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);
  }
);
