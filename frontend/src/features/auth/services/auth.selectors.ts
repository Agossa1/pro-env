/*
|--------------------------------------------------------------------------
| AUTH SELECTORS
|--------------------------------------------------------------------------
*/

import type { RootState } from '../../../core/store';

// ── Session ──────────────────────────────────────────────────────────────────
export const selectAuthUser        = (state: RootState) => state.auth.user;
export const selectAuthStatus      = (state: RootState) => state.auth.status;
export const selectAuthError       = (state: RootState) => state.auth.error;
export const selectPendingEmail    = (state: RootState) => state.auth.pendingEmail;
export const selectIsAuthenticated = (state: RootState) => state.auth.user !== null;
export const selectIsInitialized   = (state: RootState) => state.auth.initialized;
export const selectAuthLoading     = (state: RootState) => state.auth.status === 'loading';

// ── Admin Users ───────────────────────────────────────────────────────────────
export const selectUsersList       = (state: RootState) => state.auth.usersList;
export const selectUsersPagination = (state: RootState) => state.auth.usersPagination;
export const selectUsersStatus     = (state: RootState) => state.auth.usersStatus;
export const selectUsersLoading    = (state: RootState) => state.auth.usersStatus === 'loading';
export const selectUsersError      = (state: RootState) => state.auth.usersError;
export const selectIsMutatingUser  = (state: RootState) => state.auth.isMutatingUser;
