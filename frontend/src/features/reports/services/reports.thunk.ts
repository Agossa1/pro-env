import { createAsyncThunk } from '@reduxjs/toolkit';
import { reportsApi } from './reports.api';
import type { CreateReportPayload, UpdateReportPayload } from './reports.types';

export const loadReports = createAsyncThunk(
  'reports/loadReports',
  async (params: any | undefined, { rejectWithValue }) => {
    try {
      const response = await reportsApi.getReports(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des signalements');
    }
  }
);

export const createReport = createAsyncThunk(
  'reports/createReport',
  async (payload: CreateReportPayload, { rejectWithValue }) => {
    try {
      const response = await reportsApi.createReport(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la création du signalement');
    }
  }
);

export const updateReport = createAsyncThunk(
  'reports/updateReport',
  async ({ id, payload }: { id: string; payload: UpdateReportPayload }, { rejectWithValue }) => {
    try {
      const response = await reportsApi.updateReport(id, payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour du signalement');
    }
  }
);

export const deleteReport = createAsyncThunk(
  'reports/deleteReport',
  async (id: string, { rejectWithValue }) => {
    try {
      await reportsApi.deleteReport(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la suppression du signalement');
    }
  }
);
