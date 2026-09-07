import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useMissions } from '../hooks/useMissions';
import { apiClient, type ApiResponse } from '../../../libs/api-client';
import {
  MissionType,
  PriorityLevel,
  type CreateMissionPayload,
} from '../services/missions.types';

interface Props {
  onClose: () => void;
  initialReportId?: string;
  initialTerritoryId?: string;
  initialTerritoryName?: string;
  initialTitle?: string;
  initialDescription?: string;
}

interface TerritoryItem {
  id: string;
  name: string;
  territoryTypeCode?: string;
  parentTerritoryId?: string | null;
}

const TYPE_LABELS: Record<MissionType, string> = {
  [MissionType.REPAIR]: 'Réparation',
  [MissionType.MAINTENANCE]: 'Maintenance',
  [MissionType.INSPECTION]: 'Inspection',
  [MissionType.CLEANING]: 'Nettoyage',
  [MissionType.CONSTRUCTION]: 'Construction',
  [MissionType.OTHER]: 'Autre',
};

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: 'Faible',
  [PriorityLevel.MEDIUM]: 'Modérée',
  [PriorityLevel.HIGH]: 'Haute',
  [PriorityLevel.URGENT]: 'Urgente',
  [PriorityLevel.CRITICAL]: 'Critique',
};

const numInputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

async function fetchByParent(parentId: string): Promise<TerritoryItem[]> {
  try {
    const res = await apiClient.get<ApiResponse<any>>('/territories', {
      params: { parentTerritoryId: parentId, limit: 500 },
    });
    const items = Array.isArray(res.data) ? res.data : [];
    return items.sort((a: TerritoryItem, b: TerritoryItem) =>
      (a.name || '').localeCompare(b.name || '')
    );
  } catch (err) {
    return [];
  }
}

async function fetchDepartments(): Promise<TerritoryItem[]> {
  try {
    const res = await apiClient.get<ApiResponse<any>>('/territories', {
      params: { limit: 100, territoryTypeCode: 'DEPARTMENT' },
    });
    const items = Array.isArray(res.data) ? res.data : [];
    return items.sort((a: TerritoryItem, b: TerritoryItem) =>
      (a.name || '').localeCompare(b.name || '')
    );
  } catch (err) {
    return [];
  }
}

export const CreateMissionModal: React.FC<Props> = ({ 
  onClose,
  initialReportId,
  initialTerritoryId,
  initialTerritoryName,
  initialTitle = '',
  initialDescription = '',
}) => {
  const { addMission } = useMissions();

  // Territoires (cascade)
  const [departments, setDepartments] = useState<TerritoryItem[]>([]);
  const [communes, setCommunes] = useState<TerritoryItem[]>([]);
  const [arrondissements, setArrondissements] = useState<TerritoryItem[]>([]);
  
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedCommuneId, setSelectedCommuneId] = useState('');
  const [selectedArronId, setSelectedArronId] = useState('');

  // Formulaire Mission
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [missionType, setMissionType] = useState<MissionType>(MissionType.MAINTENANCE);
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>(PriorityLevel.MEDIUM);
  const [estimatedHours, setEstimatedHours] = useState<number | ''>('');
  const [scheduledAt, setScheduledAt] = useState('');

  // Erreur globale
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Infrastructure liée
  const [structures, setStructures] = useState<{ id: string; name: string; type: string }[]>([]);
  const [loadingStructures, setLoadingStructures] = useState(false);
  const [infrastructureId, setInfrastructureId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDepartments().then((data) => {
      if (!cancelled) setDepartments(data);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedDeptId) {
      setCommunes([]);
      setSelectedCommuneId('');
      return;
    }
    let cancelled = false;
    fetchByParent(selectedDeptId).then((data) => {
      if (!cancelled) setCommunes(data);
    });
    return () => { cancelled = true; };
  }, [selectedDeptId]);

  useEffect(() => {
    if (!selectedCommuneId) {
      setArrondissements([]);
      setSelectedArronId('');
      return;
    }
    let cancelled = false;
    fetchByParent(selectedCommuneId).then((data) => {
      if (!cancelled) setArrondissements(data);
    });
    return () => { cancelled = true; };
  }, [selectedCommuneId]);

  const finalTerritoryId = initialTerritoryId || selectedArronId || selectedCommuneId || selectedDeptId;

  // Chargement des infrastructures quand le territoire est connu
  useEffect(() => {
    if (!finalTerritoryId) { setStructures([]); return; }
    setLoadingStructures(true);
    apiClient.get<ApiResponse<any>>('/infrastructures', {
      params: { territoryId: finalTerritoryId, limit: 200 },
    }).then(res => {
      const items = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setStructures(items);
    }).catch(() => setStructures([]))
      .finally(() => setLoadingStructures(false));
  }, [finalTerritoryId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!finalTerritoryId) {
      setSubmitError('Veuillez sélectionner au moins un territoire (ex: Commune).');
      return;
    }
    if (!title.trim()) {
      setSubmitError('Le titre est requis.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateMissionPayload = {
        territoryId: finalTerritoryId,
        reportId: initialReportId || null,
        infrastructureId: infrastructureId || null,
        title: title.trim(),
        description: description.trim() || null,
        missionType,
        priorityLevel,
        estimatedHours: estimatedHours === '' ? null : Number(estimatedHours),
        scheduledAt: scheduledAt || null,
      };

      await addMission(payload);
      toast.success('Mission créée avec succès !');
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Erreur lors de la création de la mission.';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Nouvelle Mission</h2>
            <p className="text-sm text-gray-500 mt-1">Créez une mission pour un territoire (DST).</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {submitError && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
              {submitError}
            </div>
          )}

          <form id="create-mission-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Informations de base */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Titre de la mission *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Réparation nids de poule - Commune X"
                  className={numInputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Description détaillée</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Décrivez l'intervention (peut couvrir plusieurs signalements)..."
                  className={numInputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Type d'intervention</label>
                  <select
                    value={missionType}
                    onChange={(e) => setMissionType(e.target.value as MissionType)}
                    className={numInputClass}
                  >
                    {Object.entries(TYPE_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Priorité</label>
                  <select
                    value={priorityLevel}
                    onChange={(e) => setPriorityLevel(e.target.value as PriorityLevel)}
                    className={numInputClass}
                  >
                    {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Localisation (Cascade Territoire) */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Territoire ciblé *</h3>
              
              {initialTerritoryId && initialTerritoryName ? (
                <div className="p-4 bg-benin-green-light border border-benin-green/20 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 text-benin-green mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{initialTerritoryName}</p>
                    <p className="text-xs text-benin-green-dark mt-1">Territoire hérité du signalement. Il n'est pas nécessaire de le renseigner manuellement.</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-2">Sélectionnez le territoire (ex: Commune) sur lequel la mission aura lieu.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Département</label>
                      <select
                        value={selectedDeptId}
                        onChange={(e) => setSelectedDeptId(e.target.value)}
                        className={numInputClass}
                      >
                        <option value="">Sélectionner...</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Commune</label>
                      <select
                        value={selectedCommuneId}
                        onChange={(e) => setSelectedCommuneId(e.target.value)}
                        disabled={!selectedDeptId}
                        className={`${numInputClass} disabled:opacity-50 disabled:bg-gray-50`}
                      >
                        <option value="">Sélectionner...</option>
                        {communes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Arrondissement (Optionnel)</label>
                      <select
                        value={selectedArronId}
                        onChange={(e) => setSelectedArronId(e.target.value)}
                        disabled={!selectedCommuneId}
                        className={`${numInputClass} disabled:opacity-50 disabled:bg-gray-50`}
                      >
                        <option value="">Sélectionner...</option>
                        {arrondissements.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Infrastructure concernée */}
            {finalTerritoryId && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">Infrastructure concernée <span className="font-normal text-gray-400">(optionnel)</span></h3>
                <select
                  id="mission-infrastructure"
                  disabled={loadingStructures}
                  value={infrastructureId ?? ''}
                  onChange={e => setInfrastructureId(e.target.value || null)}
                  className={`${numInputClass} disabled:opacity-50 disabled:bg-gray-50`}
                >
                  <option value="">
                    {loadingStructures ? 'Chargement...' : `— Aucune (${structures.length} disponibles) —`}
                  </option>
                  {structures.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                  ))}
                </select>
                {infrastructureId && (
                  <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    🏗 Infrastructure liée : <strong>{structures.find(s => s.id === infrastructureId)?.name}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Planification */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Planification (Optionnel)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date prévue</label>
                  <input
                    type="date"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className={numInputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Durée estimée (Heures)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value ? Number(e.target.value) : '')}
                    className={numInputClass}
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="create-mission-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-benin-green hover:bg-benin-green-dark border border-transparent shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting && (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Créer la mission
          </button>
        </div>

      </div>
    </div>
  );
};
