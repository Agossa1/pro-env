import React, { useEffect, useState } from 'react';
import { useStructures } from '../hooks/useStructures';
import { useTerritory } from '../../territory/hooks/useTerritory';
import {
  InfrastructureType,
  InfrastructureCondition,
  InfrastructureStatus,
} from '../services/structures.types';
import { CreateStructureModal } from './CreateStructureModal';
import { StructureDetailsModal } from './StructureDetailsModal';

export const TYPE_LABELS: Record<InfrastructureType, string> = {
  [InfrastructureType.DRAIN]: 'Caniveau',
  [InfrastructureType.ROAD]: 'Route',
  [InfrastructureType.BRIDGE]: 'Pont',
  [InfrastructureType.WATER_PIPE]: 'Canalisation eau',
  [InfrastructureType.SEWER_PIPE]: 'Collecteur eaux usées',
  [InfrastructureType.STREETLIGHT]: 'Éclairage public',
  [InfrastructureType.WASTE_BIN]: 'Bac à ordures',
  [InfrastructureType.WELL]: 'Puits / Forage',
  [InfrastructureType.MARKET]: 'Marché',
  [InfrastructureType.SCHOOL]: 'École',
  [InfrastructureType.HEALTH_CENTER]: 'Centre de santé',
  [InfrastructureType.PUBLIC_TOILET]: 'Toilettes publiques',
  [InfrastructureType.PARK]: 'Espace vert',
  [InfrastructureType.OTHER]: 'Autre',
};

export const CONDITION_LABELS: Record<InfrastructureCondition, string> = {
  [InfrastructureCondition.NEW]: 'Neuf',
  [InfrastructureCondition.GOOD]: 'Bon',
  [InfrastructureCondition.FAIR]: 'Acceptable',
  [InfrastructureCondition.POOR]: 'Mauvais',
  [InfrastructureCondition.CRITICAL]: 'Critique',
  [InfrastructureCondition.DESTROYED]: 'Hors service',
};

export const CONDITION_COLORS: Record<InfrastructureCondition, string> = {
  [InfrastructureCondition.NEW]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [InfrastructureCondition.GOOD]: 'bg-green-50 text-green-700 border-green-200',
  [InfrastructureCondition.FAIR]: 'bg-benin-green-light text-benin-green border-benin-green/30',
  [InfrastructureCondition.POOR]: 'bg-orange-50 text-orange-700 border-orange-200',
  [InfrastructureCondition.CRITICAL]: 'bg-red-50 text-red-700 border-red-200',
  [InfrastructureCondition.DESTROYED]: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const STATUS_LABELS: Record<InfrastructureStatus, string> = {
  [InfrastructureStatus.ACTIVE]: 'Actif',
  [InfrastructureStatus.INACTIVE]: 'Inactif',
  [InfrastructureStatus.ARCHIVED]: 'Archivé',
};

export const STATUS_COLORS: Record<InfrastructureStatus, string> = {
  [InfrastructureStatus.ACTIVE]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [InfrastructureStatus.INACTIVE]: 'bg-gray-100 text-gray-600 border-gray-200',
  [InfrastructureStatus.ARCHIVED]: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const StructuresPage: React.FC = () => {
  const { list, isLoading, load } = useStructures();
  const { territories, loadForForm } = useTerritory();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const selectedStructure = list.find(s => s.id === selectedStructureId) || null;

  // Filtres
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCondition, setFilterCondition] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    load({ limit: 100 });
    loadForForm();
  }, [load, loadForForm]);

  const territoryMap = territories.reduce((acc, curr) => {
    acc[curr.id] = curr.name;
    return acc;
  }, {} as Record<string, string>);

  const filteredStructures = list.filter((s) => {
    const matchType = filterType === '' || s.type === filterType;
    const matchStatus = filterStatus === '' || s.status === filterStatus;
    const matchCondition = filterCondition === '' || s.condition === filterCondition;
    const matchSearch =
      search === '' ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.referenceCode && s.referenceCode.toLowerCase().includes(search.toLowerCase()));
    return matchType && matchStatus && matchCondition && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Structures</h1>
          <p className="text-sm text-gray-500">Équipements physiques urbains : caniveaux, routes, ponts, éclairage...</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-benin-green hover:bg-benin-green-dark transition-colors"
        >
          + Nouvelle structure
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom ou code..."
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
          <select
            value={filterCondition}
            onChange={(e) => setFilterCondition(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-benin-green/20"
          >
            <option value="">Toutes les conditions</option>
            {Object.entries(CONDITION_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-benin-green/20"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
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
        <div className="bg-white rounded-xl border border-gray-200  overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold text-gray-700">Nom</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Territoire</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Condition</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>

              {isLoading && (
                <tbody className="divide-y divide-gray-100">
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Chargement des structures...</td></tr>
                </tbody>
              )}

              {!isLoading && filteredStructures.length === 0 && (
                <tbody className="divide-y divide-gray-100">
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Aucune structure trouvée.</td></tr>
                </tbody>
              )}

              {!isLoading && filteredStructures.length > 0 && (
                <tbody className="divide-y divide-gray-100">
                  {filteredStructures.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{s.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{s.id.substring(0, 8)}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{s.referenceCode || '—'}</td>
                      <td className="px-6 py-4 text-gray-600">{TYPE_LABELS[s.type] || s.type}</td>
                      <td className="px-6 py-4 text-gray-600">{s.territoryName || territoryMap[s.territoryId] || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${CONDITION_COLORS[s.condition] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {CONDITION_LABELS[s.condition] || s.condition}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[s.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {STATUS_LABELS[s.status] || s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedStructureId(s.id)}
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
          ) : filteredStructures.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-gray-500">Aucune structure trouvée.</div>
          ) : (
            filteredStructures.map((s) => (
              <div key={s.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer" onClick={() => setSelectedStructureId(s.id)}>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-benin-green-light text-benin-green">
                    {TYPE_LABELS[s.type] || s.type}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CONDITION_COLORS[s.condition] || 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                    {CONDITION_LABELS[s.condition] || s.condition}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2">{s.name}</h3>
                <p className="text-xs text-gray-400 font-mono mb-2">{s.referenceCode || ''}</p>
                <p className="text-sm text-gray-500 flex-1 line-clamp-3 mb-4">{s.description || 'Aucune description fournie.'}</p>
                <div className="pt-4 border-t border-gray-100 mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{s.territoryName || territoryMap[s.territoryId] || '—'}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[s.status] || 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                      {STATUS_LABELS[s.status] || s.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedStructure && (
        <StructureDetailsModal
          structure={selectedStructure}
          onClose={() => setSelectedStructureId(null)}
        />
      )}

      {isCreateOpen && (
        <CreateStructureModal onClose={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
};