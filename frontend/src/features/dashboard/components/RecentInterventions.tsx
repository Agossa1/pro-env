import { useState } from 'react';
import type { RecentIntervention } from '../services/dashboard.types';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  assigned: 'bg-benin-green-light text-benin-green',
  in_progress: 'bg-amber-50 text-amber-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-rose-50 text-rose-600',
};
const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon', assigned: 'Assignée', in_progress: 'En cours',
  completed: 'Terminée', cancelled: 'Annulée',
};

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

interface Props {
  interventions: RecentIntervention[];
  isLoading: boolean;
}

export function RecentInterventions({ interventions, isLoading }: Props) {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 3;
  const visible = interventions.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Interventions récentes</h2>
        <div className="flex gap-1">
          <button
            onClick={() => setStartIndex(Math.max(0, startIndex - 1))}
            disabled={startIndex === 0}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 disabled:opacity-30 transition-all"
          >
            ‹
          </button>
          <button
            onClick={() => setStartIndex(Math.min(interventions.length - visibleCount, startIndex + 1))}
            disabled={startIndex + visibleCount >= interventions.length}
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600 disabled:opacity-30 transition-all"
          >
            ›
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-50 rounded-xl p-4">
              <div className="h-8 w-8 bg-gray-200 rounded-full mb-3" />
              <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : interventions.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">Aucune intervention récente</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {visible.map((item) => (
            <div key={item.id}
              className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
              {/* Société avatar */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-benin-green to-benin-green-dark flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {getInitials(item.societeName ?? 'NA')}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-700 truncate">{item.societeName ?? '—'}</p>
                  <p className="text-[10px] text-gray-400">{formatDate(item.createdAt)}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-800 line-clamp-2">{item.title}</p>
              <span className={`self-start text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status] ?? 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[item.status] ?? item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
