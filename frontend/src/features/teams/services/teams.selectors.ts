import type { RootState } from '../../../core/store';

export const selectTeamsData = (state: RootState) => state.teams.data;
export const selectSelectedTeam = (state: RootState) => state.teams.selectedTeam;
export const selectTeamMembers = (state: RootState) => state.teams.members;
export const selectTeamsLoading = (state: RootState) => state.teams.loading;
export const selectTeamsError = (state: RootState) => state.teams.error;
export const selectTeamsPagination = (state: RootState) => ({
  total: state.teams.total,
  page: state.teams.page,
  limit: state.teams.limit,
  totalPages: state.teams.totalPages,
});
