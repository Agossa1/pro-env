import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  loadStructures,
  fetchStructureById,
  createStructure,
  updateStructure,
  deleteStructure,
} from './structures.thunk';
import type { Structure, PaginatedResult } from './structures.types';

interface StructuresState {
  list: Structure[];
  pagination: Omit<PaginatedResult<any>, 'data'>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: StructuresState = {
  list: [],
  pagination: { total: 0, page: 1, limit: 50, totalPages: 1 },
  status: 'idle',
  error: null,
};

const structuresSlice = createSlice({
  name: 'structures',
  initialState,
  reducers: {
    clearStructuresError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // loadStructures
      .addCase(loadStructures.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadStructures.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(loadStructures.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // fetchById
      .addCase(fetchStructureById.fulfilled, (state, action) => {
        const index = state.list.findIndex(i => i.id === action.payload.id);
        if (index >= 0) {
          state.list[index] = action.payload;
        } else {
          state.list.unshift(action.payload);
        }
      })

      // createStructure
      .addCase(createStructure.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.pagination.total += 1;
      })

      // updateStructure
      .addCase(updateStructure.fulfilled, (state, action) => {
        const index = state.list.findIndex(i => i.id === action.payload.id);
        if (index >= 0) {
          state.list[index] = action.payload;
        }
      })

      // deleteStructure
      .addCase(deleteStructure.fulfilled, (state, action: PayloadAction<string>) => {
        state.list = state.list.filter(i => i.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      });
  }
});

export const { clearStructuresError } = structuresSlice.actions;
export default structuresSlice.reducer;
