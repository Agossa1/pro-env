/*
 * |--------------------------------------------------------------------------
 * | TERRITORY THUNKS
 * |--------------------------------------------------------------------------
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { isApiError } from '../../../libs/api-client';
import { fetchTerritories } from './territory.api';
import type { PaginatedTerritoriesResult } from './territory.types';

function extractMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return 'Erreur inconnue.';
}

/** Charge la liste paginée des territoires (avec filtres optionnels). */
export const loadTerritories = createAsyncThunk<
  PaginatedTerritoriesResult,
  { page?: number; limit?: number; territoryTypeId?: string } | undefined,
  { rejectValue: string }
>(
  'territory/loadAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 200, territoryTypeId } = params;
      return await fetchTerritories(page, limit, territoryTypeId);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);
