import type { RootState } from '../../../core/store';

export const selectInterventionList = (state: RootState) => state.interventions.list;
export const selectInterventionStatus = (state: RootState) => state.interventions.status;
export const selectInterventionError = (state: RootState) => state.interventions.error;
export const selectInterventionPagination = (state: RootState) => state.interventions.pagination;

export const selectInterventionById = (id: string) => (state: RootState) =>
  state.interventions.list.find((i) => i.id === id);

export const selectInterventionReports = (id: string) => (state: RootState) =>
  state.interventions.reports[id] || [];
