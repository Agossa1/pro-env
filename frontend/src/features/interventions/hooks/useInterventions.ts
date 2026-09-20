import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../core/store';
import {
  loadInterventions,
  fetchInterventionById,
  createIntervention,
  updateIntervention,
  deleteIntervention,
  fetchInterventionReports,
  createFieldReport
} from '../services/interventions.thunk';
import {
  selectInterventionList,
  selectInterventionStatus,
  selectInterventionError,
  selectInterventionPagination
} from '../services/interventions.selectors';
import type { CreateInterventionPayload, UpdateInterventionPayload, CreateFieldReportPayload } from '../services/interventions.types';

export function useInterventions() {
  const dispatch = useDispatch<AppDispatch>();

  const list = useSelector(selectInterventionList);
  const status = useSelector(selectInterventionStatus);
  const error = useSelector(selectInterventionError);
  const pagination = useSelector(selectInterventionPagination);

  const isLoading = status === 'loading';

  const load = useCallback(
    (params?: { page?: number; limit?: number; status?: string; missionId?: string; teamId?: string; regionId?: string; municipalityId?: string; districtId?: string; neighborhoodId?: string; createdBy?: string; assignedTo?: string; [key: string]: any }) => {
      return dispatch(loadInterventions(params));
    },
    [dispatch]
  );

  const getById = useCallback(
    (id: string) => dispatch(fetchInterventionById(id)),
    [dispatch]
  );

  const create = useCallback(
    (payload: CreateInterventionPayload) => dispatch(createIntervention(payload)),
    [dispatch]
  );

  const update = useCallback(
    (id: string, payload: UpdateInterventionPayload) => dispatch(updateIntervention({ id, payload })),
    [dispatch]
  );

  const remove = useCallback(
    (id: string) => dispatch(deleteIntervention(id)),
    [dispatch]
  );

  const loadReports = useCallback(
    (id: string) => dispatch(fetchInterventionReports(id)),
    [dispatch]
  );

  const addReport = useCallback(
    (payload: CreateFieldReportPayload) => dispatch(createFieldReport(payload)),
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
    loadReports,
    addReport,
  };
}
