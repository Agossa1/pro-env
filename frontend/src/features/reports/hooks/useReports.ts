import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../core/store';
import { loadReports, createReport, updateReport, deleteReport } from '../services/reports.thunk';
import { selectReportsList, selectReportsStatus, selectReportsError, selectReportsPagination } from '../services/reports.selectors';
import type { CreateReportPayload, UpdateReportPayload } from '../services/reports.types';

export function useReports() {
  const dispatch = useDispatch<AppDispatch>();

  const reports = useSelector(selectReportsList);
  const status = useSelector(selectReportsStatus);
  const error = useSelector(selectReportsError);
  const pagination = useSelector(selectReportsPagination);

  const isLoading = status === 'loading';

  const load = useCallback((params?: any) => {
    dispatch(loadReports(params));
  }, [dispatch]);

  const addReport = useCallback(async (payload: CreateReportPayload) => {
    return await dispatch(createReport(payload)).unwrap();
  }, [dispatch]);

  const editReport = useCallback(async (id: string, payload: UpdateReportPayload) => {
    return await dispatch(updateReport({ id, payload })).unwrap();
  }, [dispatch]);

  const removeReport = useCallback(async (id: string) => {
    return await dispatch(deleteReport(id)).unwrap();
  }, [dispatch]);

  return {
    reports,
    status,
    error,
    pagination,
    isLoading,
    load,
    addReport,
    editReport,
    removeReport,
  };
}
