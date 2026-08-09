/*
 * |--------------------------------------------------------------------------
 * | ROLES THUNKS
 * |--------------------------------------------------------------------------
 * | Actions asynchrones Redux Toolkit (createAsyncThunk).
 * | Les erreurs ApiError sont normalisées en string pour le slice.
 * |--------------------------------------------------------------------------
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { isApiError } from '../../../libs/api-client';
import {
  fetchRoles,
  fetchRoleById,
  createRole,
  updateRole,
  deleteRole,
} from './roles.api';
import type { CreateRoleDto, UpdateRoleDto } from './roles.types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function extractMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return 'Erreur inconnue.';
}

// ─────────────────────────────────────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────────────────────────────────────

/** Charge la liste paginée des rôles. */
export const loadRoles = createAsyncThunk(
  'roles/loadAll',
  async ({ page = 1, limit = 50 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      return await fetchRoles(page, limit);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Charge un rôle par son UUID. */
export const loadRoleById = createAsyncThunk(
  'roles/loadById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await fetchRoleById(id);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Crée un nouveau rôle. */
export const createRoleThunk = createAsyncThunk(
  'roles/create',
  async (dto: CreateRoleDto, { rejectWithValue }) => {
    try {
      return await createRole(dto);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Met à jour un rôle existant. */
export const updateRoleThunk = createAsyncThunk(
  'roles/update',
  async ({ id, dto }: { id: string; dto: UpdateRoleDto }, { rejectWithValue }) => {
    try {
      return await updateRole(id, dto);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Supprime un rôle — retourne l'id supprimé pour mise à jour du state. */
export const deleteRoleThunk = createAsyncThunk(
  'roles/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteRole(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);
