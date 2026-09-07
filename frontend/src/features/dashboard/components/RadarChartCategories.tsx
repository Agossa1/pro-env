import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Radar } from 'react-chartjs-2';
import type { CategoryCount } from '../services/dashboard.types';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartCategoriesProps {
  data: CategoryCount[];
  isLoading: boolean;
}

export function RadarChartCategories({ data, isLoading }: RadarChartCategoriesProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 min-h-[350px] animate-pulse">
        <div className="h-4 w-32 bg-gray-100 rounded mb-6" />
        <div className="w-full h-48 bg-gray-50 rounded-full mt-4" />
      </div>
    );
  }

  // Format category labels
  const CATEGORY_LABELS: Record<string, string> = {
    drainage: 'Drainage',
    road: 'Route',
    waste: 'Déchets',
    biodiversity: 'Biodivers',
    environment: 'Environn',
    other: 'Autre',
  };

  const formattedData = data.map(item => ({
    subject: CATEGORY_LABELS[item.category] || item.category,
    A: item.count,
  }));

  const chartData = {
    labels: formattedData.map(d => d.subject),
    datasets: [
      {
        label: 'Signalements',
        data: formattedData.map(d => d.A),
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        borderColor: '#3B82F6',
        borderWidth: 1,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3B82F6'
      }
    ]
  };

  const options: ChartOptions<'radar'> = {
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
      r: {
        angleLines: {
          color: '#E5E7EB'
        },
        grid: {
          color: '#E5E7EB'
        },
        pointLabels: {
          color: '#6B7280',
          font: { size: 11 }
        },
        ticks: {
          display: false
        }
      }
    }
  };

  return (
    <div className="bg-white p-5 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 h-full flex flex-col items-center">
      <div className="w-full text-left">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Aperçu des Catégories</h2>
      </div>
      
      <div className="flex-1 w-full h-full mt-4 relative flex justify-center">
        <div className="w-full max-w-[250px] aspect-square">
          <Radar data={chartData} options={options} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          <span className="text-sm text-gray-500 font-medium">Signalements par catégorie</span>
        </div>
      </div>
    </div>
  );
}
