import { createAsyncThunk } from '@reduxjs/toolkit';
import { interventionsApi } from './interventions.api';
import type {
  CreateInterventionPayload,
  UpdateInterventionPayload,
  CreateFieldReportPayload,
} from './interventions.types';

export const loadInterventions = createAsyncThunk(
  'interventions/loadAll',
  async (
    params: { page?: number; limit?: number; status?: string; missionId?: string; teamId?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      return await interventionsApi.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchInterventionById = createAsyncThunk(
  'interventions/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await interventionsApi.getById(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createIntervention = createAsyncThunk(
  'interventions/create',
  async (payload: CreateInterventionPayload, { rejectWithValue }) => {
    try {
      return await interventionsApi.create(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateIntervention = createAsyncThunk(
  'interventions/update',
  async ({ id, payload }: { id: string; payload: UpdateInterventionPayload }, { rejectWithValue }) => {
    try {
      return await interventionsApi.update(id, payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteIntervention = createAsyncThunk(
  'interventions/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await interventionsApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchInterventionReports = createAsyncThunk(
  'interventions/fetchReports',
  async (id: string, { rejectWithValue }) => {
    try {
      const reports = await interventionsApi.getReports(id);
      return { id, reports };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createFieldReport = createAsyncThunk(
  'interventions/createReport',
  async (payload: CreateFieldReportPayload, { rejectWithValue }) => {
    try {
      const { interventionId, ...rest } = payload;
      const report = await interventionsApi.createReport(interventionId, rest);
      return { interventionId, report };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);