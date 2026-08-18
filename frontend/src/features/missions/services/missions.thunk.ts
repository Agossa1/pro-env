import { createAsyncThunk } from '@reduxjs/toolkit';
import { missionsApi } from './missions.api';
import type { CreateMissionPayload, UpdateMissionPayload } from './missions.types';

export const loadMissions = createAsyncThunk(
  'missions/loadMissions',
  async (params: Record<string, any> | undefined, { rejectWithValue }) => {
    try {
      return await missionsApi.getMissions(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors du chargement des missions');
    }
  }
);

export const createMission = createAsyncThunk(
  'missions/createMission',
  async (payload: CreateMissionPayload, { rejectWithValue }) => {
    try {
      return await missionsApi.createMission(payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors de la création de la mission');
    }
  }
);

export const updateMission = createAsyncThunk(
  'missions/updateMission',
  async ({ id, payload }: { id: string; payload: UpdateMissionPayload }, { rejectWithValue }) => {
    try {
      return await missionsApi.updateMission(id, payload);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors de la mise à jour de la mission');
    }
  }
);

export const deleteMission = createAsyncThunk(
  'missions/deleteMission',
  async (id: string, { rejectWithValue }) => {
    try {
      await missionsApi.deleteMission(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur lors de la suppression de la mission');
    }
  }
);
