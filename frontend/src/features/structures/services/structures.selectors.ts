import type { RootState } from '../../../core/store';

export const selectStructuresList = (state: RootState) => state.structures.list;
export const selectStructuresStatus = (state: RootState) => state.structures.status;
export const selectStructuresError = (state: RootState) => state.structures.error;
export const selectStructuresPagination = (state: RootState) => state.structures.pagination;

export const selectStructureById = (id: string) => (state: RootState) =>
  state.structures.list.find((s) => s.id === id);
