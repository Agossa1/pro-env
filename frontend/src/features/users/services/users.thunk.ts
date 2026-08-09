import { createAsyncThunk } from '@reduxjs/toolkit';
import { isApiError } from '../../../libs/api-client';
import { fetchUsers, createUser } from './users.api';
import type { CreateUserDto } from './users.types';

function extractMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return 'Erreur inconnue.';
}

export const loadUsers = createAsyncThunk(
  'users/loadAll',
  async ({ page = 1, limit = 50 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      return await fetchUsers(page, limit);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

export const createUserThunk = createAsyncThunk(
  'users/create',
  async (dto: CreateUserDto, { rejectWithValue }) => {
    try {
      return await createUser(dto);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);
