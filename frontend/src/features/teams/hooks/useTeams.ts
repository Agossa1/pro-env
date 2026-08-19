import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../core/store';
import {
  fetchTeams,
  fetchTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  fetchTeamMembers,
  addTeamMember,
  removeTeamMember,
} from '../services/teams.thunk';
import {
  selectTeamsData,
  selectSelectedTeam,
  selectTeamMembers,
  selectTeamsLoading,
  selectTeamsError,
  selectTeamsPagination,
} from '../services/teams.selectors';
import type { CreateTeamPayload, UpdateTeamPayload, AddTeamMemberPayload } from '../services/teams.types';

export function useTeams() {
  const dispatch = useDispatch<AppDispatch>();

  const teams = useSelector(selectTeamsData);
  const selectedTeam = useSelector(selectSelectedTeam);
  const members = useSelector(selectTeamMembers);
  const isLoading = useSelector(selectTeamsLoading);
  const error = useSelector(selectTeamsError);
  const pagination = useSelector(selectTeamsPagination);

  const load = useCallback(
    (params?: { page?: number; limit?: number; teamType?: string; organizationId?: string }) => {
      return dispatch(fetchTeams(params));
    },
    [dispatch]
  );

  const getById = useCallback(
    (id: string) => dispatch(fetchTeamById(id)),
    [dispatch]
  );

  const create = useCallback(
    (payload: CreateTeamPayload) => dispatch(createTeam(payload)),
    [dispatch]
  );

  const update = useCallback(
    (id: string, payload: UpdateTeamPayload) => dispatch(updateTeam({ id, payload })),
    [dispatch]
  );

  const remove = useCallback(
    (id: string) => dispatch(deleteTeam(id)),
    [dispatch]
  );

  const loadMembers = useCallback(
    (id: string) => dispatch(fetchTeamMembers(id)),
    [dispatch]
  );

  const addMember = useCallback(
    (id: string, payload: AddTeamMemberPayload) => dispatch(addTeamMember({ id, payload })),
    [dispatch]
  );

  const removeMember = useCallback(
    (id: string, memberId: string) => dispatch(removeTeamMember({ id, memberId })),
    [dispatch]
  );

  return {
    teams,
    selectedTeam,
    members,
    isLoading,
    error,
    pagination,
    load,
    getById,
    create,
    update,
    remove,
    loadMembers,
    addMember,
    removeMember,
  };
}
