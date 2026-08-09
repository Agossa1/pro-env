/*
 * |--------------------------------------------------------------------------
 * | usePermissions — Hook React
 * |--------------------------------------------------------------------------
 */

import { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../core/store';
import {
  selectPermissions,
  selectPermissionsByModule,
  selectPermissionsStatus,
  selectPermissionsMutating,
  selectPermissionsError,
  selectPermissionsSelected,
} from '../services/permissions.selectors';
import {
  loadPermissions,
  loadPermissionById,
  createPermissionThunk,
  updatePermissionThunk,
  deletePermissionThunk,
  loadPermissionsByRoleThunk,
  assignPermissionsThunk,
  removePermissionThunk,
} from '../services/permissions.thunk';

import { selectPermission, clearPermissionsError, resetMutating } from '../services/permissions.slices';
import type { CreatePermissionDto, UpdatePermissionDto } from '../services/permissions.types';

export function usePermissions() {
  const dispatch = useDispatch<AppDispatch>();

  const permissions = useSelector(selectPermissions);
  const permissionsByModule = useSelector(selectPermissionsByModule);
  const selected = useSelector(selectPermissionsSelected);
  const status = useSelector(selectPermissionsStatus);
  const mutating = useSelector(selectPermissionsMutating);
  const error = useSelector(selectPermissionsError);

  const [rolePermissions, setRolePermissions] = useState<string[]>([]);

  // Auto-chargement des permissions globales
  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadPermissions({ limit: 1000 }));
    }
  }, [status, dispatch]);

  const reload = useCallback(
    () => dispatch(loadPermissions({ limit: 1000 })),
    [dispatch]
  );

  const loadById = useCallback(
    (id: string) => dispatch(loadPermissionById(id)),
    [dispatch]
  );

  const create = useCallback(
    (dto: CreatePermissionDto) => dispatch(createPermissionThunk(dto)),
    [dispatch]
  );

  const update = useCallback(
    (id: string, dto: UpdatePermissionDto) => dispatch(updatePermissionThunk({ id, dto })),
    [dispatch]
  );

  const remove = useCallback(
    (id: string) => dispatch(deletePermissionThunk(id)),
    [dispatch]
  );

  const select = useCallback(
    (perm: Parameters<typeof selectPermission>[0] extends never ? never : Parameters<typeof selectPermission>[0]) =>
      dispatch(selectPermission(perm as any)),
    [dispatch]
  );

  const clearError = useCallback(() => dispatch(clearPermissionsError()), [dispatch]);
  const resetMut   = useCallback(() => dispatch(resetMutating()), [dispatch]);

  const loadRolePermissions = useCallback(async (roleId: string) => {
    try {
      const perms = await dispatch(loadPermissionsByRoleThunk(roleId)).unwrap();
      setRolePermissions(perms.map(p => p.id));
    } catch (e) {
      console.error(e);
    }
  }, [dispatch]);

  const assignToRole = useCallback(
    (roleId: string, permissionIds: string[]) => 
      dispatch(assignPermissionsThunk({ roleId, permissionIds })).unwrap(),
    [dispatch]
  );

  const removeFromRole = useCallback(
    (roleId: string, permissionId: string) => 
      dispatch(removePermissionThunk({ roleId, permissionId })).unwrap(),
    [dispatch]
  );

  return {
    permissions,
    permissionsByModule,
    selected,
    rolePermissions,
    status,
    isMutating: mutating === 'loading',
    error,
    reload,
    loadById,
    create,
    update,
    remove,
    select,
    clearError,
    resetMutating: resetMut,
    loadRolePermissions,
    assignToRole,
    removeFromRole,
  };
}
