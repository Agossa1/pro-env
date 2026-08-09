import type { RootState } from '../../../core/store';

export const selectUsers = (state: RootState) => state.users.list;
export const selectUsersPagination = (state: RootState) => state.users.pagination;
export const selectUsersStatus = (state: RootState) => state.users.status;
export const selectUsersIsMutating = (state: RootState) => state.users.isMutating;
export const selectUsersError = (state: RootState) => state.users.error;
export const selectUsersLoading = (state: RootState) => state.users.status === 'loading';
