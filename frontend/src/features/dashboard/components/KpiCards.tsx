import { FiAlertTriangle, FiTarget, FiTool, FiBriefcase, FiPieChart, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import type { DashboardKpis } from '../services/dashboard.types';

interface KpiCardsProps {
  kpis: DashboardKpis | null;
  isLoading: boolean;
}

export function KpiCards({ kpis, isLoading }: KpiCardsProps) {
  const cards = [
    {
      title: 'Total Signalements',
      value: kpis?.totalReports?.toLocaleString() ?? '0',
      change: kpis?.reportsChangePercent ?? 0,
      icon: FiAlertTriangle,
      iconBg: 'bg-[#E1EFFF]',
      iconColor: 'text-[#1E88E5]',
    },
    {
      title: 'Missions Actives',
      value: kpis?.activeMissions?.toLocaleString() ?? '0',
      change: -1.5,
      icon: FiTarget,
      iconBg: 'bg-[#F2E7F5]',
      iconColor: 'text-[#8E24AA]',
    },
    {
      title: 'Interventions',
      value: kpis?.activeInterventions?.toLocaleString() ?? '0',
      change: 12.8,
      icon: FiTool,
      iconBg: 'bg-[#FCE4EC]',
      iconColor: 'text-[#E91E63]',
    },
    {
      title: 'Sociétés Actives',
      value: kpis?.activeSocietes?.toLocaleString() ?? '0',
      change: -18,
      icon: FiBriefcase,
      iconBg: 'bg-[#FFF3E0]',
      iconColor: 'text-[#F57C00]',
    },
    {
      title: 'Taux Résolution',
      value: `${kpis?.resolutionRate ?? 0}%`,
      change: kpis?.resolutionRateChange ?? 0,
      icon: FiPieChart,
      iconBg: 'bg-[#E8F5E9]',
      iconColor: 'text-[#43A047]',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 h-28 animate-pulse">
            <div className="flex gap-3 items-center">
              <div className="w-9 h-9 bg-gray-100 rounded-full" />
              <div className="w-16 h-3 bg-gray-100 rounded" />
            </div>
            <div className="mt-5 w-12 h-5 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const isPositive = card.change > 0;
        const isNegative = card.change < 0;

        return (
          <div key={i} className="bg-white p-5 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col justify-between">
            {/* Top row: circular icon + label */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <span className="text-[13px] font-medium text-gray-500 leading-tight">{card.title}</span>
            </div>

            {/* Bottom row: value + trend */}
            <div className="mt-5 flex items-end justify-between">
              <span className="text-[22px] font-bold text-gray-900 leading-none">
                {card.value}
              </span>

              <div className="flex flex-col items-end">
                <div className={`flex items-center gap-1 text-[11px] font-semibold ${isPositive ? 'text-[#43A047]' : isNegative ? 'text-[#E53935]' : 'text-gray-400'}`}>
                  {isPositive && <FiTrendingUp className="w-3 h-3" />}
                  {isNegative && <FiTrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}{card.change}%
                </div>
                <span className="text-[10px] text-gray-400 mt-0.5">Last 7 days</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
