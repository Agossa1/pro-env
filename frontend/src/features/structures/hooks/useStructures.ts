import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../core/store';
import {
  loadStructures,
  fetchStructureById,
  createStructure,
  updateStructure,
  deleteStructure,
} from '../services/structures.thunk';
import {
  selectStructuresList,
  selectStructuresStatus,
  selectStructuresError,
  selectStructuresPagination,
} from '../services/structures.selectors';
import type { CreateStructurePayload, UpdateStructurePayload } from '../services/structures.types';

export function useStructures() {
  const dispatch = useDispatch<AppDispatch>();

  const list = useSelector(selectStructuresList);
  const status = useSelector(selectStructuresStatus);
  const error = useSelector(selectStructuresError);
  const pagination = useSelector(selectStructuresPagination);

  const isLoading = status === 'loading';

  const load = useCallback(
    (params?: { page?: number; limit?: number; territoryId?: string; type?: string; status?: string; condition?: string; search?: string }) => {
      return dispatch(loadStructures(params));
    },
    [dispatch]
  );

  const getById = useCallback(
    (id: string) => dispatch(fetchStructureById(id)),
    [dispatch]
  );

  const create = useCallback(
    (payload: CreateStructurePayload) => dispatch(createStructure(payload)),
    [dispatch]
  );

  const update = useCallback(
    (id: string, payload: UpdateStructurePayload) => dispatch(updateStructure({ id, payload })),
    [dispatch]
  );

  const remove = useCallback(
    (id: string) => dispatch(deleteStructure(id)),
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
  };
}