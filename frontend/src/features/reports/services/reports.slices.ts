import { createSlice } from '@reduxjs/toolkit';
import type { Report } from './reports.types';
import { loadReports, createReport, updateReport, deleteReport } from './reports.thunk';

interface ReportsState {
  list: Report[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ReportsState = {
  list: [],
  status: 'idle',
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
};

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearReportsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadReports
      .addCase(loadReports.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadReports.fulfilled, (state, action) => {
        state.status = 'succeeded';
        if (action.payload && typeof action.payload === 'object' && 'data' in action.payload) {
          // Si le backend renvoie PaginatedResult
          state.list = (action.payload as any).data;
          state.pagination = {
            page: (action.payload as any).page || 1,
            limit: (action.payload as any).limit || 10,
            total: (action.payload as any).total || 0,
            totalPages: (action.payload as any).totalPages || 1,
          };
        } else if (Array.isArray(action.payload)) {
          // Si le backend renvoie directement le tableau
          state.list = action.payload;
        }
      })
      .addCase(loadReports.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // createReport
      .addCase(createReport.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.pagination.total += 1;
      })
      
      // updateReport
      .addCase(updateReport.fulfilled, (state, action) => {
        const index = state.list.findIndex((r) => r.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      
      // deleteReport
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.list = state.list.filter((r) => r.id !== action.payload);
        state.pagination.total -= 1;
      });
  },
});

export const { clearReportsError } = reportsSlice.actions;
export default reportsSlice.reducer;
