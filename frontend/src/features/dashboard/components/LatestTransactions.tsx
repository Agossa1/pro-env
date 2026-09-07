import { User } from 'lucide-react';
import type { RecentIntervention } from '../services/dashboard.types';

interface LatestTransactionsProps {
  interventions: RecentIntervention[];
  isLoading: boolean;
}

export function LatestTransactions({ interventions, isLoading }: LatestTransactionsProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-5 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 min-h-[350px] animate-pulse">
        <div className="h-4 w-32 bg-gray-100 rounded mb-6" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full" />
                <div>
                  <div className="h-3 w-20 bg-gray-100 rounded mb-1.5" />
                  <div className="h-2 w-16 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-4 w-12 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
    pending: { label: 'En attente', style: 'bg-[#FFEDD5] text-[#EA580C]' },
    in_progress: { label: 'En cours', style: 'bg-[#FFEDD5] text-[#EA580C]' }, // pending-like
    completed: { label: 'Terminé', style: 'bg-[#D1FAE5] text-[#059669]' }, // completed-like
    cancelled: { label: 'Annulé', style: 'bg-[#FCE7F3] text-[#BE185D]' }, // failed-like
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white p-5 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 h-full overflow-hidden flex flex-col">
      <h2 className="text-lg font-bold text-gray-900 mb-5">Dernières Interventions</h2>
      
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {interventions.length === 0 ? (
          <p className="text-sm text-gray-500 font-medium text-center py-4">Aucune intervention</p>
        ) : (
          interventions.map((intervention, i) => {
            const config = STATUS_CONFIG[intervention.status] || { label: intervention.status, style: 'bg-gray-100 text-gray-500' };
            
            return (
              <div key={intervention.id} className={`flex items-center justify-between pb-4 ${i !== interventions.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-3">
                  {/* Avatar / Icon */}
                  <div className="w-8 h-8 rounded-full bg-benin-green-light text-benin-green flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  
                  {/* Text */}
                  <div className="min-w-0">
                    <h3 className="text-lg  text-gray-900 truncate">{intervention.title}</h3>
                    <p className="text-sm text-gray-600">{intervention.societeName || 'Non assigné'}</p>
                  </div>
                </div>

                {/* Right side (Status + Details) */}
                <div className="flex items-center gap-6 ml-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${config.style}`}>
                    {config.label}
                  </span>
                  
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    {/* Amount mock - we don't have amounts, maybe show territory or just Date prominently */}
                    <div className="text-sm font-semibold text-gray-800">
                      {/* Fake amount to match design, or empty */}
                      $0.00 USD
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {formatDate(intervention.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
