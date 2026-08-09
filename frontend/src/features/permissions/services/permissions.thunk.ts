/*
 * |--------------------------------------------------------------------------
 * | PERMISSIONS THUNKS
 * |--------------------------------------------------------------------------
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { isApiError } from '../../../libs/api-client';
import {
  fetchPermissions,
  fetchPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  fetchRolesWithPermissions,
  fetchPermissionsByRole,
  assignPermissionsToRole,
  removePermissionFromRole,
} from './permissions.api';

import type { CreatePermissionDto, UpdatePermissionDto } from './permissions.types';

function extractMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return 'Erreur inconnue.';
}

/** Charge la liste paginée (souvent on charge tout pour les listes de checkbox) */
export const loadPermissions = createAsyncThunk(
  'permissions/loadAll',
  async ({ page = 1, limit = 200 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      return await fetchPermissions(page, limit);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Charge une permission par son UUID */
export const loadPermissionById = createAsyncThunk(
  'permissions/loadById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await fetchPermissionById(id);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Crée une nouvelle permission */
export const createPermissionThunk = createAsyncThunk(
  'permissions/create',
  async (dto: CreatePermissionDto, { rejectWithValue }) => {
    try {
      return await createPermission(dto);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Met à jour une permission existante */
export const updatePermissionThunk = createAsyncThunk(
  'permissions/update',
  async ({ id, dto }: { id: string; dto: UpdatePermissionDto }, { rejectWithValue }) => {
    try {
      return await updatePermission(id, dto);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Supprime une permission */
export const deletePermissionThunk = createAsyncThunk(
  'permissions/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deletePermission(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Charge tous les rôles et leurs permissions */
export const loadRolesWithPermissions = createAsyncThunk(
  'permissions/loadRolesWithPermissions',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchRolesWithPermissions();
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Récupère les permissions d'un rôle précis */
export const loadPermissionsByRoleThunk = createAsyncThunk(
  'permissions/loadByRole',
  async (roleId: string, { rejectWithValue }) => {
    try {
      return await fetchPermissionsByRole(roleId);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Assigner de multiples permissions à un rôle */
export const assignPermissionsThunk = createAsyncThunk(
  'permissions/assign',
  async ({ roleId, permissionIds }: { roleId: string; permissionIds: string[] }, { rejectWithValue }) => {
    try {
      await assignPermissionsToRole(roleId, { permissionIds });
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/** Retirer une permission spécifique d'un rôle */
export const removePermissionThunk = createAsyncThunk(
  'permissions/remove',
  async ({ roleId, permissionId }: { roleId: string; permissionId: string }, { rejectWithValue }) => {
    try {
      await removePermissionFromRole(roleId, permissionId);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);
