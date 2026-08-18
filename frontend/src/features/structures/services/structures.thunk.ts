import { createAsyncThunk } from '@reduxjs/toolkit';
import { structuresApi } from './structures.api';
import type { CreateStructurePayload, UpdateStructurePayload } from './structures.types';

export const loadStructures = createAsyncThunk(
  'structures/loadAll',
  async (params: { page?: number; limit?: number; territoryId?: string; type?: string; status?: string; condition?: string; search?: string } | undefined, { rejectWithValue }) => {
    try {
      return await structuresApi.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchStructureById = createAsyncThunk(
  'structures/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await structuresApi.getById(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createStructure = createAsyncThunk(
  'structures/create',
  async (payload: CreateStructurePayload, { rejectWithValue }) => {
    try {
      return await structuresApi.create(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateStructure = createAsyncThunk(
  'structures/update',
  async ({ id, payload }: { id: string; payload: UpdateStructurePayload }, { rejectWithValue }) => {
    try {
      return await structuresApi.update(id, payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteStructure = createAsyncThunk(
  'structures/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await structuresApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
