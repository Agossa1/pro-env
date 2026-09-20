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
import { useAuth } from '../../auth/hooks/useAuth';
import { UserRoleCode } from '../../auth/services/auth.types';
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

  const { user } = useAuth();

  const getRoleFilters = useCallback(() => {
    if (!user) return {};
    const filters: Record<string, string> = {};
    if (user.role?.code === UserRoleCode.admin_mairie && user.municipalityId) {
      filters.municipalityId = user.municipalityId;
    } else if (user.role?.code === UserRoleCode.prefecture && user.regionId) {
      filters.regionId = user.regionId;
    } else if (user.role?.code === UserRoleCode.technicien) {
      filters.createdBy = user.id;
    }
    return filters;
  }, [user]);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const filters = getRoleFilters();
    try {
      const [k, a, c, s, pm, ri, mr] = await Promise.all([
        fetchKpis(filters),
        fetchActivityChart(period, filters),
        fetchReportsByCategory(filters),
        fetchReportsByStatus(filters),
        fetchPriorityMissions(5, filters),
        fetchRecentInterventions(6, filters),
        fetchMapReports(200, filters),
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
    const filters = getRoleFilters();
    fetchRecentReports({ page: reportPage, search: reportSearch, status: reportStatus, ...filters }).then(setRecentReports);
  }, [reportPage, reportSearch, reportStatus, getRoleFilters]);

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
