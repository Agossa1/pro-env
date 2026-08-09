/*
 * |--------------------------------------------------------------------------
 * | PERMISSIONS SLICE
 * |--------------------------------------------------------------------------
 */

import { createSlice } from '@reduxjs/toolkit';
import type { Permission, RoleWithPermissions } from './permissions.types';
import {
  loadPermissions,
  loadPermissionById,
  createPermissionThunk,
  updatePermissionThunk,
  deletePermissionThunk,
  loadRolesWithPermissions,
  assignPermissionsThunk,
  removePermissionThunk,
} from './permissions.thunk';

export type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface PermissionsState {
  list:             Permission[];
  selected:         Permission | null;
  rolesPermissions: RoleWithPermissions[];
  status:           LoadingStatus;
  mutating:         LoadingStatus;
  error:            string | null;
}

const initialState: PermissionsState = {
  list:             [],
  selected:         null,
  rolesPermissions: [],
  status:           'idle',
  mutating:         'idle',
  error:            null,
};

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    clearPermissionsError(state) {
      state.error = null;
    },
    resetMutating(state) {
      state.mutating = 'idle';
    },
    selectPermission(state, action: { payload: Permission | null }) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── loadPermissions ─────────────────────────────────────────────────────
    builder
      .addCase(loadPermissions.pending, (state) => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(loadPermissions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list   = action.payload.data;
      })
      .addCase(loadPermissions.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = (action.payload as string | undefined) ?? 'Erreur lors du chargement des permissions.';
      });

    // ── loadPermissionById ──────────────────────────────────────────────────
    builder
      .addCase(loadPermissionById.pending, (state) => {
        state.status   = 'loading';
        state.selected = null;
        state.error    = null;
      })
      .addCase(loadPermissionById.fulfilled, (state, action) => {
        state.status   = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(loadPermissionById.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = (action.payload as string | undefined) ?? 'Permission introuvable.';
      });

    // ── createPermissionThunk ───────────────────────────────────────────────
    builder
      .addCase(createPermissionThunk.pending, (state) => {
        state.mutating = 'loading';
        state.error    = null;
      })
      .addCase(createPermissionThunk.fulfilled, (state, action) => {
        state.mutating = 'succeeded';
        state.list.unshift(action.payload);
      })
      .addCase(createPermissionThunk.rejected, (state, action) => {
        state.mutating = 'failed';
        state.error    = (action.payload as string | undefined) ?? 'Erreur lors de la création.';
      });

    // ── updatePermissionThunk ───────────────────────────────────────────────
    builder
      .addCase(updatePermissionThunk.pending, (state) => {
        state.mutating = 'loading';
        state.error    = null;
      })
      .addCase(updatePermissionThunk.fulfilled, (state, action) => {
        state.mutating = 'succeeded';
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(updatePermissionThunk.rejected, (state, action) => {
        state.mutating = 'failed';
        state.error    = (action.payload as string | undefined) ?? 'Erreur lors de la mise à jour.';
      });

    // ── deletePermissionThunk ───────────────────────────────────────────────
    builder
      .addCase(deletePermissionThunk.pending, (state) => {
        state.mutating = 'loading';
        state.error    = null;
      })
      .addCase(deletePermissionThunk.fulfilled, (state, action) => {
        state.mutating = 'succeeded';
        state.list = state.list.filter((p) => p.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      })
      .addCase(deletePermissionThunk.rejected, (state, action) => {
        state.mutating = 'failed';
        state.error    = (action.payload as string | undefined) ?? 'Erreur lors de la suppression.';
      });

    // ── loadRolesWithPermissions ────────────────────────────────────────────
    builder
      .addCase(loadRolesWithPermissions.pending, () => {
        // Optionnel: on peut utiliser un autre status pour ne pas écraser celui des permissions
      })
      .addCase(loadRolesWithPermissions.fulfilled, (state, action) => {
        state.rolesPermissions = action.payload;
      })
      .addCase(loadRolesWithPermissions.rejected, (state, action) => {
        state.error = (action.payload as string | undefined) ?? 'Erreur rôles/permissions.';
      });

    // ── assignPermissionsThunk ──────────────────────────────────────────────
    builder
      .addCase(assignPermissionsThunk.pending, (state) => {
        state.mutating = 'loading';
        state.error    = null;
      })
      .addCase(assignPermissionsThunk.fulfilled, (state) => {
        state.mutating = 'succeeded';
      })
      .addCase(assignPermissionsThunk.rejected, (state, action) => {
        state.mutating = 'failed';
        state.error    = (action.payload as string | undefined) ?? 'Erreur lors de l\'assignation.';
      });

    // ── removePermissionThunk ───────────────────────────────────────────────
    builder
      .addCase(removePermissionThunk.pending, (state) => {
        state.mutating = 'loading';
        state.error    = null;
      })
      .addCase(removePermissionThunk.fulfilled, (state) => {
        state.mutating = 'succeeded';
      })
      .addCase(removePermissionThunk.rejected, (state, action) => {
        state.mutating = 'failed';
        state.error    = (action.payload as string | undefined) ?? 'Erreur lors du retrait.';
      });
  },
});

export const { clearPermissionsError, resetMutating, selectPermission } = permissionsSlice.actions;
export default permissionsSlice.reducer;
