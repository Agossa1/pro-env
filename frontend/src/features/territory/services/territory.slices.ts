/*
 * |--------------------------------------------------------------------------
 * | TERRITORY SLICE
 * |--------------------------------------------------------------------------
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Territory, PaginatedTerritoriesResult } from './territory.types';
import { loadTerritories } from './territory.thunk';

export type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface TerritoryState {
  list:       Territory[];
  selected:   Territory | null;
  pagination: Omit<PaginatedTerritoriesResult, 'data'>;
  status:     LoadingStatus;
  error:      string | null;
}

const initialState: TerritoryState = {
  list:     [],
  selected: null,
  pagination: { total: 0, page: 1, limit: 200, totalPages: 1 },
  status:   'idle',
  error:    null,
};

const territorySlice = createSlice({
  name: 'territory',
  initialState,
  reducers: {
    selectTerritory(state, action: PayloadAction<Territory | null>) {
      state.selected = action.payload;
    },
    clearTerritoryError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTerritories.pending, (state) => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(loadTerritories.fulfilled, (state, action) => {
        state.status     = 'succeeded';
        state.list       = action.payload.data;
        state.pagination = {
          total:      action.payload.total,
          page:       action.payload.page,
          limit:      action.payload.limit,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(loadTerritories.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload ?? 'Erreur lors du chargement des territoires.';
      });
  },
});

export const { selectTerritory, clearTerritoryError } = territorySlice.actions;
export default territorySlice.reducer;
