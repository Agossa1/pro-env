import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FiArrowUp } from 'react-icons/fi';
import type { CategoryCount } from '../services/dashboard.types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
  data: CategoryCount[];
  isLoading: boolean;
}

const COLORS = ['#059669', '#4F46E5', '#F97316', '#EF4444', '#8B5CF6'];

export function DonutChart({ data, isLoading }: DonutChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 h-[380px] animate-pulse flex flex-col">
        <div className="h-4 w-32 bg-gray-100 rounded mb-6" />
        <div className="w-48 h-48 rounded-full border-[12px] border-gray-100 mx-auto mt-4" />
      </div>
    );
  }

  // Format status labels
  const STATUS_LABELS: Record<string, string> = {
    submitted: 'Nouveau',
    in_review: 'En révision',
    assigned: 'Assigné',
    resolved: 'Résolu',
    closed: 'Fermé',
    rejected: 'Rejeté',
  };

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const formattedData = data.map((item, index) => ({
    name: STATUS_LABELS[item.category] || item.category,
    value: item.count,
    color: COLORS[index % COLORS.length],
    percentage: total > 0 ? ((item.count / total) * 100).toFixed(2) : '0',
  }));

  // We only take the top 3-4 for a cleaner donut if needed, or all. The design shows 3.
  const displayData = formattedData.slice(0, 3);

  const chartData = {
    labels: displayData.map(d => d.name),
    datasets: [
      {
        data: displayData.map(d => d.value),
        backgroundColor: displayData.map(d => d.color),
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#6B7280',
        bodyColor: '#374151',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
      }
    }
  };

  return (
    <div className="bg-white p-5 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 h-[380px] flex flex-col relative">
      <h2 className="text-lg font-bold text-gray-900 mb-2">Statut des Signalements</h2>
      
      <div className="flex-1 min-h-0 relative flex items-center justify-center pb-20">
        <div className="w-[220px] h-[220px]">
          <Doughnut data={chartData} options={options} />
        </div>
      </div>

      {/* Legend below the chart, matching the design exactly */}
      <div className="absolute bottom-5 right-5 left-5">
        <div className="flex flex-col gap-3">
          {displayData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-gray-500">{item.name}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                <FiArrowUp className="w-3 h-3 text-emerald-500" />
                {item.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
