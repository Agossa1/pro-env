import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  loadInterventions,
  fetchInterventionById,
  createIntervention,
  updateIntervention,
  deleteIntervention,
  fetchInterventionReports,
  createFieldReport
} from './interventions.thunk';
import type { Intervention, FieldInterventionReport, PaginatedResult } from './interventions.types';

interface InterventionsState {
  list: Intervention[];
  reports: Record<string, FieldInterventionReport[]>;
  pagination: Omit<PaginatedResult<any>, 'data'>;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: InterventionsState = {
  list: [],
  reports: {},
  pagination: { total: 0, page: 1, limit: 50, totalPages: 1 },
  status: 'idle',
  error: null,
};

const interventionsSlice = createSlice({
  name: 'interventions',
  initialState,
  reducers: {
    clearInterventionsError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // loadInterventions
      .addCase(loadInterventions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadInterventions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(loadInterventions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // fetchById
      .addCase(fetchInterventionById.fulfilled, (state, action) => {
        const index = state.list.findIndex(i => i.id === action.payload.id);
        if (index >= 0) {
          state.list[index] = action.payload;
        } else {
          state.list.unshift(action.payload);
        }
      })

      // createIntervention
      .addCase(createIntervention.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.pagination.total += 1;
      })

      // updateIntervention
      .addCase(updateIntervention.fulfilled, (state, action) => {
        const index = state.list.findIndex(i => i.id === action.payload.id);
        if (index >= 0) {
          state.list[index] = action.payload;
        }
      })

      // deleteIntervention
      .addCase(deleteIntervention.fulfilled, (state, action: PayloadAction<string>) => {
        state.list = state.list.filter(i => i.id !== action.payload);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
      })

      // fetchReports
      .addCase(fetchInterventionReports.fulfilled, (state, action) => {
        state.reports[action.payload.id] = action.payload.reports;
      })

      // createFieldReport
      .addCase(createFieldReport.fulfilled, (state, action) => {
        const { interventionId, report } = action.payload;
        if (!state.reports[interventionId]) {
          state.reports[interventionId] = [];
        }
        state.reports[interventionId].unshift(report);
      });
  }
});

export const { clearInterventionsError } = interventionsSlice.actions;
export default interventionsSlice.reducer;