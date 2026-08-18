import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../core/store';
import {
  loadSocietes,
  fetchSocieteById,
  createSociete,
  updateSociete,
  deleteSociete,
  fetchSocieteTerritories,
} from '../services/societes.thunk';
import {
  selectSocietesList,
  selectSocietesStatus,
  selectSocietesError,
  selectSocietesPagination,
} from '../services/societes.selectors';
import type { CreateSocietePayload, UpdateSocietePayload } from '../services/societes.types';

export function useSocietes() {
  const dispatch = useDispatch<AppDispatch>();

  const list = useSelector(selectSocietesList);
  const status = useSelector(selectSocietesStatus);
  const error = useSelector(selectSocietesError);
  const pagination = useSelector(selectSocietesPagination);

  const isLoading = status === 'loading';

  const load = useCallback(
    (params?: { page?: number; limit?: number; type?: string }) => {
      return dispatch(loadSocietes(params));
    },
    [dispatch]
  );

  const getById = useCallback(
    (id: string) => dispatch(fetchSocieteById(id)),
    [dispatch]
  );

  const create = useCallback(
    (payload: CreateSocietePayload) => dispatch(createSociete(payload)),
    [dispatch]
  );

  const update = useCallback(
    (id: string, payload: UpdateSocietePayload) => dispatch(updateSociete({ id, payload })),
    [dispatch]
  );

  const remove = useCallback(
    (id: string) => dispatch(deleteSociete(id)),
    [dispatch]
  );

  const loadTerritories = useCallback(
    (id: string) => dispatch(fetchSocieteTerritories(id)),
    [dispatch]
  );

  return {
    list,
    status,
    isLoading,
    error,
    pagination,
    load,
    getById,
    create,
    update,
    remove,
    loadTerritories,
  };
}
