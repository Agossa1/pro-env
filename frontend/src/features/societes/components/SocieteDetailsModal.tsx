import React, { useEffect, useState } from 'react';
import { useSocietes } from '../hooks/useSocietes';
import { useTerritory } from '../../territory/hooks/useTerritory';
import { apiClient, type ApiResponse } from '../../../libs/api-client';
import type { AppSociete, SocieteTerritory } from '../services/societes.types';
import { TYPE_LABELS, TYPE_COLORS } from './SocietesPage';

interface Props {
  societe: AppSociete;
  onClose: () => void;
}

interface TerritoryOption {
  id: string;
  name: string;
}

export const SocieteDetailsModal: React.FC<Props> = ({ societe, onClose }) => {
  const { update, remove } = useSocietes();
  const { territories } = useTerritory();
  const [territoryOptions, setTerritoryOptions] = useState<TerritoryOption[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get<ApiResponse<SocieteTerritory[]>>(`/societes/${societe.id}/territories`)
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : [];
        const names = items
          .filter((t) => t.isActive)
          .map((t) => {
            const terr = territories.find((x) => x.id === t.territoryId);
            return { id: t.territoryId, name: terr?.name ?? t.territoryId };
          });
        if (!cancelled) setTerritoryOptions(names);
      })
      .catch(() => { if (!cancelled) setTerritoryOptions([]); });
    return () => { cancelled = true; };
  }, [societe.id, territories]);

  const handleToggleActive = async () => {
    try {
      await update(societe.id, { isActive: !societe.isActive }).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement cette société ?')) return;
    setIsDeleting(true);
    try {
      await remove(societe.id).unwrap();
      onClose();
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{societe.name}</h2>
            <p className="text-sm text-gray-500 font-mono">{societe.registrationNumber || societe.id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Informations</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500 mb-1">Type</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${TYPE_COLORS[societe.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {TYPE_LABELS[societe.type] || societe.type}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Statut</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${societe.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                  {societe.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Email</span>
                <span className="font-medium text-gray-900">{societe.contactEmail || '—'}</span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Téléphone</span>
                <span className="font-medium text-gray-900">{societe.contactPhone || '—'}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Territoires de compétence</h3>
            {territoryOptions.length === 0 ? (
              <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100">Aucun territoire assigné.</p>
            ) : (
              <ul className="space-y-2">
                {territoryOptions.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm text-gray-700">{t.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions</h3>
            <button
              onClick={handleToggleActive}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                societe.isActive
                  ? 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {societe.isActive ? 'Désactiver' : 'Activer'}
            </button>
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
