export interface DashboardKpis {
  totalReports: number;
  reportsThisMonth: number;
  reportsChangePercent: number;
  activeMissions: number;
  activeInterventions: number;
  activeSocietes: number;
  resolutionRate: number;
  resolutionRateChange: number;
}

export interface ActivityPoint {
  month: string;
  reports: number;
  missions: number;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface PriorityMission {
  id: string;
  title: string;
  territory: string;
  status: string;
  priorityLevel: string;
  scheduledAt: string | null;
}

export interface RecentIntervention {
  id: string;
  title: string;
  societeName: string;
  status: string;
  createdAt: string;
}

export interface RecentReport {
  id: string;
  title: string;
  category: string;
  territory: string;
  status: string;
  reportedAt: string;
  priority: string;
  latitude: number | null;
  longitude: number | null;
}

export interface RecentReportsPagination {
  data: RecentReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReportMapPoint {
  id: string;
  title: string;
  category: string;
  status: string;
  priority: string;
  latitude: number;
  longitude: number;
  territory: string;
}
