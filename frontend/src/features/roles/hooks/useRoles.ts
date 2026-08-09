/*
 * |--------------------------------------------------------------------------
 * | useRoles — Hook React
 * |--------------------------------------------------------------------------
 * | Expose les données et actions du module rôles depuis le store Redux.
 * | Déclenche automatiquement le chargement initial si la liste est vide.
 * |--------------------------------------------------------------------------
 */

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../core/store';
import {
  selectRoles,
  selectSelectedRole,
  selectRolesStatus,
  selectRolesMutating,
  selectRolesError,
  selectRolesPagination,
  selectRolesLoading,
  selectIsMutating,
} from '../services/roles.selectors';
import {
  loadRoles,
  loadRoleById,
  createRoleThunk,
  updateRoleThunk,
  deleteRoleThunk,
} from '../services/roles.thunk';
import { selectRole, clearRolesError, resetMutating } from '../services/roles.slices';
import type { CreateRoleDto, UpdateRoleDto } from '../services/roles.types';

export function useRoles() {
  const dispatch = useDispatch<AppDispatch>();

  // ── State ─────────────────────────────────────────────────────────────────
  const roles      = useSelector(selectRoles);
  const selected   = useSelector(selectSelectedRole);
  const status     = useSelector(selectRolesStatus);
  const mutating   = useSelector(selectRolesMutating);
  const error      = useSelector(selectRolesError);
  const pagination = useSelector(selectRolesPagination);
  const isLoading  = useSelector(selectRolesLoading);
  const isMutating = useSelector(selectIsMutating);

  // ── Auto-chargement ──────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadRoles({}));
    }
  }, [status, dispatch]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const reload = useCallback(
    (page = 1, limit = 50) => dispatch(loadRoles({ page, limit })),
    [dispatch],
  );

  const loadById = useCallback(
    (id: string) => dispatch(loadRoleById(id)),
    [dispatch],
  );

  const create = useCallback(
    (dto: CreateRoleDto) => dispatch(createRoleThunk(dto)),
    [dispatch],
  );

  const update = useCallback(
    (id: string, dto: UpdateRoleDto) => dispatch(updateRoleThunk({ id, dto })),
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => dispatch(deleteRoleThunk(id)),
    [dispatch],
  );

  const select = useCallback(
    (role: Parameters<typeof selectRole>[0] extends never ? never : Parameters<typeof selectRole>[0]) =>
      dispatch(selectRole(role as any)),
    [dispatch],
  );

  const clearError = useCallback(() => dispatch(clearRolesError()), [dispatch]);
  const resetMut   = useCallback(() => dispatch(resetMutating()), [dispatch]);

  return {
    roles,
    selected,
    status,
    mutating,
    error,
    pagination,
    isLoading,
    isMutating,
    reload,
    loadById,
    create,
    update,
    remove,
    select,
    clearError,
    resetMutating: resetMut,
  };
}
