import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { CategoryCount } from '../services/dashboard.types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const CATEGORY_LABELS: Record<string, string> = {
  drainage: 'Drainage',
  road: 'Route',
  waste: 'Déchets',
  biodiversity: 'Biodiversité',
  environment: 'Environnement',
  other: 'Autre',
};

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

interface Props {
  data: CategoryCount[];
  isLoading: boolean;
}

export function CategoryChart({ data, isLoading }: Props) {
  const formatted = data.map((d) => ({
    name: CATEGORY_LABELS[d.category] ?? d.category,
    count: d.count,
  }));

  const chartData = {
    labels: formatted.map(d => d.name),
    datasets: [
      {
        label: 'Signalements',
        data: formatted.map(d => d.count),
        backgroundColor: formatted.map((_, i) => COLORS[i % COLORS.length]),
        borderRadius: 6,
        borderSkipped: false,
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
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
          font: { size: 10 },
        }
      },
      y: {
        grid: {
          display: false,
        },
        border: {
          display: false
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 10 },
        }
      }
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Par catégorie</h2>
          <p className="text-sm text-gray-500 font-medium mt-0.5">6 derniers mois</p>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : formatted.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-gray-500 font-medium">
          Aucune donnée disponible
        </div>
      ) : (
        <div className="text-md h-[190px] w-full relative">
          <Bar data={chartData} options={options} />
        </div>
      )}
    </div>
  );
}
