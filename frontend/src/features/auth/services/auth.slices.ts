/*
|--------------------------------------------------------------------------
| AUTH SLICE — Redux
|--------------------------------------------------------------------------
| Gère l'état d'authentification global et la gestion des utilisateurs
| par les administrateurs.
|--------------------------------------------------------------------------
*/

import { createSlice } from '@reduxjs/toolkit';
import type { AuthUser, AppUser } from './auth.types';
import {
  loginThunk,
  logoutThunk,
  fetchMeThunk,
  registerThunk,
  fetchUsersThunk,
  adminCreateUserThunk,
} from './auth.thunk';

export type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AuthState {
  user:            AuthUser | null;
  status:          AuthStatus;
  error:           string | null;
  /** Email en attente de vérification (après inscription) */
  pendingEmail:    string | null;
  /** true si l'app a terminé l'initialisation de session */
  initialized:     boolean;

  // -- Admin Users Management --
  usersList:       AppUser[];
  usersPagination: { total: number; page: number; limit: number; totalPages: number } | null;
  usersStatus:     AuthStatus;
  usersError:      string | null;
  isMutatingUser:  boolean;
}

const initialState: AuthState = {
  user:            null,
  status:          'idle',
  error:           null,
  pendingEmail:    null,
  initialized:     false,

  usersList:       [],
  usersPagination: null,
  usersStatus:     'idle',
  usersError:      null,
  isMutatingUser:  false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    clearUsersError(state) {
      state.usersError = null;
    },
    setInitialized(state) {
      state.initialized = true;
    },
    setUser(state, action: { payload: AuthUser | null }) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── loginThunk ──────────────────────────────────────────────────────────
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status       = 'succeeded';
        state.user         = action.payload.user;
        state.pendingEmail = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload ?? 'Identifiants incorrects.';
      });

    // ── registerThunk ───────────────────────────────────────────────────────
    builder
      .addCase(registerThunk.pending, (state) => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status       = 'succeeded';
        state.pendingEmail = action.payload.email;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload ?? "Erreur lors de l'inscription.";
      });

    // ── fetchMeThunk ────────────────────────────────────────────────────────
    builder
      .addCase(fetchMeThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user   = action.payload;
      })
      .addCase(fetchMeThunk.rejected, (state) => {
        state.status = 'failed';
        state.user   = null;
      });

    // ── logoutThunk ─────────────────────────────────────────────────────────
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user   = null;
      state.status = 'idle';
    });

    // ── fetchUsersThunk ─────────────────────────────────────────────────────
    builder
      .addCase(fetchUsersThunk.pending, (state) => {
        state.usersStatus = 'loading';
        state.usersError  = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.usersStatus     = 'succeeded';
        state.usersList       = action.payload.data;
        state.usersPagination = {
          total:      action.payload.total,
          page:       action.payload.page,
          limit:      action.payload.limit,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.usersStatus = 'failed';
        state.usersError  = action.payload ?? 'Erreur lors du chargement des utilisateurs.';
      });

    // ── adminCreateUserThunk ────────────────────────────────────────────────
    builder
      .addCase(adminCreateUserThunk.pending, (state) => {
        state.isMutatingUser = true;
        state.usersError     = null;
      })
      .addCase(adminCreateUserThunk.fulfilled, (state, action) => {
        state.isMutatingUser = false;
        // Ajoute le nouvel utilisateur en tête de liste
        state.usersList = [action.payload, ...state.usersList];
        if (state.usersPagination) {
          state.usersPagination.total += 1;
        }
      })
      .addCase(adminCreateUserThunk.rejected, (state, action) => {
        state.isMutatingUser = false;
        state.usersError     = action.payload ?? "Erreur lors de la création de l'utilisateur.";
      });
  },
});

export const { clearAuthError, clearUsersError, setInitialized, setUser } = authSlice.actions;
export default authSlice.reducer;
