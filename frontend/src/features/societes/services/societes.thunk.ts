import { createAsyncThunk } from '@reduxjs/toolkit';
import { societesApi } from './societes.api';
import type { CreateSocietePayload, UpdateSocietePayload } from './societes.types';

export const loadSocietes = createAsyncThunk(
  'societes/loadAll',
  async (params: { page?: number; limit?: number; type?: string } | undefined, { rejectWithValue }) => {
    try {
      return await societesApi.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchSocieteById = createAsyncThunk(
  'societes/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await societesApi.getById(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createSociete = createAsyncThunk(
  'societes/create',
  async (payload: CreateSocietePayload, { rejectWithValue }) => {
    try {
      return await societesApi.create(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateSociete = createAsyncThunk(
  'societes/update',
  async ({ id, payload }: { id: string; payload: UpdateSocietePayload }, { rejectWithValue }) => {
    try {
      return await societesApi.update(id, payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteSociete = createAsyncThunk(
  'societes/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await societesApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchSocieteTerritories = createAsyncThunk(
  'societes/fetchTerritories',
  async (id: string, { rejectWithValue }) => {
    try {
      const territories = await societesApi.getTerritories(id);
      return { id, territories };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
