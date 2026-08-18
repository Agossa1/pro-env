import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../core/store';
import { loadMissions, createMission, updateMission, deleteMission } from '../services/missions.thunk';
import {
  selectMissionsList,
  selectMissionsStatus,
  selectMissionsError,
  selectMissionsPagination,
} from '../services/missions.selectors';
import { missionsApi } from '../services/missions.api';
import type {
  CreateMissionPayload,
  UpdateMissionPayload,
  MissionChecklistItem,
  MissionAssignment,
  MissionStatusHistory,
} from '../services/missions.types';

export function useMissions() {
  const dispatch = useDispatch<AppDispatch>();

  const missions   = useSelector(selectMissionsList);
  const status     = useSelector(selectMissionsStatus);
  const error      = useSelector(selectMissionsError);
  const pagination = useSelector(selectMissionsPagination);

  const isLoading = status === 'loading';

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const load = useCallback((params?: Record<string, any>) => {
    dispatch(loadMissions(params));
  }, [dispatch]);

  const addMission = useCallback(async (payload: CreateMissionPayload) => {
    return await dispatch(createMission(payload)).unwrap();
  }, [dispatch]);

  const editMission = useCallback(async (id: string, payload: UpdateMissionPayload) => {
    return await dispatch(updateMission({ id, payload })).unwrap();
  }, [dispatch]);

  const removeMission = useCallback(async (id: string) => {
    return await dispatch(deleteMission(id)).unwrap();
  }, [dispatch]);

  // ── Opérations directes (checklist, assignees, history) ───────────────────

  const getChecklist = useCallback(
    (missionId: string): Promise<MissionChecklistItem[]> =>
      missionsApi.getMissionChecklist(missionId),
    []
  );

  const addChecklistItem = useCallback(
    (missionId: string, label: string): Promise<MissionChecklistItem> =>
      missionsApi.addChecklistItem(missionId, label),
    []
  );

  const assignUser = useCallback(
    (missionId: string, userId: string): Promise<MissionAssignment> =>
      missionsApi.assignUser(missionId, userId),
    []
  );

  const getStatusHistory = useCallback(
    (missionId: string): Promise<MissionStatusHistory[]> =>
      missionsApi.getStatusHistory(missionId),
    []
  );

  return {
    missions,
    status,
    error,
    pagination,
    isLoading,
    load,
    addMission,
    editMission,
    removeMission,
    getChecklist,
    addChecklistItem,
    assignUser,
    getStatusHistory,
  };
}
