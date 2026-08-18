import { useState, useEffect, useCallback } from 'react';
import {
  fetchKpis,
  fetchActivityChart,
  fetchReportsByCategory,
  fetchReportsByStatus,
  fetchPriorityMissions,
  fetchRecentInterventions,
  fetchRecentReports,
  fetchMapReports,
} from '../services/dashboard.api';
import type {
  DashboardKpis,
  ActivityPoint,
  CategoryCount,
  PriorityMission,
  RecentIntervention,
  RecentReportsPagination,
  ReportMapPoint,
} from '../services/dashboard.types';

export function useDashboard() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [activityData, setActivityData] = useState<ActivityPoint[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryCount[]>([]);
  const [statusData, setStatusData] = useState<CategoryCount[]>([]);
  const [priorityMissions, setPriorityMissions] = useState<PriorityMission[]>([]);
  const [recentInterventions, setRecentInterventions] = useState<RecentIntervention[]>([]);
  const [mapReports, setMapReports] = useState<ReportMapPoint[]>([]);
  const [recentReports, setRecentReports] = useState<RecentReportsPagination>({
    data: [], total: 0, page: 1, limit: 10, totalPages: 1,
  });

  const [period, setPeriod] = useState<'monthly' | 'quarterly'>('monthly');
  const [reportPage, setReportPage] = useState(1);
  const [reportSearch, setReportSearch] = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [k, a, c, s, pm, ri, mr] = await Promise.all([
        fetchKpis(),
        fetchActivityChart(period),
        fetchReportsByCategory(),
        fetchReportsByStatus(),
        fetchPriorityMissions(),
        fetchRecentInterventions(),
        fetchMapReports(200),
      ]);
      setKpis(k);
      setActivityData(a);
      setCategoryData(c);
      setStatusData(s);
      setPriorityMissions(pm);
      setRecentInterventions(ri);
      setMapReports(mr);
    } catch (e: any) {
      setError(e?.message ?? 'Erreur de chargement du dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Recharge les signalements quand filtres/page changent
  useEffect(() => {
    fetchRecentReports({ page: reportPage, search: reportSearch, status: reportStatus }).then(setRecentReports);
  }, [reportPage, reportSearch, reportStatus]);

  return {
    kpis,
    activityData,
    categoryData,
    statusData,
    priorityMissions,
    recentInterventions,
    mapReports,
    recentReports,
    period, setPeriod,
    reportPage, setReportPage,
    reportSearch, setReportSearch,
    reportStatus, setReportStatus,
    isLoading,
    error,
    reload: loadAll,
  };
}
