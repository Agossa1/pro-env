import { createAsyncThunk } from '@reduxjs/toolkit';
import { isApiError } from '../../../libs/api-client';
import { fetchUsers, createUser, toggleUserActive, updateUser, deleteUser } from './users.api';
import type { CreateUserDto, UpdateUserDto } from './users.types';

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

export const toggleUserActiveThunk = createAsyncThunk(
  'users/toggleActive',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await toggleUserActive(id);
      return { id, isActive: res.isActive };
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

export const updateUserThunk = createAsyncThunk(
  'users/update',
  async (dto: UpdateUserDto, { rejectWithValue }) => {
    try {
      await updateUser(dto);
      return dto;
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

export const deleteUserThunk = createAsyncThunk(
  'users/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteUser(id);
      return { id };
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

