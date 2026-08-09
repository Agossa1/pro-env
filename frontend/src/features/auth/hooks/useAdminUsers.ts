/*
|--------------------------------------------------------------------------
| useAdminUsers — Hook de gestion des utilisateurs (côté admin)
|--------------------------------------------------------------------------
| Expose la liste, le statut de chargement, la mutation, et la création
| via le slice auth (fetchUsersThunk / adminCreateUserThunk).
|--------------------------------------------------------------------------
*/

import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../core/store';
import {
  selectUsersList,
  selectUsersPagination,
  selectUsersStatus,
  selectUsersLoading,
  selectUsersError,
  selectIsMutatingUser,
} from '../services/auth.selectors';
import { fetchUsersThunk, adminCreateUserThunk } from '../services/auth.thunk';
import { clearUsersError } from '../services/auth.slices';
import type { RegisterDto } from '../services/auth.types';

export function useAdminUsers() {
  const dispatch   = useDispatch<AppDispatch>();

  const users      = useSelector(selectUsersList);
  const pagination = useSelector(selectUsersPagination);
  const status     = useSelector(selectUsersStatus);
  const isLoading  = useSelector(selectUsersLoading);
  const error      = useSelector(selectUsersError);
  const isMutating = useSelector(selectIsMutatingUser);

  // Chargement automatique si la liste n'a jamais été chargée
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUsersThunk());
    }
  }, [status, dispatch]);

  const reload = useCallback(
    (page?: number, limit?: number) => {
      dispatch(fetchUsersThunk({ page, limit }));
    },
    [dispatch],
  );

  const createUser = useCallback(
    async (dto: RegisterDto) => {
      return dispatch(adminCreateUserThunk(dto)).unwrap();
    },
    [dispatch],
  );

  const clearError = useCallback(
    () => dispatch(clearUsersError()),
    [dispatch],
  );

  return {
    users,
    pagination,
    status,
    isLoading,
    error,
    isMutating,
    reload,
    createUser,
    clearError,
  };
}
