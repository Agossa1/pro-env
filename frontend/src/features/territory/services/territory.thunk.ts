/*
 * |--------------------------------------------------------------------------
 * | TERRITORY THUNKS
 * |--------------------------------------------------------------------------
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { isApiError } from '../../../libs/api-client';
import { fetchTerritories } from './territory.api';
import type { PaginatedTerritoriesResult, Territory } from './territory.types';

function extractMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return 'Erreur inconnue.';
}

/** Charge la liste paginée des territoires (avec filtres optionnels). */
export const loadTerritories = createAsyncThunk<
  PaginatedTerritoriesResult,
  { page?: number; limit?: number; territoryTypeId?: string; territoryTypeCode?: string } | undefined,
  { rejectValue: string }
>(
  'territory/loadAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 200, territoryTypeId, territoryTypeCode } = params;
      return await fetchTerritories(page, limit, territoryTypeId, territoryTypeCode);
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/**
 * Charge en parallèle tous les départements (12) et toutes les communes (77)
 * en utilisant des filtres par type pour éviter les problèmes de pagination.
 */
export const loadDepartmentsAndCommunes = createAsyncThunk<
  Territory[],
  void,
  { rejectValue: string }
>(
  'territory/loadDepartmentsAndCommunes',
  async (_, { rejectWithValue }) => {
    try {
      const [depts, communes] = await Promise.all([
        fetchTerritories(1, 20, undefined, 'DEPARTMENT'),
        fetchTerritories(1, 100, undefined, 'COMMUNE'),
      ]);
      return [...depts.data, ...communes.data];
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);

/**
 * Charge tous les territoires pour la carte (Départements, Communes, Arrondissements, Quartiers).
 * Utilise une limite haute pour tout récupérer en une fois.
 */
export const loadMapTerritories = createAsyncThunk<
  Territory[],
  void,
  { rejectValue: string }
>(
  'territory/loadMapTerritories',
  async (_, { rejectWithValue }) => {
    try {
      // On récupère tout d'un coup (jusqu'à 6000 pour couvrir les quartiers/villages)
      const res = await fetchTerritories(1, 6000);
      return res.data;
    } catch (error) {
      return rejectWithValue(extractMessage(error));
    }
  },
);
