import type { RootState } from '../../../core/store';

export const selectReportsList = (state: RootState) => state.reports.list;
export const selectReportsStatus = (state: RootState) => state.reports.status;
export const selectReportsError = (state: RootState) => state.reports.error;
export const selectReportsPagination = (state: RootState) => state.reports.pagination;
