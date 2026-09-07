import { useDashboard } from '../features/dashboard/hooks/useDashboard';
import { KpiCards } from '../features/dashboard/components/KpiCards';
import { ActivityChart } from '../features/dashboard/components/ActivityChart';
import { DonutChart } from '../features/dashboard/components/DonutChart';
import { TasksList } from '../features/dashboard/components/TasksList';
import { RadarChartCategories } from '../features/dashboard/components/RadarChartCategories';
import { LatestTransactions } from '../features/dashboard/components/LatestTransactions';
import { PerformanceGauge } from '../features/dashboard/components/PerformanceGauge';
import { LeadsReportTable } from '../features/dashboard/components/LeadsReportTable';
import { ReportsMap } from '../features/dashboard/components/ReportsMap';

function Dashboard() {
  const {
    kpis,
    activityData,
    categoryData,
    statusData,
    priorityMissions,
    recentInterventions,
    mapReports,
    recentReports,
    period,
    setPeriod,
    setReportPage,
    reportSearch,
    setReportSearch,
    reportStatus,
    setReportStatus,
    isLoading,
    error,
  } = useDashboard();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Vue d'ensemble</h1>
        <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">Récapitulatif de la plateforme et statistiques clés</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200 font-medium">
          {error}
        </div>
      )}

      {/* 1. KPIs — 1 col mobile, 2 cols sm, 5 cols lg */}
      <KpiCards kpis={kpis} isLoading={isLoading} />

      {/* 2. Graphiques — empilés sur mobile, côte à côte sur lg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <ActivityChart
            data={activityData}
            period={period}
            onPeriodChange={setPeriod}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-1">
          <DonutChart data={statusData} isLoading={isLoading} />
        </div>
      </div>

      {/* 3. Carte des Signalements */}
      <ReportsMap reports={mapReports} isLoading={isLoading} />

      {/* 4. Tasks / Radar / Transactions — empilés sur mobile, 3 cols sur md */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <TasksList missions={priorityMissions} isLoading={isLoading} />
        <RadarChartCategories data={categoryData} isLoading={isLoading} />
        <LatestTransactions interventions={recentInterventions} isLoading={isLoading} />
      </div>

      {/* 5. Performance + Leads Report — empilés sur mobile, côte à côte sur lg */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="lg:col-span-1">
          <PerformanceGauge
            rate={kpis?.resolutionRate ?? 0}
            rateChange={kpis?.resolutionRateChange ?? 0}
            isLoading={isLoading}
          />
        </div>
        <div className="lg:col-span-3">
          <LeadsReportTable
            result={recentReports}
            search={reportSearch}
            status={reportStatus}
            onSearchChange={setReportSearch}
            onStatusChange={setReportStatus}
            onPageChange={setReportPage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;