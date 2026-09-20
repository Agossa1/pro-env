import React, { useEffect, useState } from 'react';
import { useMissions } from '../hooks/useMissions';
import { useTerritory } from '../../territory/hooks/useTerritory';
import {
  MissionStatus,
  MissionType,
  PriorityLevel,
  type Mission,
  type MissionChecklistItem,
  type MissionStatusHistory,
} from '../services/missions.types';
import { CreateInterventionModal } from '../../interventions/components/CreateInterventionModal';
import { useInterventions } from '../../interventions/hooks/useInterventions';
import { useAuth } from '../../auth/hooks/useAuth';

interface Props {
  mission: Mission;
  onClose: () => void;
}

const STATUS_LABELS: Record<MissionStatus, string> = {
  [MissionStatus.DRAFT]: 'Brouillon',
  [MissionStatus.PLANNED]: 'Planifiée',
  [MissionStatus.ASSIGNED]: 'Assignée',
  [MissionStatus.ACCEPTED]: 'Acceptée',
  [MissionStatus.REJECTED]: 'Rejetée',
  [MissionStatus.IN_PROGRESS]: 'En cours',
  [MissionStatus.SUSPENDED]: 'Suspendue',
  [MissionStatus.COMPLETED]: 'Terminée',
  [MissionStatus.CANCELLED]: 'Annulée',
  [MissionStatus.CLOSED]: 'Clôturée',
};

const STATUS_COLORS: Record<MissionStatus, string> = {
  [MissionStatus.DRAFT]: 'bg-gray-100 text-gray-600',
  [MissionStatus.PLANNED]: 'bg-benin-green-light text-benin-green',
  [MissionStatus.ASSIGNED]: 'bg-indigo-50 text-indigo-600',
  [MissionStatus.ACCEPTED]: 'bg-emerald-50 text-emerald-700',
  [MissionStatus.REJECTED]: 'bg-red-50 text-red-700',
  [MissionStatus.IN_PROGRESS]: 'bg-amber-50 text-amber-700',
  [MissionStatus.SUSPENDED]: 'bg-orange-50 text-orange-700',
  [MissionStatus.COMPLETED]: 'bg-teal-50 text-teal-700',
  [MissionStatus.CANCELLED]: 'bg-rose-50 text-rose-700',
  [MissionStatus.CLOSED]: 'bg-gray-100 text-gray-500',
};

const STATUS_DOT: Record<MissionStatus, string> = {
  [MissionStatus.DRAFT]: 'bg-gray-400',
  [MissionStatus.PLANNED]: 'bg-benin-green',
  [MissionStatus.ASSIGNED]: 'bg-indigo-500',
  [MissionStatus.ACCEPTED]: 'bg-emerald-500',
  [MissionStatus.REJECTED]: 'bg-red-500',
  [MissionStatus.IN_PROGRESS]: 'bg-amber-500',
  [MissionStatus.SUSPENDED]: 'bg-orange-500',
  [MissionStatus.COMPLETED]: 'bg-teal-500',
  [MissionStatus.CANCELLED]: 'bg-rose-500',
  [MissionStatus.CLOSED]: 'bg-gray-400',
};

const TYPE_LABELS: Record<MissionType, string> = {
  [MissionType.REPAIR]: 'Réparation',
  [MissionType.MAINTENANCE]: 'Maintenance',
  [MissionType.INSPECTION]: 'Inspection',
  [MissionType.CLEANING]: 'Nettoyage',
  [MissionType.CONSTRUCTION]: 'Construction',
  [MissionType.OTHER]: 'Autre',
};

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: 'text-gray-500 bg-gray-100',
  [PriorityLevel.MEDIUM]: 'text-amber-700 bg-amber-50',
  [PriorityLevel.HIGH]: 'text-orange-700 bg-orange-50',
  [PriorityLevel.URGENT]: 'text-red-700 bg-red-50',
  [PriorityLevel.CRITICAL]: 'text-rose-800 bg-rose-50',
};

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: 'Faible',
  [PriorityLevel.MEDIUM]: 'Modérée',
  [PriorityLevel.HIGH]: 'Haute',
  [PriorityLevel.URGENT]: 'Urgente',
  [PriorityLevel.CRITICAL]: 'Critique',
};

// Transitions de statut autorisées de base
const STATUS_TRANSITIONS: Partial<Record<MissionStatus, MissionStatus[]>> = {
  [MissionStatus.DRAFT]: [MissionStatus.PLANNED, MissionStatus.CANCELLED],
  [MissionStatus.PLANNED]: [MissionStatus.ASSIGNED, MissionStatus.CANCELLED],
  [MissionStatus.ASSIGNED]: [MissionStatus.ACCEPTED, MissionStatus.REJECTED],
  [MissionStatus.ACCEPTED]: [MissionStatus.IN_PROGRESS, MissionStatus.CANCELLED],
  [MissionStatus.IN_PROGRESS]: [MissionStatus.SUSPENDED, MissionStatus.COMPLETED],
  [MissionStatus.SUSPENDED]: [MissionStatus.IN_PROGRESS, MissionStatus.CANCELLED],
  [MissionStatus.COMPLETED]: [MissionStatus.CLOSED],
};

const MetaCell: React.FC<{ label: string; value: React.ReactNode; wide?: boolean }> = ({ label, value, wide }) => (
  <div className={`flex flex-col gap-0.5 py-3 px-4 rounded-lg bg-gray-50 border border-gray-100${wide ? ' col-span-2' : ''}`}>
    <span className="text-xs text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-800">{value}</span>
  </div>
);

export const MissionDetailsModal: React.FC<Props> = ({ mission, onClose }) => {
  const { user } = useAuth();
  const { editMission, getChecklist, getStatusHistory, isLoading } = useMissions();
  const { list: interventionList, load: loadInterventionsForMission } = useInterventions();
  const { territories } = useTerritory();

  const [checklist, setChecklist] = useState<MissionChecklistItem[]>([]);
  const [history, setHistory] = useState<MissionStatusHistory[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [isCreateInterventionOpen, setIsCreateInterventionOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingExtras(true);
    
    Promise.all([
      getChecklist(mission.id),
      getStatusHistory(mission.id)
    ])
      .then(([checklistData, historyData]) => {
        if (!cancelled) {
          setChecklist(checklistData);
          setHistory(historyData);
        }
      })
      .catch((err) => {
        console.error('Erreur chargement détails mission:', err);
      })
      .finally(() => {
        if (!cancelled) setLoadingExtras(false);
      });

    loadInterventionsForMission({ missionId: mission.id, limit: 100 });

    return () => {
      cancelled = true;
    };
  }, [mission.id, getChecklist, getStatusHistory]);

  const territoryName = mission.territoryName
    ?? mission.municipalityName
    ?? territories.find((t) => t.id === mission.municipalityId)?.name
    ?? '—';
  const transitions = STATUS_TRANSITIONS[mission.status] ?? [];
  const missionInterventions = interventionList.filter((i) => i.missionId === mission.id);

  const handleStatusChange = async (newStatus: MissionStatus) => {
    try {
      await editMission(mission.id, { status: newStatus });
    } catch (err: any) {
      alert(err?.message || 'Erreur lors du changement de statut.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* En-tête */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4 shrink-0">
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${STATUS_COLORS[mission.status]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[mission.status]}`} />
                {STATUS_LABELS[mission.status]}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${PRIORITY_COLORS[mission.priorityLevel]}`}>
                {PRIORITY_LABELS[mission.priorityLevel]}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-benin-green-light text-benin-green">
                {TYPE_LABELS[mission.missionType] || mission.missionType}
              </span>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 leading-tight truncate">{mission.title}</h2>
            
            <p className="text-sm text-gray-500 mt-0.5">
              Territoire d'intervention : {territoryName}
            </p>
            <p className="text-[10px] text-gray-300 mt-1.5 font-mono">{mission.id}</p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100 shrink-0 -mt-0.5"
            aria-label="Fermer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Description */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1.5">Description de la mission</p>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
              {mission.description || <span className="text-gray-400 italic">Aucune description fournie.</span>}
            </p>
          </div>

          {/* Métadonnées */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">Informations</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <MetaCell label="Créée le" value={new Date(mission.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} />
              <MetaCell label="Créée par (ID)" value={<span className="font-mono text-xs">{mission.createdBy.substring(0, 8)}...</span>} />
              
              {mission.scheduledAt && (
                <MetaCell label="Date prévue" value={new Date(mission.scheduledAt).toLocaleDateString('fr-FR')} />
              )}
              {mission.dueDate && (
                <MetaCell label="Échéance" value={new Date(mission.dueDate).toLocaleDateString('fr-FR')} />
              )}
              {mission.estimatedHours && (
                <MetaCell label="Heures estimées" value={`${mission.estimatedHours} h`} />
              )}
              {mission.actualHours && (
                <MetaCell label="Heures réelles" value={`${mission.actualHours} h`} />
              )}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">Checklist de la mission</p>
            {loadingExtras ? (
              <p className="text-sm text-gray-400 italic">Chargement...</p>
            ) : checklist.length === 0 ? (
              <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100">Aucune tâche assignée à cette mission.</p>
            ) : (
              <ul className="space-y-2">
                {checklist.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <input 
                      type="checkbox" 
                      checked={item.done} 
                      readOnly 
                      className="mt-0.5 rounded text-benin-green focus:ring-benin-green w-4 h-4 cursor-default"
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${item.done ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {item.label}
                      </p>
                      {item.done && item.doneAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Validé le {new Date(item.doneAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Interventions de la mission */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-400">Interventions de la mission</p>
              <span className="text-xs bg-benin-green-light text-benin-green px-2 py-0.5 rounded-full font-medium">{missionInterventions.length}</span>
            </div>
            {missionInterventions.length === 0 ? (
              <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100">Aucune intervention créée pour cette mission.</p>
            ) : (
              <ul className="space-y-2">
                {missionInterventions.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.interventionType}</p>
                      <p className="text-xs text-gray-400 font-mono">{item.id.split('-')[0].toUpperCase()}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                      {item.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Historique des statuts */}
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">Historique des statuts</p>
            {loadingExtras ? (
              <p className="text-sm text-gray-400 italic">Chargement...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucun historique disponible.</p>
            ) : (
              <div className="space-y-3 pl-2">
                {history.map((h, i) => (
                  <div key={h.id} className="relative flex gap-4">
                    {/* Ligne verticale */}
                    {i !== history.length - 1 && (
                      <div className="absolute left-[7px] top-5 bottom-[-16px] w-px bg-gray-200" />
                    )}
                    {/* Point */}
                    <div className="relative mt-1.5 w-4 h-4 rounded-full bg-benin-green-light border-2 border-white ring-1 ring-gray-200 flex-shrink-0 z-10" />
                    
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        {h.oldStatus && (
                          <span className="text-gray-500 mr-2 line-through">{STATUS_LABELS[h.oldStatus]}</span>
                        )}
                        <span className="font-medium text-gray-900">{STATUS_LABELS[h.newStatus]}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Le {new Date(h.createdAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Changement de statut */}
          {transitions.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-medium text-gray-400 mb-2">Action rapide : Changer le statut</p>
              <div className="flex flex-wrap gap-2">
                {transitions.map((nextStatus) => (
                  <button
                    key={nextStatus}
                    onClick={() => handleStatusChange(nextStatus)}
                    disabled={isLoading}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-medium border transition-opacity disabled:opacity-50 ${STATUS_COLORS[nextStatus]} border-current/10 hover:opacity-75`}
                  >
                    Passer à "{STATUS_LABELS[nextStatus]}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pied */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          {(
            user?.role?.code === 'super_admin' || 
            user?.role?.code === 'admin_mairie' || 
            mission.status === MissionStatus.PLANNED || 
            mission.status === MissionStatus.ASSIGNED || 
            mission.status === MissionStatus.IN_PROGRESS
          ) && (
            <button
              onClick={() => setIsCreateInterventionOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-benin-green hover:bg-benin-green-dark transition-colors"
            >
              Créer une intervention
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>

      {isCreateInterventionOpen && (
        <CreateInterventionModal
          missionId={mission.id}
          missionType={mission.missionType}
          onClose={() => {
            setIsCreateInterventionOpen(false);
            loadInterventionsForMission({ missionId: mission.id, limit: 100 });
          }}
        />
      )}
    </div>
  );
};
