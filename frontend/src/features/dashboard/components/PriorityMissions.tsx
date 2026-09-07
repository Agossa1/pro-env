import type { PriorityMission } from '../services/dashboard.types';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  planned: 'bg-benin-green-light text-benin-green',
  in_progress: 'bg-amber-50 text-amber-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-rose-50 text-rose-600',
};
const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon', planned: 'Planifiée', in_progress: 'En cours', completed: 'Terminée', cancelled: 'Annulée',
};
const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-rose-500',
  high: 'bg-orange-400',
  medium: 'bg-amber-300',
  low: 'bg-gray-300',
};

interface Props {
  missions: PriorityMission[];
  isLoading: boolean;
}

export function PriorityMissions({ missions, isLoading }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Missions prioritaires</h2>
        <span className="text-xs text-gray-500 font-medium">{missions.length} en attente</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse flex gap-3 py-3">
              <div className="w-2 h-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-3.5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : missions.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500 font-medium">Aucune mission prioritaire en cours</div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {missions.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_COLORS[m.priorityLevel] ?? 'bg-gray-300'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{m.title}</p>
                <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">{m.territory}</p>
              </div>
              <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[m.status] ?? 'bg-gray-100 text-gray-500'}`}>
                {STATUS_LABELS[m.status] ?? m.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
