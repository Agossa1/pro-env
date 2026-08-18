import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  loadSocietes,
  fetchSocieteById,
  createSociete,
  updateSociete,
  deleteSociete,
  fetchSocieteTerritories,
} from './societes.thunk';
import type { AppSociete, SocieteTerritory, PaginatedResult } from './societes.types';

interface SocietesState {
  list: AppSociete[];
  territories: Record<string, SocieteTerritory[]>;
  pagination: Omit<PaginatedResult<any>, 'data'>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SocietesState = {
  list: [],
  territories: {},
  pagination: { total: 0, page: 1, limit: 50, totalPages: 1 },
  status: 'idle',
  error: null,
};

const societesSlice = createSlice({
  name: 'societes',
  initialState,
  reducers: {
    clearSocietesError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // loadSocietes
      .addCase(loadSocietes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadSocietes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(loadSocietes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // fetchById
      .addCase(fetchSocieteById.fulfilled, (state, action) => {
        const index = state.list.findIndex(i => i.id === action.payload.id);
        if (index >= 0) {
          state.list[index] = action.payload;
        } else {
          state.list.unshift(action.payload);
        }
      })

      // createSociete
      .addCase(createSociete.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.pagination.total += 1;
      })

      // updateSociete
      .addCase(updateSociete.fulfilled, (state, action) => {
        const index = state.list.findIndex(i => i.id === action.payload.id);
        if (index >= 0) {
          state.list[index] = action.payload;
        }
      })

      // deleteSociete
      .addCase(deleteSociete.fulfilled, (state, action: PayloadAction<string>) => {
        state.list = state.list.filter(i => i.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })

      // fetchTerritories
      .addCase(fetchSocieteTerritories.fulfilled, (state, action) => {
        state.territories[action.payload.id] = action.payload.territories;
      });
  }
});

export const { clearSocietesError } = societesSlice.actions;
export default societesSlice.reducer;
