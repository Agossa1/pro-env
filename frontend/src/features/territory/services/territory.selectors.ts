/*
 * |--------------------------------------------------------------------------
 * | TERRITORY SELECTORS
 * |--------------------------------------------------------------------------
 */

import type { RootState } from '../../../core/store';

export const selectTerritoryList      = (state: RootState) => state.territory.list;
export const selectTerritorySelected  = (state: RootState) => state.territory.selected;
export const selectTerritoryStatus    = (state: RootState) => state.territory.status;
export const selectTerritoryError     = (state: RootState) => state.territory.error;
export const selectTerritoryPagination = (state: RootState) => state.territory.pagination;

/** Retourne les territoires filtrés par code de type (ex: 'DEPARTMENT') */
export const selectTerritoryByTypeCode = (typeCode: string) =>
  (state: RootState) =>
    state.territory.list.filter((t) => t.territoryTypeCode === typeCode);
