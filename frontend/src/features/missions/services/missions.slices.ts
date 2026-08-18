import { createSlice } from '@reduxjs/toolkit';
import type { Mission } from './missions.types';
import { loadMissions, createMission, updateMission, deleteMission } from './missions.thunk';

interface MissionsState {
  list: Mission[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: MissionsState = {
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

const missionsSlice = createSlice({
  name: 'missions',
  initialState,
  reducers: {
    clearMissionsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadMissions
      .addCase(loadMissions.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadMissions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const payload = action.payload as any;
        if (payload && typeof payload === 'object' && 'data' in payload) {
          state.list = payload.data;
          state.pagination = {
            page:       payload.page       || 1,
            limit:      payload.limit      || 10,
            total:      payload.total      || 0,
            totalPages: payload.totalPages || 1,
          };
        } else if (Array.isArray(payload)) {
          state.list = payload;
        }
      })
      .addCase(loadMissions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // createMission
      .addCase(createMission.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.pagination.total += 1;
      })

      // updateMission
      .addCase(updateMission.fulfilled, (state, action) => {
        const index = state.list.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })

      // deleteMission
      .addCase(deleteMission.fulfilled, (state, action) => {
        state.list = state.list.filter((m) => m.id !== action.payload);
        state.pagination.total -= 1;
      });
  },
});

export const { clearMissionsError } = missionsSlice.actions;
export default missionsSlice.reducer;
