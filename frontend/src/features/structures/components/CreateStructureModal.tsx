import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStructures } from '../hooks/useStructures';
import { useTerritory } from '../../territory/hooks/useTerritory';
import {
  InfrastructureType,
  InfrastructureCondition,
  type CreateStructurePayload,
} from '../services/structures.types';
import { TYPE_LABELS, CONDITION_LABELS } from './StructuresPage';

interface Props {
  onClose: () => void;
}

const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

// Icône Leaflet par défaut corrigée pour les bundlers (fichiers dist introuvables)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Composant interne : écoute les clics sur la carte et remonte lat/lng
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

export const CreateStructureModal: React.FC<Props> = ({ onClose }) => {
  const { create } = useStructures();
  const { territories, loadForForm } = useTerritory();

  // Hiérarchie territoriale
  const [departmentId, setDepartmentId] = useState('');
  const [communeId, setCommuneId] = useState('');

  // Coordonnées GPS (carte cliquable)
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [type, setType] = useState<InfrastructureType>(InfrastructureType.OTHER);
  const [condition, setCondition] = useState<InfrastructureCondition>(InfrastructureCondition.GOOD);
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadForForm();
  }, [loadForForm]);

  // Départements et communes déduits de la hiérarchie seedée
  const departments = territories.filter((t) => t.territoryTypeCode === 'DEPARTMENT');
  const communes = territories.filter((t) => t.territoryTypeCode === 'COMMUNE');
  const filteredCommunes = communes.filter((c) => c.parentTerritoryId === departmentId);

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartmentId(e.target.value);
    setCommuneId(''); // réinitialise la commune quand le département change
  };

  const handlePickLocation = (lat: number, lng: number) => {
    setLatitude(Number(lat.toFixed(6)));
    setLongitude(Number(lng.toFixed(6)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!communeId || !name) {
      setError("Le département, la commune et le nom sont requis.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const payload: CreateStructurePayload = {
        territoryId: communeId,
        name,
        referenceCode: referenceCode || null,
        type,
        condition,
        description: description || null,
        material: material || null,
        latitude: latitude,
        longitude: longitude,
      };
      await create(payload).unwrap();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nouvelle structure</h2>
            <p className="text-sm text-gray-500">Enregistrer un équipement physique urbain</p>
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

            {/* Identification */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-3">Identification</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Nom de la structure *</label>
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
              <p className="text-xs font-medium text-gray-500 mb-3">Territoire</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Département *</label>
                    <select
                      value={departmentId}
                      onChange={handleDepartmentChange}
                      className={inputClass}
                      required
                    >
                      <option value="">Sélectionner un département...</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Commune *</label>
                    <select
                      value={communeId}
                      onChange={(e) => setCommuneId(e.target.value)}
                      className={inputClass}
                      required
                      disabled={!departmentId}
                    >
                      <option value="">
                        {departmentId ? 'Sélectionner une commune...' : 'Choisir d\'abord un département'}
                      </option>
                      {filteredCommunes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Coordonnées GPS — carte cliquable */}
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
              {isSubmitting ? 'Création...' : "Créer la structure"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
