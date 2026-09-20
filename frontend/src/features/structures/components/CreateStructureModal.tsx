import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStructures } from '../hooks/useStructures';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserRoleCode } from '../../auth/services/auth.types';
import { apiClient, type ApiResponse } from '../../../libs/api-client';
import {
  InfrastructureType,
  InfrastructureCondition,
  type CreateStructurePayload,
} from '../services/structures.types';
import { TYPE_LABELS, CONDITION_LABELS } from './StructuresPage';
import { structuresApi } from '../services/structures.api';

interface Props {
  onClose: () => void;
}

interface TerritoryItem {
  id: string;
  name: string;
  territoryTypeCode?: string;
  parentTerritoryId?: string | null;
}

const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green";
const selectClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

// Icône Leaflet par défaut corrigée pour les bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface ClickHandlerProps {
  onPick: (lat: number, lng: number) => void;
}

const ClickHandler: React.FC<ClickHandlerProps> = ({ onPick }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

interface PhotoPreview {
  file: File;
  previewUrl: string;
}

/** Récupère les territoires depuis l'API par ID de type parent */
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
    console.error('fetchByParent Error:', err);
    return [];
  }
}

/** Récupère les territoires de type DEPARTMENT */
async function fetchDepartments(): Promise<TerritoryItem[]> {
  try {
    const res = await apiClient.get<ApiResponse<any>>('/territories', {
      params: { limit: 100, territoryTypeCode: 'DEPARTMENT' },
    });
    const departments = Array.isArray(res.data) ? res.data : [];
    return departments.sort((a: TerritoryItem, b: TerritoryItem) =>
      (a.name || '').localeCompare(b.name || '')
    );
  } catch (err) {
    console.error('fetchDepartments Error:', err);
    return [];
  }
}

export const CreateStructureModal: React.FC<Props> = ({ onClose }) => {
  const { create } = useStructures();
  const { user } = useAuth();

  const isTechnicien = user?.role?.code === UserRoleCode.technicien;
  const isPrefecture = user?.role?.code === UserRoleCode.prefecture;
  const isMairie = user?.role?.code === UserRoleCode.admin_mairie;

  const shouldLockDept = isTechnicien || isPrefecture || isMairie;
  const shouldLockCommune = isTechnicien || isMairie;

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

  // Initialisation pour les rôles territoriaux
  useEffect(() => {
    if (user) {
      if (shouldLockDept && user.regionId) {
        setSelectedDept(user.regionId);
      }
      if (shouldLockCommune && user.municipalityId) {
        setSelectedCommune(user.municipalityId);
      }
    }
  }, [shouldLockDept, shouldLockCommune, user]);

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
    if (!shouldLockCommune) {
      setSelectedCommune('');
      setArrondissements([]);
      setSelectedArr('');
      setQuartiers([]);
      setSelectedQuartier('');
    }
    fetchByParent(selectedDept)
      .then(setCommunes)
      .finally(() => setLoadingCommunes(false));
  }, [selectedDept, shouldLockCommune]);

  // Chargement des arrondissements
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

  // Chargement des quartiers
  useEffect(() => {
    if (!selectedArr) { setQuartiers([]); return; }
    setLoadingQuartiers(true);
    setSelectedQuartier('');
    fetchByParent(selectedArr)
      .then(setQuartiers)
      .finally(() => setLoadingQuartiers(false));
  }, [selectedArr]);

  // Coordonnées GPS
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [type, setType] = useState<InfrastructureType>(InfrastructureType.OTHER);
  const [condition, setCondition] = useState<InfrastructureCondition>(InfrastructureCondition.GOOD);
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');

  // Photos
  const [photoPreviews, setPhotoPreviews] = useState<PhotoPreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      photoPreviews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [photoPreviews]);

  const handlePickLocation = (lat: number, lng: number) => {
    setLatitude(Number(lat.toFixed(6)));
    setLongitude(Number(lng.toFixed(6)));
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const newPreviews: PhotoPreview[] = imageFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPhotoPreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const removePhoto = (index: number) => {
    setPhotoPreviews((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommune || !name) {
      setError("Le département, la commune et le nom sont requis.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload: CreateStructurePayload = {
        municipalityId: selectedCommune,
        districtId: selectedArr || undefined,
        neighborhoodId: selectedQuartier || undefined,
        name,
        referenceCode: referenceCode || null,
        type,
        condition,
        description: description || null,
        material: material || null,
        latitude: latitude,
        longitude: longitude,
      };
      const result = await create(payload).unwrap();

      // Upload des photos
      if (photoPreviews.length > 0) {
        const structureId = (result as any)?.id ?? (result as any)?.data?.id;
        if (structureId) {
          for (let i = 0; i < photoPreviews.length; i++) {
            setUploadProgress(`Upload photo ${i + 1}/${photoPreviews.length}…`);
            try {
              await structuresApi.uploadPhoto(structureId, photoPreviews[i].file);
            } catch (uploadErr) {
              console.warn(`Échec upload photo ${i + 1}:`, uploadErr);
            }
          }
        }
      }

      toast.success('Infrastructure créée avec succès !');
      onClose();
    } catch (err: any) {
      const msg = err?.message || "Une erreur est survenue lors de la création.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nouvelle infrastructure</h2>
            <p className="text-sm text-gray-500">Enregistrer un équipement physique urbain</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">

            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {/* Identification */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-3">Identification</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Nom de l'infrastructure *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Ex: Caniveau central de Djidja"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Code de référence</label>
                    <input
                      type="text"
                      value={referenceCode}
                      onChange={(e) => setReferenceCode(e.target.value)}
                      className={inputClass}
                      placeholder="Ex: DRN-COT-0045"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Type *</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as InfrastructureType)}
                      className={inputClass}
                    >
                      {Object.entries(TYPE_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Localisation territoriale hiérarchisée */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Localisation territoriale <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Département */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Département <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={selectClass}
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    disabled={loadingDepts || shouldLockDept}
                    required
                  >
                    <option value="">— Sélectionner ({departements.length}) —</option>
                    {departements.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                {/* Commune */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Commune <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={selectClass}
                    value={selectedCommune}
                    onChange={(e) => setSelectedCommune(e.target.value)}
                    disabled={!selectedDept || loadingCommunes || shouldLockCommune}
                    required
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
            </div>

            {/* Coordonnées GPS */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-3">Localisation GPS (cliquez sur la carte)</p>
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden border border-gray-200 h-64 z-0">
                  <MapContainer
                    center={[9.307, 2.315]}
                    zoom={6}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ClickHandler onPick={handlePickLocation} />
                    {latitude !== null && longitude !== null && (
                      <Marker position={[latitude, longitude]} />
                    )}
                  </MapContainer>
                </div>

                <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
                  <p className="text-sm text-gray-700">
                    {latitude !== null && longitude !== null ? (
                      <>
                        <strong className="text-gray-900">Latitude :</strong> {latitude}
                        {'  '}
                        <strong className="text-gray-900">Longitude :</strong> {longitude}
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Cliquez sur la carte pour définir la position</span>
                    )}
                  </p>
                  {latitude !== null && longitude !== null && (
                    <button
                      type="button"
                      onClick={() => { setLatitude(null); setLongitude(null); }}
                      className="text-xs font-medium text-red-600 hover:text-red-700 bg-white border border-red-200 rounded-md px-2.5 py-1"
                    >
                      Vider
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Condition */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-3">État</p>
              <div>
                <label className={labelClass}>Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as InfrastructureCondition)}
                  className={inputClass}
                >
                  {Object.entries(CONDITION_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-3">Description (Optionnel)</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Matériau</label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className={inputClass}
                    placeholder="Ex: béton, bitume, PVC..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className={`${inputClass} resize-none`}
                    placeholder="Description détaillée..."
                  />
                </div>
              </div>
            </div>

            {/* Photos */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-3">Photos (Optionnel)</p>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative flex flex-col items-center justify-center gap-2
                  border-2 border-dashed rounded-xl p-6 cursor-pointer
                  transition-all duration-200 select-none
                  ${isDragging
                    ? 'border-benin-green bg-benin-green/5 scale-[1.01]'
                    : 'border-gray-300 bg-gray-50 hover:border-benin-green/50 hover:bg-gray-100'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-benin-green/10' : 'bg-gray-200'}`}>
                  <svg className={`w-5 h-5 transition-colors ${isDragging ? 'text-benin-green' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {isDragging ? 'Déposez les photos ici' : 'Glissez des photos ou cliquez pour sélectionner'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP — plusieurs fichiers acceptés</p>
                </div>
              </div>

              {photoPreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {photoPreviews.map((preview, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                      <img
                        src={preview.previewUrl}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        title="Retirer cette photo"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-[9px] truncate">{preview.file.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {photoPreviews.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  {photoPreviews.length} photo{photoPreviews.length > 1 ? 's' : ''} sélectionnée{photoPreviews.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

          </div>

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
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  {uploadProgress ?? 'Création…'}
                </>
              ) : (
                'Créer l\'infrastructure'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
