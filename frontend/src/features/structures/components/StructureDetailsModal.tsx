import React, { useState, useEffect, useRef } from 'react';
import { useStructures } from '../hooks/useStructures';
import { useTerritory } from '../../territory/hooks/useTerritory';
import type { Structure, InfrastructureStatus, StructureMedia } from '../services/structures.types';
import { structuresApi } from '../services/structures.api';
import {
  TYPE_LABELS,
  CONDITION_LABELS,
  CONDITION_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
} from './StructuresPage';

interface Props {
  structure: Structure;
  onClose: () => void;
}

export const StructureDetailsModal: React.FC<Props> = ({ structure, onClose }) => {
  const { update, remove } = useStructures();
  const { territories } = useTerritory();
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Photos ──────────────────────────────────────────────────────────────────
  const [photos, setPhotos] = useState<StructureMedia[]>([]);
  const [photosLoading, setPhotosLoading] = useState(true);
  const [photosError, setPhotosError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const territoryName = structure.territoryName
    ?? structure.municipalityName
    ?? territories.find((t) => t.id === structure.municipalityId)?.name
    ?? '—';

  // Charger les photos au montage
  useEffect(() => {
    let cancelled = false;
    setPhotosLoading(true);
    structuresApi.getPhotos(structure.id)
      .then((data) => { if (!cancelled) setPhotos(data); })
      .catch(() => { if (!cancelled) setPhotosError('Impossible de charger les photos.'); })
      .finally(() => { if (!cancelled) setPhotosLoading(false); });
    return () => { cancelled = true; };
  }, [structure.id]);

  const handleStatusChange = async (newStatus: InfrastructureStatus) => {
    try {
      await update(structure.id, { status: newStatus }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement cette structure ?')) return;
    setIsDeleting(true);
    try {
      await remove(structure.id).unwrap();
      onClose();
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  // ── Ajout de photos depuis la fiche détail ──────────────────────────────────
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files).filter((f) => f.type.startsWith('image/'));
    e.target.value = '';

    setUploading(true);
    setPhotosError(null);

    for (const file of files) {
      try {
        const uploaded = await structuresApi.uploadPhoto(structure.id, file);
        setPhotos((prev) => [uploaded, ...prev]);
      } catch (err: any) {
        setPhotosError(err?.message ?? 'Erreur lors de l\'upload.');
      }
    }

    setUploading(false);
  };

  // ── Suppression d'une photo ──────────────────────────────────────────────────
  const handleDeletePhoto = async (photo: StructureMedia) => {
    if (!window.confirm('Supprimer cette photo définitivement ?')) return;
    setDeletingPhotoId(photo.id);
    try {
      await structuresApi.deletePhoto(photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (err: any) {
      setPhotosError(err?.message ?? 'Impossible de supprimer la photo.');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  return (
    <>
      {/* ── Lightbox ── */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 rounded-full p-2 transition-colors"
            onClick={() => setLightboxSrc(null)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={lightboxSrc}
            alt="Photo plein écran"
            className="max-w-full max-h-full rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-full">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-bold text-gray-900">{structure.name}</h2>
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${STATUS_COLORS[structure.status]}`}>
                  {STATUS_LABELS[structure.status]}
                </span>
              </div>
              <p className="text-sm text-gray-500 font-mono">{structure.referenceCode || structure.id}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 p-6 space-y-8">

            {/* Informations principales */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Informations</h3>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-gray-500 mb-1">Type</span>
                  <span className="font-medium text-gray-900">{TYPE_LABELS[structure.type] || structure.type}</span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Condition</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${CONDITION_COLORS[structure.condition] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {CONDITION_LABELS[structure.condition] || structure.condition}
                  </span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Territoire</span>
                  <span className="font-medium text-gray-900">{territoryName}</span>
                </div>
                <div>
                  <span className="block text-gray-500 mb-1">Matériau</span>
                  <span className="font-medium text-gray-900">{structure.material || '—'}</span>
                </div>
              </div>
            </div>

            {/* Localisation */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Localisation</h3>
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm space-y-2">
                {structure.latitude !== null && structure.longitude !== null ? (
                  <p className="text-gray-700">
                    Coordonnées : <strong>{structure.latitude.toFixed(5)}</strong>, <strong>{structure.longitude.toFixed(5)}</strong>
                  </p>
                ) : (
                  <p className="text-gray-500 italic">Aucune coordonnée GPS renseignée.</p>
                )}
                {structure.installationDate && (
                  <p className="text-gray-500">
                    Installée le : <strong className="text-gray-800">{new Date(structure.installationDate).toLocaleDateString('fr-FR')}</strong>
                  </p>
                )}
                {structure.lastMaintainedAt && (
                  <p className="text-gray-500">
                    Dernière maintenance : <strong className="text-gray-800">{new Date(structure.lastMaintainedAt).toLocaleDateString('fr-FR')}</strong>
                  </p>
                )}
              </div>
            </div>

            {/* ── Photos ── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  Photos
                  {photos.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-gray-400">({photos.length})</span>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-benin-green bg-benin-green/10 border border-benin-green/20 rounded-lg hover:bg-benin-green/20 transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Upload…
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Ajouter une photo
                    </>
                  )}
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>

              {photosError && (
                <p className="text-xs text-red-600 mb-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {photosError}
                </p>
              )}

              {photosLoading ? (
                /* Skeleton loader */
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : photos.length === 0 ? (
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-benin-green/40 hover:bg-gray-50 transition-all"
                >
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-400">Aucune photo — cliquez pour en ajouter</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 cursor-pointer"
                      onClick={() => setLightboxSrc(photo.storagePath)}
                    >
                      <img
                        src={photo.storagePath}
                        alt={photo.fileName}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                      {/* Overlay hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />

                      {/* Bouton suppression */}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo); }}
                        disabled={deletingPhotoId === photo.id}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-700 disabled:opacity-50"
                        title="Supprimer cette photo"
                      >
                        {deletingPhotoId === photo.id ? (
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>

                      {/* Icône loupe */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <svg className="w-6 h-6 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                {structure.description || <span className="text-gray-400 italic">Aucune description fournie.</span>}
              </p>
            </div>

            {/* Métadonnées */}
            {structure.metadata && Object.keys(structure.metadata).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Métadonnées</h3>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">{JSON.stringify(structure.metadata, null, 2)}</pre>
                </div>
              </div>
            )}

            {/* Changement de statut */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Statut</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => handleStatusChange(val as InfrastructureStatus)}
                    disabled={structure.status === val}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-medium border transition-opacity disabled:opacity-50 ${STATUS_COLORS[val as InfrastructureStatus]} hover:opacity-75`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
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
    </>
  );
};