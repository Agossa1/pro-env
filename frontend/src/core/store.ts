import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/services/auth.slices';
import rolesReducer from '../features/roles/services/roles.slices';
import permissionsReducer from '../features/permissions/services/permissions.slices';
import usersReducer from '../features/users/services/users.slices';
import territoryReducer from '../features/territory/services/territory.slices';
import reportsReducer  from '../features/reports/services/reports.slices';
import missionsReducer from '../features/missions/services/missions.slices';
import interventionsReducer from '../features/interventions/services/interventions.slices';
import structuresReducer from '../features/structures/services/structures.slices';
import societesReducer from '../features/societes/services/societes.slices';
import teamsReducer from '../features/teams/services/teams.slices';

/**
 * Store Redux central de l'application.
 */
export const store = configureStore({
  reducer: {
    auth:        authReducer,
    roles:       rolesReducer,
    permissions: permissionsReducer,
    users:       usersReducer,
    territory:   territoryReducer,
    reports:     reportsReducer,
    missions:    missionsReducer,
    interventions: interventionsReducer,
    structures:  structuresReducer,
    societes:     societesReducer,
    teams:       teamsReducer,
  },
});

/** Type du state global de l'application */
export type RootState = ReturnType<typeof store.getState>;

/** Type du dispatcher Redux (thunks inclus) */
export type AppDispatch = typeof store.dispatch;