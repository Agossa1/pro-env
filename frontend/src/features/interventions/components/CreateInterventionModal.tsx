import React, { useState, useEffect } from 'react';
import { useInterventions } from '../hooks/useInterventions';
import { apiClient, type ApiResponse } from '../../../libs/api-client';
import { MissionType } from '../../missions/services/missions.types';

interface Props {
  missionId: string;
  missionType: string;
  onClose: () => void;
}

interface Societe {
  id: string;
  name: string;
  type: string;
}

const TYPE_LABELS: Record<string, string> = {
  [MissionType.REPAIR]: 'Réparation',
  [MissionType.MAINTENANCE]: 'Maintenance',
  [MissionType.INSPECTION]: 'Inspection',
  [MissionType.CLEANING]: 'Nettoyage',
  [MissionType.CONSTRUCTION]: 'Construction',
  [MissionType.OTHER]: 'Autre',
};

const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

export const CreateInterventionModal: React.FC<Props> = ({ missionId, missionType, onClose }) => {
  const { create } = useInterventions();
  
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  
  const [selectedSocieteId, setSelectedSocieteId] = useState('');
  const [vehicleNotes, setVehicleNotes] = useState('');
  const [equipmentNotes, setEquipmentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchSocietes = async () => {
      setLoadingTeams(true);
      try {
        const res = await apiClient.get<ApiResponse<any>>('/societes', {
          params: { limit: 100 },
        });
        if (!cancelled) {
          setSocietes(res.data.data || res.data || []);
        }
      } catch (err: any) {
        if (!cancelled) setError("Impossible de charger les sociétés.");
      } finally {
        if (!cancelled) setLoadingTeams(false);
      }
    };
    fetchSocietes();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSocieteId) {
      setError("Veuillez sélectionner une société prestataire.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await create({
        missionId,
        assignedSocieteId: selectedSocieteId,
        interventionType: missionType,
        vehicleNotes: vehicleNotes || null,
        equipmentNotes: equipmentNotes || null,
      }).unwrap();
      onClose();
    } catch (err: any) {
      setError(err || "Une erreur est survenue lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nouvelle Intervention</h2>
            <p className="text-sm text-gray-500">Planifier l'exécution sur le terrain</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            
            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-gray-500 mb-3">Informations générales</p>
              
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Type d'intervention</label>
                  <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium cursor-not-allowed">
                    {TYPE_LABELS[missionType] || missionType} (hérité de la mission)
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Équipe assignée (Société prestataire) *</label>
                  <select
                    value={selectedSocieteId}
                    onChange={(e) => setSelectedSocieteId(e.target.value)}
                    className={inputClass}
                    required
                    disabled={loadingTeams}
                  >
                    <option value="">{loadingTeams ? 'Chargement...' : 'Sélectionner une société...'}</option>
                    {societes.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-3">Logistique (Optionnel)</p>
              
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Véhicules (Immatriculation, type)</label>
                  <input
                    type="text"
                    value={vehicleNotes}
                    onChange={(e) => setVehicleNotes(e.target.value)}
                    className={inputClass}
                    placeholder="Ex: Camionnette AB-123-CD"
                  />
                </div>

                <div>
                  <label className={labelClass}>Matériel spécifique requis</label>
                  <textarea
                    value={equipmentNotes}
                    onChange={(e) => setEquipmentNotes(e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                    placeholder="Ex: Pelle mécanique, EPI spécifiques..."
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-benin-green rounded-lg hover:bg-benin-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Création...
                </>
              ) : (
                'Créer l\'intervention'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
