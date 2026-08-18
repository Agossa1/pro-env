import type { RootState } from '../../../core/store';

export const selectMissionsList       = (state: RootState) => state.missions.list;
export const selectMissionsStatus     = (state: RootState) => state.missions.status;
export const selectMissionsError      = (state: RootState) => state.missions.error;
export const selectMissionsPagination = (state: RootState) => state.missions.pagination;
