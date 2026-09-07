import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FiDollarSign, FiPieChart } from 'react-icons/fi';

ChartJS.register(ArcElement, Tooltip);

interface PerformanceGaugeProps {
  rate: number;
  rateChange: number;
  isLoading: boolean;
}

export function PerformanceGauge({ rate, rateChange, isLoading }: PerformanceGaugeProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 min-h-[350px] flex flex-col animate-pulse">
        <div className="h-4 w-32 bg-gray-100 rounded mb-8" />
        <div className="flex-1 flex justify-center mt-10">
          <div className="w-48 h-24 bg-gray-50 rounded-t-full" />
        </div>
      </div>
    );
  }

  const data = {
    datasets: [
      {
        data: [rate, Math.max(0, 100 - rate)],
        backgroundColor: ['#F28E2B', '#F3F4F6'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      }
    ]
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '80%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: false
      }
    }
  };

  return (
    <div className="bg-white p-5 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 h-full flex flex-col justify-between">
      <h2 className="text-lg font-bold text-gray-900">Performance globale</h2>
      
      <div className="flex-1 relative flex items-center justify-center mt-8">
        <div className="w-full h-[180px] relative">
          <div className="absolute inset-0 pb-10">
            <Doughnut data={data} options={options} />
          </div>
          
          {/* Center Text */}
          <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center pointer-events-none">
            <span className="text-xl font-bold text-gray-900">{rate}%</span>
            <span className="text-md font-semibold text-gray-900 mt-1">Résolus</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-[#4B5563]">
          {rateChange >= 0 ? '+' : ''}{rateChange}% d'évolution par rapport au mois dernier.
        </p>
      </div>

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#E3F2FD] text-[#1E88E5] flex items-center justify-center">
            <FiDollarSign className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-md text-gray-500 font-medium">Ce mois</span>
            <span className="text-sm font-bold text-gray-800">{rate}%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-md text-gray-500 font-medium">Mois prec.</span>
            <span className="text-sm font-bold text-gray-800">{Math.max(0, rate - rateChange)}%</span>
          </div>
          <div className="w-8 h-8 rounded bg-[#E8F5E9] text-[#43A047] flex items-center justify-center">
            <FiPieChart className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
