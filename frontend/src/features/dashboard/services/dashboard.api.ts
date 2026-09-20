import { apiClient } from '../../../libs/api-client';
import type {
  DashboardKpis,
  ActivityPoint,
  CategoryCount,
  PriorityMission,
  RecentIntervention,
  RecentReportsPagination,
  ReportMapPoint,
} from './dashboard.types';

const BASE = '/dashboard';

export async function fetchKpis(filters?: Record<string, string>): Promise<DashboardKpis> {
  const res = await apiClient.get<{ success: boolean; data: DashboardKpis }>(`${BASE}/kpis`, {
    params: filters
  });
  return res.data;
}

export async function fetchActivityChart(period: 'monthly' | 'quarterly' = 'monthly', filters?: Record<string, string>): Promise<ActivityPoint[]> {
  const res = await apiClient.get<{ success: boolean; data: ActivityPoint[] }>(
    `${BASE}/activity-chart`,
    { params: { period, ...filters } }
  );
  return res.data;
}

export async function fetchReportsByCategory(filters?: Record<string, string>): Promise<CategoryCount[]> {
  const res = await apiClient.get<{ success: boolean; data: CategoryCount[] }>(`${BASE}/reports-by-category`, { params: filters });
  return res.data;
}

export async function fetchReportsByStatus(filters?: Record<string, string>): Promise<CategoryCount[]> {
  const res = await apiClient.get<{ success: boolean; data: CategoryCount[] }>(`${BASE}/reports-by-status`, { params: filters });
  return res.data;
}

export async function fetchPriorityMissions(limit = 5, filters?: Record<string, string>): Promise<PriorityMission[]> {
  const res = await apiClient.get<{ success: boolean; data: PriorityMission[] }>(
    `${BASE}/priority-missions`,
    { params: { limit, ...filters } }
  );
  return res.data;
}

export async function fetchRecentInterventions(limit = 6, filters?: Record<string, string>): Promise<RecentIntervention[]> {
  const res = await apiClient.get<{ success: boolean; data: RecentIntervention[] }>(
    `${BASE}/recent-interventions`,
    { params: { limit, ...filters } }
  );
  return res.data;
}

export async function fetchRecentReports(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  municipalityId?: string;
  regionId?: string;
  createdBy?: string;
}): Promise<RecentReportsPagination> {
  const res = await apiClient.get<{ success: boolean; data: RecentReportsPagination['data']; pagination: any }>(
    `${BASE}/recent-reports`,
    { params }
  );
  return {
    data: Array.isArray(res.data) ? res.data : [],
    total: res.pagination?.total ?? 0,
    page: res.pagination?.page ?? 1,
    limit: res.pagination?.limit ?? 10,
    totalPages: res.pagination?.totalPages ?? 1,
  };
}

export async function fetchMapReports(limit = 100, filters?: Record<string, string>): Promise<ReportMapPoint[]> {
  const res = await apiClient.get<{ success: boolean; data: any[]; pagination: any }>(
    '/reports',
    { params: { limit, ...filters } }
  );
  const rows = Array.isArray(res.data) ? res.data : (Array.isArray((res as any).data?.data) ? (res as any).data.data : []);
  return rows
    .filter((r: any) => r.latitude != null && r.longitude != null)
    .map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.issueCategory ?? r.issue_category ?? 'other',
      status: r.status,
      priority: r.priority ?? 'medium',
      latitude: parseFloat(r.latitude),
      longitude: parseFloat(r.longitude),
      territory: r.territoryName ?? r.territory ?? '',
    }));
}
