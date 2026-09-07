import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useReports } from '../hooks/useReports';
import { reportsApi } from '../services/reports.api';
import { apiClient, type ApiResponse } from '../../../libs/api-client';
import { MapPicker } from '../../../components/forms';
import {
  IssueCategory,
  PriorityLevel,
  RiskLevel,
  WaterFlowStatus,
  type CreateReportPayload,
  type ReportDetailsPayload,
} from '../services/reports.types';

interface StructureItem {
  id: string;
  name: string;
  type: string;
}

interface Props {
  onClose: () => void;
}

interface TerritoryItem {
  id: string;
  name: string;
  territoryTypeCode?: string;
  parentTerritoryId?: string | null;
}

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  [IssueCategory.DRAINAGE]: 'Assainissement / Drainage',
  [IssueCategory.ROAD]: 'Infrastructures Routières',
  [IssueCategory.WASTE]: 'Gestion des Déchets',
  [IssueCategory.BIODIVERSITY]: 'Biodiversité / Espaces Verts',
  [IssueCategory.ENVIRONMENT]: 'Environnement (Air / Eau)',
  [IssueCategory.OTHER]: 'Autre',
};

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: 'Faible',
  [PriorityLevel.MEDIUM]: 'Modérée',
  [PriorityLevel.HIGH]: 'Haute',
  [PriorityLevel.URGENT]: 'Urgente',
  [PriorityLevel.CRITICAL]: 'Critique',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: 'Faible',
  [RiskLevel.MEDIUM]: 'Modéré',
  [RiskLevel.HIGH]: 'Élevé',
  [RiskLevel.CRITICAL]: 'Critique',
};

const FLOW_STATUS_LABELS: Record<WaterFlowStatus, string> = {
  [WaterFlowStatus.FREE]: 'Libre',
  [WaterFlowStatus.RESTRICTED]: 'Restreint',
  [WaterFlowStatus.BLOCKED]: 'Bouché',
};

const numInputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green";

/** Récupère les territoires depuis l'API par ID de type parent */
async function fetchByParent(parentId: string): Promise<TerritoryItem[]> {
  try {
    const res = await apiClient.get<ApiResponse<any>>('/territories', {
      params: { parentTerritoryId: parentId, limit: 500 },
    });
    const items = Array.isArray(res.data) ? res.data : [];
    console.log('fetchByParent', parentId, 'returned', items.length, 'items');
    return items.sort((a: TerritoryItem, b: TerritoryItem) =>
      (a.name || '').localeCompare(b.name || '')
    );
  } catch (err) {
    console.error('fetchByParent Error:', err);
    return [];
  }
}

/** Récupère les territoires de type DEPARTMENT (hiérarchie niveau 1) */
async function fetchDepartments(): Promise<TerritoryItem[]> {
  try {
    const res = await apiClient.get<ApiResponse<any>>('/territories', {
      params: { limit: 100, territoryTypeCode: 'DEPARTMENT' },
    });
    const departments = Array.isArray(res.data) ? res.data : [];
    console.log('fetchDepartments fetched exact departments:', departments.length);
    
    return departments.sort((a: TerritoryItem, b: TerritoryItem) =>
      (a.name || '').localeCompare(b.name || '')
    );
  } catch (err) {
    console.error('fetchDepartments Error:', err);
    return [];
  }
}

const selectClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";

export const CreateReportModal: React.FC<Props> = ({ onClose }) => {
  const { addReport } = useReports();
  const [error, setError] = useState<string | null>(null);

  // Listes de territoires par niveau
  const [departements, setDepartements] = useState<TerritoryItem[]>([]);
  const [communes, setCommunes] = useState<TerritoryItem[]>([]);
  const [arrondissements, setArrondissements] = useState<TerritoryItem[]>([]);
  const [quartiers, setQuartiers] = useState<TerritoryItem[]>([]);

  // Chargements par niveau
  const [loadingDepts, setLoadingDepts] = useState(true);
  const [loadingCommunes, setLoadingCommunes] = useState(false);
  const [loadingArr, setLoadingArr] = useState(false);
  const [loadingQuartiers, setLoadingQuartiers] = useState(false);

  // Sélections
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedArr, setSelectedArr] = useState('');
  const [selectedQuartier, setSelectedQuartier] = useState('');

  // Formulaire
  const [form, setForm] = useState<Omit<CreateReportPayload, 'territoryId'>>({
    title: '',
    description: '',
    issueCategory: IssueCategory.OTHER,
    priority: PriorityLevel.MEDIUM,
    riskLevel: RiskLevel.LOW,
    latitude: null,
    longitude: null,
    infrastructureId: null,
    details: {},
  });

  // Sélection hiérarchique : on prend le niveau le plus fin disponible
  const resolvedTerritoryId = selectedQuartier || selectedArr || selectedCommune || selectedDept;

  // Infrastructure liée
  const [structures, setStructures] = useState<StructureItem[]>([]);
  const [loadingStructures, setLoadingStructures] = useState(false);

  // Chargement des infrastructures quand le territoire change
  useEffect(() => {
    if (!resolvedTerritoryId) { setStructures([]); return; }
    setLoadingStructures(true);
    apiClient.get<ApiResponse<any>>('/infrastructures', {
      params: { territoryId: resolvedTerritoryId, limit: 200 },
    }).then(res => {
      const items = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
      setStructures(items);
    }).catch(() => setStructures([]))
      .finally(() => setLoadingStructures(false));
  }, [resolvedTerritoryId]);


  // Médias (pièces jointes)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chargement initial des départements
  useEffect(() => {
    setLoadingDepts(true);
    fetchDepartments()
      .then(setDepartements)
      .finally(() => setLoadingDepts(false));
  }, []);

  // Chargement des communes quand un département est sélectionné
  useEffect(() => {
    if (!selectedDept) { setCommunes([]); return; }
    setLoadingCommunes(true);
    setSelectedCommune('');
    setArrondissements([]);
    setSelectedArr('');
    setQuartiers([]);
    setSelectedQuartier('');
    fetchByParent(selectedDept)
      .then(setCommunes)
      .finally(() => setLoadingCommunes(false));
  }, [selectedDept]);

  // Chargement des arrondissements quand une commune est sélectionnée
  useEffect(() => {
    if (!selectedCommune) { setArrondissements([]); return; }
    setLoadingArr(true);
    setSelectedArr('');
    setQuartiers([]);
    setSelectedQuartier('');
    fetchByParent(selectedCommune)
      .then(setArrondissements)
      .finally(() => setLoadingArr(false));
  }, [selectedCommune]);

  // Chargement des quartiers quand un arrondissement est sélectionné
  useEffect(() => {
    if (!selectedArr) { setQuartiers([]); return; }
    setLoadingQuartiers(true);
    setSelectedQuartier('');
    fetchByParent(selectedArr)
      .then(setQuartiers)
      .finally(() => setLoadingQuartiers(false));
  }, [selectedArr]);

  // Le territoire le plus précis sélectionné
  const resolvedName =
    quartiers.find(t => t.id === selectedQuartier)?.name ||
    arrondissements.find(t => t.id === selectedArr)?.name ||
    communes.find(t => t.id === selectedCommune)?.name ||
    departements.find(t => t.id === selectedDept)?.name;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value || null }));
  };

  /** Met à jour un champ du détail 1:1 selon la catégorie */
  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      details: {
        ...(prev.details ?? {}),
        [name]: type === 'number' ? (value ? parseFloat(value) : undefined) : value || undefined,
      },
    }));
  };

  /** Construit le payload `details` en excluant les champs vides */
  const buildDetailsPayload = (): ReportDetailsPayload | null => {
    const d = form.details ?? {};
    const cleaned = Object.fromEntries(
      Object.entries(d).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ) as ReportDetailsPayload;
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  };

  // ── Médias : sélection et retrait ──────────────────────────────────────────
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
    e.target.value = ''; // permet de re-sélectionner le même fichier
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resolvedTerritoryId) {
      setError('Veuillez sélectionner au minimum un département.');
      return;
    }
    if (!form.title?.toString().trim()) {
      setError('Le titre du signalement est obligatoire.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await addReport({
        ...form,
        title: form.title!.toString().trim(),
        territoryId: resolvedTerritoryId,
        details: buildDetailsPayload(),
      });

      // Upload des médias sélectionnés (rattachés au report créé)
      if (selectedFiles.length > 0 && created?.id) {
        setUploadingMedia(true);
        try {
          for (const file of selectedFiles) {
            await reportsApi.uploadReportMedia(created.id, file);
          }
        } finally {
          setUploadingMedia(false);
        }
      }

      toast.success('Signalement créé avec succès !');
      onClose();
    } catch (err: any) {
      const errorMsg = err?.message || 'Une erreur est survenue lors de la création.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[90vh]">
        {/* Drag indicator (mobile uniquement) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* En-tête */}
        <div className="px-4 sm:px-8 pt-4 sm:pt-8 pb-4 sm:pb-6 border-b border-gray-200 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-gray-900">Nouveau Signalement</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Déclarez un incident ou une anomalie sur le territoire.</p>
          </div>
          <button onClick={onClose} className="shrink-0 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Fermer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="px-4 sm:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6">

            {/* Localisation en cascade */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Localisation territoriale <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Département */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block" htmlFor="dept">
                    Département {loadingDepts && <span className="text-gray-400">(chargement...)</span>}
                  </label>
                  <select
                    id="dept"
                    value={selectedDept}
                    disabled={loadingDepts}
                    onChange={e => setSelectedDept(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">— Sélectionner ({departements.length}) —</option>
                    {departements.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                {/* Commune */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block" htmlFor="commune">
                    Commune {loadingCommunes && <span className="text-gray-400">(chargement...)</span>}
                  </label>
                  <select
                    id="commune"
                    value={selectedCommune}
                    disabled={!selectedDept || loadingCommunes}
                    onChange={e => setSelectedCommune(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">— Sélectionner ({communes.length}) —</option>
                    {communes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                {/* Arrondissement */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block" htmlFor="arrondissement">
                    Arrondissement {loadingArr && <span className="text-gray-400">(chargement...)</span>}
                  </label>
                  <select
                    id="arrondissement"
                    value={selectedArr}
                    disabled={!selectedCommune || loadingArr}
                    onChange={e => setSelectedArr(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">— Sélectionner ({arrondissements.length}) —</option>
                    {arrondissements.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                {/* Quartier */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block" htmlFor="quartier">
                    Quartier / Village {loadingQuartiers && <span className="text-gray-400">(chargement...)</span>}
                  </label>
                  <select
                    id="quartier"
                    value={selectedQuartier}
                    disabled={!selectedArr || loadingQuartiers}
                    onChange={e => setSelectedQuartier(e.target.value)}
                    className={selectClass}
                  >
                    <option value="">— Sélectionner ({quartiers.length}) —</option>
                    {quartiers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

              </div>

              {resolvedTerritoryId && resolvedName && (
                <p className="mt-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  ✓ Rattaché à : <strong>{resolvedName}</strong>
                </p>
              )}
            </div>

            {/* Infrastructure liée */}
            {resolvedTerritoryId && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="report-infrastructure">
                  Infrastructure concernée{' '}
                  <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <select
                  id="report-infrastructure"
                  disabled={loadingStructures}
                  value={form.infrastructureId ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, infrastructureId: e.target.value || null }))}
                  className={selectClass}
                >
                  <option value="">
                    {loadingStructures ? 'Chargement...' : `— Aucune (${structures.length} disponibles) —`}
                  </option>
                  {structures.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                  ))}
                </select>
                {form.infrastructureId && (
                  <p className="mt-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    🏗 Infrastructure liée : <strong>{structures.find(s => s.id === form.infrastructureId)?.name}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Titre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="report-title">
                Titre du signalement <span className="text-red-500">*</span>
              </label>
              <input
                id="report-title"
                name="title"
                type="text"
                value={(form.title as string) || ''}
                onChange={handleChange}
                placeholder="Ex : Nid-de-poule sur la route nationale..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="report-description">
                Description
              </label>
              <textarea
                id="report-description"
                name="description"
                value={(form.description as string) ?? ''}
                onChange={handleChange}
                rows={3}
                placeholder="Décrivez l'incident avec précision..."
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green resize-none"
              />
            </div>

            {/* Catégorie + Priorité + Risque */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="report-category">Catégorie</label>
                <select id="report-category" name="issueCategory" value={form.issueCategory as string} onChange={handleChange} className={selectClass}>
                  {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="report-priority">Priorité</label>
                <select id="report-priority" name="priority" value={form.priority as string} onChange={handleChange} className={selectClass}>
                  {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5" htmlFor="report-risk">Niveau de risque</label>
                <select id="report-risk" name="riskLevel" value={form.riskLevel as string} onChange={handleChange} className={selectClass}>
                  {Object.entries(RISK_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Détails spécifiques à la catégorie */}
            {form.issueCategory !== IssueCategory.OTHER && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Détails spécifiques <span className="text-gray-400 font-normal">(optionnel)</span>
                </p>

                {form.issueCategory === IssueCategory.DRAINAGE && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block" htmlFor="detail-blockage">
                        Taux de colmatage (%) <span className="text-gray-400">(0-100)</span>
                      </label>
                      <input
                        id="detail-blockage"
                        name="blockageLevelPct"
                        type="number" min="0" max="100" step="any"
                        value={form.details?.blockageLevelPct ?? ''}
                        onChange={handleDetailChange}
                        placeholder="Ex : 75"
                        className={numInputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block" htmlFor="detail-water-level">
                        Niveau d'eau (cm)
                      </label>
                      <input
                        id="detail-water-level"
                        name="waterLevelCm"
                        type="number" min="0" step="any"
                        value={form.details?.waterLevelCm ?? ''}
                        onChange={handleDetailChange}
                        placeholder="Ex : 30"
                        className={numInputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block" htmlFor="detail-flow-status">
                        État d'écoulement
                      </label>
                      <select
                        id="detail-flow-status"
                        name="flowStatus"
                        value={form.details?.flowStatus ?? ''}
                        onChange={handleDetailChange}
                        className={selectClass}
                      >
                        <option value="">— Sélectionner —</option>
                        {Object.entries(FLOW_STATUS_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {form.issueCategory === IssueCategory.ROAD && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block" htmlFor="detail-damage-surface">
                        Surface endommagée (m²)
                      </label>
                      <input
                        id="detail-damage-surface"
                        name="damageSurfaceM2"
                        type="number" min="0" step="any"
                        value={form.details?.damageSurfaceM2 ?? ''}
                        onChange={handleDetailChange}
                        placeholder="Ex : 45"
                        className={numInputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block" htmlFor="detail-pothole-depth">
                        Profondeur du nid-de-poule (cm)
                      </label>
                      <input
                        id="detail-pothole-depth"
                        name="potholeDepthCm"
                        type="number" min="0" step="any"
                        value={form.details?.potholeDepthCm ?? ''}
                        onChange={handleDetailChange}
                        placeholder="Ex : 12"
                        className={numInputClass}
                      />
                    </div>
                  </div>
                )}

                {form.issueCategory === IssueCategory.WASTE && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block" htmlFor="detail-estimated-volume">
                        Volume estimé (m³)
                      </label>
                      <input
                        id="detail-estimated-volume"
                        name="estimatedVolumeM3"
                        type="number" min="0" step="any"
                        value={form.details?.estimatedVolumeM3 ?? ''}
                        onChange={handleDetailChange}
                        placeholder="Ex : 2.5"
                        className={numInputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block" htmlFor="detail-waste-type">
                        Type de déchets
                      </label>
                      <input
                        id="detail-waste-type"
                        name="wasteType"
                        type="text"
                        value={form.details?.wasteType ?? ''}
                        onChange={handleDetailChange}
                        placeholder="Ex : plastiques, gravats..."
                        className={numInputClass}
                      />
                    </div>
                  </div>
                )}

                {form.issueCategory === IssueCategory.BIODIVERSITY && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block" htmlFor="detail-species">
                        Espèce
                      </label>
                      <input
                        id="detail-species"
                        name="speciesName"
                        type="text"
                        value={form.details?.speciesName ?? ''}
                        onChange={handleDetailChange}
                        placeholder="Ex : Khaya senegalensis"
                        className={numInputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block" htmlFor="detail-observation-type">
                        Type d'observation
                      </label>
                      <input
                        id="detail-observation-type"
                        name="observationType"
                        type="text"
                        value={form.details?.observationType ?? ''}
                        onChange={handleDetailChange}
                        placeholder="Ex : coupe illicite"
                        className={numInputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block" htmlFor="detail-count">
                        Nombre
                      </label>
                      <input
                        id="detail-count"
                        name="count"
                        type="number" min="0" step="1"
                        value={form.details?.count ?? ''}
                        onChange={handleDetailChange}
                        placeholder="Ex : 5"
                        className={numInputClass}
                      />
                    </div>
                  </div>
                )}

                {form.issueCategory === IssueCategory.ENVIRONMENT && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block" htmlFor="detail-sensor-id">
                        Capteur (ID)
                      </label>
                      <input
                        id="detail-sensor-id"
                        name="sensorId"
                        type="text"
                        value={form.details?.sensorId ?? ''}
                        onChange={handleDetailChange}
                        placeholder="Ex : 3f8c..."
                        className={numInputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block" htmlFor="detail-measured-value">
                        Valeur mesurée
                      </label>
                      <input
                        id="detail-measured-value"
                        name="measuredValue"
                        type="number" step="any"
                        value={form.details?.measuredValue ?? ''}
                        onChange={handleDetailChange}
                        placeholder="Ex : 25.4"
                        className={numInputClass}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block" htmlFor="detail-unit">
                        Unité
                      </label>
                      <input
                        id="detail-unit"
                        name="unit"
                        type="text"
                        value={form.details?.unit ?? ''}
                        onChange={handleDetailChange}
                        placeholder="Ex : ppm, °C, mg/L"
                        className={numInputClass}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* GPS */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Localisation GPS <span className="text-gray-400 font-normal">(optionnel)</span>
              </p>

              {/* Carte interactive */}
              <MapPicker
                latitude={form.latitude ?? null}
                longitude={form.longitude ?? null}
                onChange={(lat, lng) => setForm(prev => ({ ...prev, latitude: lat, longitude: lng }))}
              />

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block" htmlFor="report-lat">Latitude</label>
                  <input
                    id="report-lat"
                    type="number" step="any"
                    value={form.latitude ?? ''}
                    onChange={e => setForm(p => ({ ...p, latitude: e.target.value ? parseFloat(e.target.value) : null }))}
                    placeholder="6.3654"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block" htmlFor="report-lon">Longitude</label>
                  <input
                    id="report-lon"
                    type="number" step="any"
                    value={form.longitude ?? ''}
                    onChange={e => setForm(p => ({ ...p, longitude: e.target.value ? parseFloat(e.target.value) : null }))}
                    placeholder="2.4183"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green"
                  />
                </div>
              </div>
            </div>

            {/* Pièces jointes */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Pièces jointes <span className="text-gray-400 font-normal">(photos, documents — optionnel)</span>
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingMedia}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 hover:border-benin-green transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                {uploadingMedia ? 'Upload en cours...' : 'Ajouter des photos / documents'}
              </button>

              {selectedFiles.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50/50">
                      <div className="flex items-center gap-3 min-w-0">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-10 h-10 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-benin-green-light flex items-center justify-center text-benin-green font-bold shrink-0">
                            {file.name.split('.').pop()?.toUpperCase()?.slice(0, 4)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} Ko</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-600 transition-colors shrink-0"
                        title="Retirer"
                        aria-label={`Retirer ${file.name}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
            )}
          </div>

          {/* Pied */}
          <div className="px-4 sm:px-8 py-4 sm:py-5 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 shrink-0">
            <button type="button" onClick={onClose} disabled={isSubmitting || uploadingMedia}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-60">
              Annuler
            </button>
            <button type="submit" disabled={isSubmitting || uploadingMedia}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-benin-green hover:bg-benin-green-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {isSubmitting || uploadingMedia ? 'Enregistrement...' : 'Créer le signalement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
