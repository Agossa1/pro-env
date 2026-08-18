/*
 * |--------------------------------------------------------------------------
 * | useTerritory — Hook Redux pour les territoires
 * |--------------------------------------------------------------------------
 */

import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../core/store';
import { loadTerritories, loadDepartmentsAndCommunes, loadMapTerritories } from '../services/territory.thunk';
import {
  selectTerritoryList,
  selectTerritoryStatus,
  selectTerritoryError,
  selectTerritoryPagination,
} from '../services/territory.selectors';

export function useTerritory(params?: { territoryTypeId?: string; territoryTypeCode?: string }) {
  const dispatch = useDispatch<AppDispatch>();

  const territories = useSelector(selectTerritoryList);
  const status      = useSelector(selectTerritoryStatus);
  const error       = useSelector(selectTerritoryError);
  const pagination  = useSelector(selectTerritoryPagination);

  const isLoading = status === 'loading';

  const load = useCallback((page = 1, limit = 200) => {
    dispatch(loadTerritories({ page, limit, ...params }));
  }, [dispatch, params?.territoryTypeId, params?.territoryTypeCode]);

  const reload = useCallback(() => {
    dispatch(loadTerritories({ page: 1, limit: 200, ...params }));
  }, [dispatch, params?.territoryTypeId, params?.territoryTypeCode]);

  /** Charge tous les départements + communes en 2 appels parallèles filtrés.
   *  À utiliser dans les formulaires (CreateSocieteModal, etc.) */
  const loadForForm = useCallback(() => {
    dispatch(loadDepartmentsAndCommunes());
  }, [dispatch]);

  /** Charge tous les territoires pour la carte */
  const loadForMap = useCallback(() => {
    dispatch(loadMapTerritories());
  }, [dispatch]);

  return { territories, isLoading, error, pagination, status, load, reload, loadForForm, loadForMap };
}
