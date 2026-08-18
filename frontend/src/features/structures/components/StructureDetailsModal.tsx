import React from 'react';
import { useState } from 'react';
import { useStructures } from '../hooks/useStructures';
import { useTerritory } from '../../territory/hooks/useTerritory';
import type { Structure, InfrastructureStatus } from '../services/structures.types';
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

  const territoryName = territories.find((t) => t.id === structure.territoryId)?.name
    ?? structure.territoryName
    ?? '—';

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

  return (
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
  );
};