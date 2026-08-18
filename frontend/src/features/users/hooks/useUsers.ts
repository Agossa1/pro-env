import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../core/store';
import {
  selectUsers,
  selectUsersPagination,
  selectUsersStatus,
  selectUsersIsMutating,
  selectUsersError,
  selectUsersLoading,
} from '../services/users.selectors';
import { loadUsers, createUserThunk, toggleUserActiveThunk } from '../services/users.thunk';
import { clearUsersError, resetMutating } from '../services/users.slices';
import type { CreateUserDto } from '../services/users.types';

export function useUsers() {
  const dispatch = useDispatch<AppDispatch>();

  const users      = useSelector(selectUsers);
  const pagination = useSelector(selectUsersPagination);
  const status     = useSelector(selectUsersStatus);
  const error      = useSelector(selectUsersError);
  const isLoading  = useSelector(selectUsersLoading);
  const isMutating = useSelector(selectUsersIsMutating);

  // Déclenche le premier chargement si la liste est vide (facultatif, ou à faire côté composant)
  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadUsers({}));
    }
  }, [status, dispatch]);

  const reload = useCallback(
    (page?: number, limit?: number) => {
      dispatch(loadUsers({ page, limit }));
    },
    [dispatch]
  );

  const create = useCallback(
    async (dto: CreateUserDto) => {
      return await dispatch(createUserThunk(dto)).unwrap();
    },
    [dispatch]
  );

  const toggleActive = useCallback(
    async (id: string) => {
      return await dispatch(toggleUserActiveThunk(id)).unwrap();
    },
    [dispatch]
  );

  const clearError = useCallback(() => {
    dispatch(clearUsersError());
  }, [dispatch]);

  const resetMutation = useCallback(() => {
    dispatch(resetMutating());
  }, [dispatch]);

  return {
    users,
    pagination,
    status,
    error,
    isLoading,
    isMutating,

    reload,
    create,
    toggleActive,
    clearError,
    resetMutation,
  };
}
