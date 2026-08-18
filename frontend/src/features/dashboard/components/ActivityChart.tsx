import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ActivityPoint } from '../services/dashboard.types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface ActivityChartProps {
  data: ActivityPoint[];
  period: 'monthly' | 'quarterly';
  onPeriodChange: (p: 'monthly' | 'quarterly') => void;
  isLoading: boolean;
}

export function ActivityChart({ data, period, onPeriodChange, isLoading }: ActivityChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 h-[380px] animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-4 w-32 bg-gray-100 rounded" />
          <div className="h-6 w-24 bg-gray-100 rounded" />
        </div>
        <div className="h-64 bg-gray-50 rounded" />
      </div>
    );
  }

  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        fill: true,
        label: 'Signalements',
        data: data.map(d => d.reports),
        borderColor: '#EC4899',
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#EC4899',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        fill: true,
        label: 'Missions',
        data: data.map(d => d.missions),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          boxHeight: 6,
          color: '#6B7280',
          font: { size: 12 }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#fff',
        titleColor: '#6B7280',
        bodyColor: '#374151',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 11 },
          padding: 10
        }
      },
      y: {
        grid: {
          color: '#F3F4F6',
        },
        border: {
          display: false,
          dash: [3, 3]
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 11 },
          padding: 10,
          callback: function(value: any) {
            if (value === 0) return '0';
            if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
            return value.toString();
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  return (
    <div className="bg-white p-5 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col h-[380px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[15px] font-semibold text-[#4B5563]">Aperçu de l'Activité</h2>
        <select
          value={period}
          onChange={(e) => onPeriodChange(e.target.value as 'monthly' | 'quarterly')}
          className="text-xs bg-[#F3F4F6] text-gray-600 border-none rounded px-3 py-1.5 focus:outline-none cursor-pointer font-medium"
        >
          <option value="monthly">Cette Année</option>
          <option value="quarterly">Trimestriel</option>
        </select>
      </div>

      <div className="flex-1 min-h-0 w-full relative">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
