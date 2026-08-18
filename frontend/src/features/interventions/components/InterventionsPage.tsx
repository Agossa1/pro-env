import React, { useEffect, useState } from 'react';
import { useInterventions } from '../hooks/useInterventions';
import { InterventionStatus } from '../services/interventions.types';
import { InterventionDetailsModal } from './InterventionDetailsModal';
import { TYPE_LABELS } from '../../missions/components/MissionsPage';
import { MissionType } from '../../missions/services/missions.types';

const STATUS_COLORS: Record<InterventionStatus, string> = {
  [InterventionStatus.NOT_STARTED]: 'text-gray-600 bg-gray-100',
  [InterventionStatus.STARTED]: 'text-benin-green bg-benin-green-light',
  [InterventionStatus.PAUSED]: 'text-orange-700 bg-orange-100',
  [InterventionStatus.RESUMED]: 'text-indigo-700 bg-indigo-100',
  [InterventionStatus.COMPLETED]: 'text-green-700 bg-green-100',
  [InterventionStatus.FAILED]: 'text-red-700 bg-red-100',
  [InterventionStatus.CANCELLED]: 'text-gray-500 bg-gray-100',
};

const STATUS_LABELS: Record<InterventionStatus, string> = {
  [InterventionStatus.NOT_STARTED]: 'Nouveau',
  [InterventionStatus.STARTED]: 'Démarré',
  [InterventionStatus.PAUSED]: 'En pause',
  [InterventionStatus.RESUMED]: 'Repris',
  [InterventionStatus.COMPLETED]: 'Terminé',
  [InterventionStatus.FAILED]: 'Échec',
  [InterventionStatus.CANCELLED]: 'Annulé',
};

type TabId = 'nouveaux' | 'en_cours' | 'termines';

const TAB_MAPPING: Record<TabId, InterventionStatus[]> = {
  nouveaux: [InterventionStatus.NOT_STARTED, InterventionStatus.PAUSED],
  en_cours: [InterventionStatus.STARTED, InterventionStatus.RESUMED],
  termines: [InterventionStatus.COMPLETED, InterventionStatus.FAILED, InterventionStatus.CANCELLED],
};

export const InterventionsPage: React.FC = () => {
  const { list, isLoading, load } = useInterventions();
  const [activeTab, setActiveTab] = useState<TabId>('en_cours');
  const [selectedInterventionId, setSelectedInterventionId] = useState<string | null>(null);

  useEffect(() => {
    load({ limit: 100 });
  }, [load]);

  const filteredList = list.filter(i => TAB_MAPPING[activeTab].includes(i.status));

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50/50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Interventions</h1>
            <p className="text-sm text-gray-500 mt-1">Exécution terrain et suivi des équipes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('nouveaux')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'nouveaux'
                  ? 'border-benin-green text-benin-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Nouveaux / En pause
            </button>
            <button
              onClick={() => setActiveTab('en_cours')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'en_cours'
                  ? 'border-benin-green text-benin-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              En cours (Déployés)
            </button>
            <button
              onClick={() => setActiveTab('termines')}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'termines'
                  ? 'border-benin-green text-benin-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Terminés / Validés
            </button>
          </nav>
        </div>

        {/* Contenu */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 h-32" />
            ))}
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
            <p className="text-sm text-gray-500">Aucune intervention dans cet onglet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredList.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedInterventionId(item.id)}
                className="group relative bg-white p-5 rounded-2xl border border-gray-200 hover:border-benin-green/30 hover:shadow-lg hover:shadow-benin-green/5 transition-all cursor-pointer flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[item.status]}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {item.id.split('-')[0].toUpperCase()}
                  </span>
                </div>
                
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                  Type : {TYPE_LABELS[item.interventionType as MissionType] || item.interventionType}
                </h3>
                
                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {selectedInterventionId && (
        <InterventionDetailsModal
          interventionId={selectedInterventionId}
          onClose={() => setSelectedInterventionId(null)}
        />
      )}
    </div>
  );
};
