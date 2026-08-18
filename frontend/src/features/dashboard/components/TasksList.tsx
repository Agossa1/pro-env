import { Edit2, Trash2 } from 'lucide-react';
import type { PriorityMission } from '../services/dashboard.types';

interface TasksListProps {
  missions: PriorityMission[];
  isLoading: boolean;
}

export function TasksList({ missions, isLoading }: TasksListProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 min-h-[350px] animate-pulse">
        <div className="h-4 w-24 bg-gray-100 rounded mb-6" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-4 h-4 bg-gray-100 rounded" />
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-100 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 h-full">
      <h2 className="text-[15px] font-semibold text-[#4B5563] mb-5">Missions Prioritaires</h2>
      
      <div className="space-y-5">
        {missions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Aucune mission</p>
        ) : (
          missions.map((mission, idx) => (
            <div key={mission.id} className="flex items-start gap-3 group">
              {/* Checkbox */}
              <div className="mt-1">
                <div className={`w-3.5 h-3.5 rounded-sm border ${idx % 2 === 0 ? 'bg-benin-green border-benin-green' : 'border-gray-300'} flex items-center justify-center cursor-pointer`}>
                  {idx % 2 === 0 && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-semibold text-gray-800 truncate">{mission.title}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">{mission.territory || 'Intervention sur site'}</p>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-6 h-6 rounded bg-benin-green-light text-benin-green flex items-center justify-center hover:bg-benin-green/20 transition-colors">
                  <Edit2 className="w-3 h-3" />
                </button>
                <button className="w-6 h-6 rounded bg-[#FFEBEE] text-[#E53935] flex items-center justify-center hover:bg-red-100 transition-colors">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
