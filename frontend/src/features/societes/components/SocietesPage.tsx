import React, { useEffect, useState } from 'react';
import { useSocietes } from '../hooks/useSocietes';
import { SocieteType } from '../services/societes.types';
import { CreateSocieteModal } from './CreateSocieteModal';
import { SocieteDetailsModal } from './SocieteDetailsModal';

export const TYPE_LABELS: Record<SocieteType, string> = {
  [SocieteType.PUBLIC_COMPANY]: 'Entreprise publique',
  [SocieteType.PRIVATE_COMPANY]: 'Entreprise privée',
  [SocieteType.UTILITY]: 'Concessionnaire',
  [SocieteType.NGO]: 'ONG',
};

export const TYPE_COLORS: Record<SocieteType, string> = {
  [SocieteType.PUBLIC_COMPANY]: 'bg-benin-green-light text-benin-green border-benin-green/30',
  [SocieteType.PRIVATE_COMPANY]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [SocieteType.UTILITY]: 'bg-orange-50 text-orange-700 border-orange-200',
  [SocieteType.NGO]: 'bg-purple-50 text-purple-700 border-purple-200',
};

export const SocietesPage: React.FC = () => {
  const { list, isLoading, load } = useSocietes();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedSocieteId, setSelectedSocieteId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const selectedSociete = list.find((s) => s.id === selectedSocieteId) || null;

  const [filterType, setFilterType] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    load({ limit: 100 });
  }, [load]);

  const filteredSocietes = list.filter((s) => {
    const matchType = filterType === '' || s.type === filterType;
    const matchSearch =
      search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.registrationNumber && s.registrationNumber.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sociétés</h1>
          <p className="text-sm text-gray-500">Prestataires et concessionnaires exécutant les missions terrain</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-benin-green hover:bg-benin-green-dark transition-colors"
        >
          + Nouvelle société
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-sm border border-gray-200 flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom ou n° d'enregistrement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-xs pl-4 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-benin-green/20"
          >
            <option value="">Tous les types</option>
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md flex items-center justify-center transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            title="Vue Tableau"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            title="Vue Grille"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </button>
        </div>
      </div>

      {/* Data Render */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold text-gray-700">Nom</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">N° Enregistrement</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Téléphone</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>

              {isLoading && (
                <tbody className="divide-y divide-gray-100">
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Chargement des sociétés...</td></tr>
                </tbody>
              )}

              {!isLoading && filteredSocietes.length === 0 && (
                <tbody className="divide-y divide-gray-100">
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Aucune société trouvée.</td></tr>
                </tbody>
              )}

              {!isLoading && filteredSocietes.length > 0 && (
                <tbody className="divide-y divide-gray-100">
                  {filteredSocietes.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{s.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{s.id.substring(0, 8)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${TYPE_COLORS[s.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {TYPE_LABELS[s.type] || s.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{s.registrationNumber || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{s.contactEmail || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{s.contactPhone || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedSocieteId(s.id)}
                          className="text-benin-green hover:text-benin-green-dark font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-sm text-gray-500">Chargement...</div>
          ) : filteredSocietes.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-gray-500">Aucune société trouvée.</div>
          ) : (
            filteredSocietes.map((s) => (
              <div key={s.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer" onClick={() => setSelectedSocieteId(s.id)}>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${TYPE_COLORS[s.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {TYPE_LABELS[s.type] || s.type}
                  </span>
                  {s.isActive ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">Actif</span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-gray-100 text-gray-500 border-gray-200">Inactif</span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">{s.name}</h3>
                <p className="text-xs text-gray-400 font-mono mb-2">{s.registrationNumber || ''}</p>
                <p className="text-sm text-gray-500 flex-1 line-clamp-2 mb-4">{s.contactEmail || 'Aucun email'}</p>
                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <p className="text-xs text-gray-500">{s.contactPhone || '—'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedSociete && (
        <SocieteDetailsModal
          societe={selectedSociete}
          onClose={() => setSelectedSocieteId(null)}
        />
      )}

      {isCreateOpen && (
        <CreateSocieteModal onClose={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
};
