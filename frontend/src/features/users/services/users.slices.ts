import { createSlice } from '@reduxjs/toolkit';
import type { AppUser } from './users.types';
import { loadUsers, createUserThunk, toggleUserActiveThunk } from './users.thunk';

export interface UsersState {
  list: AppUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  isMutating: boolean;
  error: string | null;
}

const initialState: UsersState = {
  list: [],
  pagination: { total: 0, page: 1, limit: 50, totalPages: 1 },
  status: 'idle',
  isMutating: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUsersError(state) {
      state.error = null;
    },
    resetMutating(state) {
      state.isMutating = false;
    },
  },
  extraReducers: (builder) => {
    // loadUsers
    builder
      .addCase(loadUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.data;
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          limit: action.payload.limit,
          totalPages: action.payload.totalPages,
        };
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // createUserThunk
    builder
      .addCase(createUserThunk.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(createUserThunk.fulfilled, (state, action) => {
        state.isMutating = false;
        state.list.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload as string;
      });

    // toggleUserActiveThunk
    builder
      .addCase(toggleUserActiveThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleUserActiveThunk.fulfilled, (state, action) => {
        const user = state.list.find((u) => u.id === action.payload.id);
        if (user) {
          user.isActive = action.payload.isActive;
        }
      })
      .addCase(toggleUserActiveThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearUsersError, resetMutating } = usersSlice.actions;
export default usersSlice.reducer;
