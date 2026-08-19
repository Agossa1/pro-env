import { createAsyncThunk } from '@reduxjs/toolkit';
import { teamsApi } from './teams.api';
import type { CreateTeamPayload, UpdateTeamPayload, AddTeamMemberPayload } from './teams.types';

export const fetchTeams = createAsyncThunk(
  'teams/fetchAll',
  async (params: { page?: number; limit?: number; teamType?: string; organizationId?: string } | undefined, { rejectWithValue }) => {
    try {
      return await teamsApi.getAll(params);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des équipes');
    }
  }
);

export const fetchTeamById = createAsyncThunk(
  'teams/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await teamsApi.getById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Erreur lors du chargement de l'équipe");
    }
  }
);

export const createTeam = createAsyncThunk(
  'teams/create',
  async (payload: CreateTeamPayload, { rejectWithValue }) => {
    try {
      return await teamsApi.create(payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la création de l'équipe");
    }
  }
);

export const updateTeam = createAsyncThunk(
  'teams/update',
  async ({ id, payload }: { id: string; payload: UpdateTeamPayload }, { rejectWithValue }) => {
    try {
      return await teamsApi.update(id, payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la mise à jour de l'équipe");
    }
  }
);

export const deleteTeam = createAsyncThunk(
  'teams/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await teamsApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Erreur lors de la suppression de l'équipe");
    }
  }
);

export const fetchTeamMembers = createAsyncThunk(
  'teams/fetchMembers',
  async (id: string, { rejectWithValue }) => {
    try {
      return await teamsApi.getMembers(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du chargement des membres');
    }
  }
);

export const addTeamMember = createAsyncThunk(
  'teams/addMember',
  async ({ id, payload }: { id: string; payload: AddTeamMemberPayload }, { rejectWithValue }) => {
    try {
      return await teamsApi.addMember(id, payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Erreur lors de l'ajout du membre");
    }
  }
);

export const removeTeamMember = createAsyncThunk(
  'teams/removeMember',
  async ({ id, memberId }: { id: string; memberId: string }, { rejectWithValue }) => {
    try {
      await teamsApi.removeMember(id, memberId);
      return memberId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la suppression du membre');
    }
  }
);
