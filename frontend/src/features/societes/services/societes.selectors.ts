import type { RootState } from '../../../core/store';

export const selectSocietesList = (state: RootState) => state.societes.list;
export const selectSocietesStatus = (state: RootState) => state.societes.status;
export const selectSocietesError = (state: RootState) => state.societes.error;
export const selectSocietesPagination = (state: RootState) => state.societes.pagination;
