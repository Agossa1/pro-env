/*
 * |--------------------------------------------------------------------------
 * | ROLES SLICE
 * |--------------------------------------------------------------------------
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppRole, PaginatedRolesResult } from './roles.types';
import {
  loadRoles,
  loadRoleById,
  createRoleThunk,
  updateRoleThunk,
  deleteRoleThunk,
} from './roles.thunk';

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

export type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface RolesState {
  list:       AppRole[];
  selected:   AppRole | null;
  pagination: Omit<PaginatedRolesResult, 'data'>;
  status:     LoadingStatus;
  /** Statut isolé pour les mutations (create/update/delete) */
  mutating:   LoadingStatus;
  error:      string | null;
}

const initialState: RolesState = {
  list:     [],
  selected: null,
  pagination: {
    total:      0,
    page:       1,
    limit:      50,
    totalPages: 1,
  },
  status:   'idle',
  mutating: 'idle',
  error:    null,
};

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const rolesSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    /** Sélectionne un rôle (pour l'affichage dans le panneau détail). */
    selectRole(state, action: PayloadAction<AppRole | null>) {
      state.selected = action.payload;
    },
    /** Réinitialise les erreurs. */
    clearRolesError(state) {
      state.error = null;
    },
    /** Réinitialise le statut de mutation après action. */
    resetMutating(state) {
      state.mutating = 'idle';
    },
  },
  extraReducers: (builder) => {
    // ── loadRoles ───────────────────────────────────────────────────────────
    builder
      .addCase(loadRoles.pending, (state) => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(loadRoles.fulfilled, (state, action) => {
        state.status     = 'succeeded';
        state.list       = action.payload.data;
        state.pagination = {
          total:      action.payload.total,
          page:       action.payload.page,
          limit:      action.payload.limit,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(loadRoles.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = (action.payload as string | undefined) ?? 'Erreur lors du chargement des rôles.';
      });

    // ── loadRoleById ────────────────────────────────────────────────────────
    builder
      .addCase(loadRoleById.pending, (state) => {
        state.status   = 'loading';
        state.selected = null;
        state.error    = null;
      })
      .addCase(loadRoleById.fulfilled, (state, action) => {
        state.status   = 'succeeded';
        state.selected = action.payload;
      })
      .addCase(loadRoleById.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = (action.payload as string | undefined) ?? 'Rôle introuvable.';
      });

    // ── createRoleThunk ─────────────────────────────────────────────────────
    builder
      .addCase(createRoleThunk.pending, (state) => {
        state.mutating = 'loading';
        state.error    = null;
      })
      .addCase(createRoleThunk.fulfilled, (state, action) => {
        state.mutating = 'succeeded';
        state.list.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createRoleThunk.rejected, (state, action) => {
        state.mutating = 'failed';
        state.error    = (action.payload as string | undefined) ?? 'Erreur lors de la création du rôle.';
      });

    // ── updateRoleThunk ─────────────────────────────────────────────────────
    builder
      .addCase(updateRoleThunk.pending, (state) => {
        state.mutating = 'loading';
        state.error    = null;
      })
      .addCase(updateRoleThunk.fulfilled, (state, action) => {
        state.mutating = 'succeeded';
        const idx = state.list.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(updateRoleThunk.rejected, (state, action) => {
        state.mutating = 'failed';
        state.error    = (action.payload as string | undefined) ?? 'Erreur lors de la mise à jour du rôle.';
      });

    // ── deleteRoleThunk ─────────────────────────────────────────────────────
    builder
      .addCase(deleteRoleThunk.pending, (state) => {
        state.mutating = 'loading';
        state.error    = null;
      })
      .addCase(deleteRoleThunk.fulfilled, (state, action) => {
        state.mutating = 'succeeded';
        state.list     = state.list.filter((r) => r.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })
      .addCase(deleteRoleThunk.rejected, (state, action) => {
        state.mutating = 'failed';
        state.error    = (action.payload as string | undefined) ?? 'Erreur lors de la suppression du rôle.';
      });
  },
});

export const { selectRole, clearRolesError, resetMutating } = rolesSlice.actions;
export default rolesSlice.reducer;
