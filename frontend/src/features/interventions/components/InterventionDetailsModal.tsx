import React, { useEffect, useState } from 'react';
import { useInterventions } from '../hooks/useInterventions';
import { InterventionStatus, type FieldInterventionReport } from '../services/interventions.types';
import { apiClient, type ApiResponse } from '../../../libs/api-client';

interface Props {
  interventionId: string;
  onClose: () => void;
}

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

const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

export const InterventionDetailsModal: React.FC<Props> = ({ interventionId, onClose }) => {
  const { list, loadReports, addReport, update, remove } = useInterventions();
  const intervention = list.find(i => i.id === interventionId);

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [reports, setReports] = useState<FieldInterventionReport[]>([]);
  
  const [showReportForm, setShowReportForm] = useState(false);
  const [workDone, setWorkDone] = useState('');
  const [blockagePct, setBlockagePct] = useState(0);
  const [conditionScore, setConditionScore] = useState(0);
  const [recommendations, setRecommendations] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!intervention) return;

    // Fetch team members
    apiClient.get<ApiResponse<any>>(`/teams/${intervention.assignedTeamId}/members`)
      .then(res => {
        if (!cancelled) setTeamMembers(res.data.data || res.data || []);
      })
      .catch(console.error);

    // Fetch reports
    loadReports(interventionId).unwrap()
      .then(res => {
        if (!cancelled) setReports(res.reports);
      })
      .catch(console.error);

    return () => { cancelled = true; };
  }, [interventionId, intervention?.assignedTeamId, loadReports]);

  if (!intervention) return null;

  const handleStatusChange = async (newStatus: InterventionStatus) => {
    try {
      await update(intervention.id, { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement cette intervention ?')) return;
    try {
      await remove(intervention.id).unwrap();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await addReport({
        interventionId,
        workDone,
        blockageRemovedPct: blockagePct,
        finalConditionScore: conditionScore,
        recommendations,
        completed: true,
      }).unwrap();
      setReports([res.report, ...reports]);
      setShowReportForm(false);
      
      // Auto-complete if 100%
      if (blockagePct === 100) {
        await update(intervention.id, { status: InterventionStatus.COMPLETED });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-bold text-gray-900">Détails de l'intervention</h2>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[intervention.status]}`}>
                {STATUS_LABELS[intervention.status]}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-mono">ID: {intervention.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-8">
          
          {/* Section: Informations */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Informations logistiques</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500 mb-1">Véhicules</span>
                <span className="font-medium text-gray-900">{intervention.vehicleNotes || '—'}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Équipements</span>
                <span className="font-medium text-gray-900">{intervention.equipmentNotes || '—'}</span>
              </div>
            </div>
          </div>

          {/* Section: Participants */}
          {(intervention.status === InterventionStatus.STARTED || intervention.status === InterventionStatus.RESUMED) && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Équipe sur le terrain (Participants)</h3>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {teamMembers.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500 italic">Aucun participant ou chargement...</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {teamMembers.map(m => (
                      <li key={m.id} className="p-3 flex items-center justify-between text-sm hover:bg-gray-50">
                        <span className="font-medium text-gray-900">{m.user?.firstName} {m.user?.lastName}</span>
                        <span className="text-gray-500 capitalize">{m.role}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Section: Rapports */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Rapports terrain</h3>
              {!showReportForm && intervention.status !== InterventionStatus.COMPLETED && intervention.status !== InterventionStatus.CANCELLED && (
                <button 
                  onClick={() => setShowReportForm(true)}
                  className="text-xs font-medium text-benin-green hover:text-benin-green-dark bg-benin-green-light px-2 py-1 rounded"
                >
                  + Ajouter un rapport
                </button>
              )}
            </div>
            
            {showReportForm && (
              <form onSubmit={handleAddReport} className="mb-6 bg-benin-green-light/30 p-4 rounded-xl border border-benin-green/20 space-y-4">
                <div>
                  <label className={labelClass}>Travaux réalisés</label>
                  <textarea 
                    required rows={2} 
                    className={inputClass} 
                    value={workDone} onChange={e => setWorkDone(e.target.value)} 
                    placeholder="Description des tâches accomplies..." 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>% de dégagement</label>
                    <input 
                      type="number" min="0" max="100" required
                      className={inputClass}
                      value={blockagePct} onChange={e => setBlockagePct(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Score de condition finale (0-100)</label>
                    <input 
                      type="number" min="0" max="10" required
                      className={inputClass}
                      value={conditionScore} onChange={e => setConditionScore(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Recommandations</label>
                  <input 
                    type="text" 
                    className={inputClass} 
                    value={recommendations} onChange={e => setRecommendations(e.target.value)} 
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowReportForm(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Annuler</button>
                  <button type="submit" disabled={isSubmitting} className="px-3 py-1.5 text-xs font-medium text-white bg-benin-green hover:bg-benin-green-dark rounded-lg disabled:opacity-50">
                    {isSubmitting ? 'Envoi...' : 'Soumettre le rapport'}
                  </button>
                </div>
              </form>
            )}

            {reports.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucun rapport terrain pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {reports.map(r => (
                  <div key={r.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900">{r.workDone}</p>
                      <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg">
                      <span>Dégagement: <strong className="text-gray-900">{r.blockageRemovedPct}%</strong></span>
                      <span>Score final: <strong className="text-gray-900">{r.finalConditionScore}/100</strong></span>
                    </div>
                    {r.recommendations && (
                      <p className="text-xs text-gray-500 mt-2 italic">Recommandation: {r.recommendations}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
          <div className="flex gap-2">
            {intervention.status === InterventionStatus.NOT_STARTED && (
              <button onClick={() => handleStatusChange(InterventionStatus.STARTED)} className="px-4 py-2 text-sm font-medium text-white bg-benin-green rounded-lg hover:bg-benin-green-dark">
                Démarrer
              </button>
            )}
            {(intervention.status === InterventionStatus.STARTED || intervention.status === InterventionStatus.RESUMED) && (
              <>
                <button onClick={() => handleStatusChange(InterventionStatus.PAUSED)} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700">
                  Mettre en pause
                </button>
                <button onClick={() => handleStatusChange(InterventionStatus.COMPLETED)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                  Terminer
                </button>
              </>
            )}
            {intervention.status === InterventionStatus.PAUSED && (
              <button onClick={() => handleStatusChange(InterventionStatus.RESUMED)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                Reprendre
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors"
            >
              Supprimer
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
