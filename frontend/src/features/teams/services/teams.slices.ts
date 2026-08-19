import { createSlice} from '@reduxjs/toolkit';
import type { FieldTeam, FieldTeamMember } from './teams.types';
import {
  fetchTeams,
  fetchTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  fetchTeamMembers,
  addTeamMember,
  removeTeamMember,
} from './teams.thunk';

interface TeamsState {
  data: FieldTeam[];
  selectedTeam: FieldTeam | null;
  members: FieldTeamMember[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const initialState: TeamsState = {
  data: [],
  selectedTeam: null,
  members: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
};

const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedTeam: (state) => {
      state.selectedTeam = null;
      state.members = [];
    },
  },
  extraReducers: (builder) => {
    // fetchTeams
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchTeamById
    builder
      .addCase(fetchTeamById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedTeam = action.payload;
      })
      .addCase(fetchTeamById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // createTeam
    builder
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.data.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateTeam
    builder
      .addCase(updateTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        if (state.selectedTeam?.id === action.payload.id) {
          state.selectedTeam = action.payload;
        }
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // deleteTeam
    builder
      .addCase(deleteTeam.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((t) => t.id !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchTeamMembers
    builder
      .addCase(fetchTeamMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // addTeamMember
    builder
      .addCase(addTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members.push(action.payload);
      })
      .addCase(addTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // removeTeamMember
    builder
      .addCase(removeTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members = state.members.filter((m) => m.userId !== action.payload && m.id !== action.payload);
      })
      .addCase(removeTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedTeam } = teamsSlice.actions;
export default teamsSlice.reducer;
