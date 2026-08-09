/*
 * |--------------------------------------------------------------------------
 * | TERRITORIES PAGE
 * |--------------------------------------------------------------------------
 * | Tableau de bord de gestion des territoires :
 * | Pays → Département → Commune → Arrondissement → Quartier
 * |--------------------------------------------------------------------------
 */

import { useEffect, useState } from 'react';
import { useTerritory } from '../hooks/useTerritory';
import type { Territory } from '../services/territory.types';

// ─── Codes de type de territoire (miroir backend) ─────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  PAYS:           'Pays',
  DEPARTMENT:     'Département',
  COMMUNE:        'Commune',
  ARRONDISSEMENT: 'Arrondissement',
  QUARTIER:       'Quartier',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:   'bg-emerald-500',
  INACTIVE: 'bg-gray-400',
  ARCHIVED: 'bg-red-500',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:   'Actif',
  INACTIVE: 'Inactif',
  ARCHIVED: 'Archivé',
};

// ─── Filtres disponibles ──────────────────────────────────────────────────────
const FILTER_TABS = [
  { key: '',               label: 'Tous' },
  { key: 'PAYS',           label: 'Pays' },
  { key: 'DEPARTMENT',     label: 'Départements' },
  { key: 'COMMUNE',        label: 'Communes' },
  { key: 'ARRONDISSEMENT', label: 'Arrondissements' },
  { key: 'QUARTIER',       label: 'Quartiers' },
];

export default function TerritoriesPage() {
  const { territories, isLoading, error, reload } = useTerritory();

  const [activeFilter, setActiveFilter] = useState('');
  const [search, setSearch]             = useState('');

  useEffect(() => {
    reload();
  }, [reload]);

  // 1. Logique de filtrage et de hiérarchie
  let displayList: (Territory & { depth?: number })[] = [];

  if (activeFilter === '' && search === '') {
    // Vue hiérarchique par défaut
    type TreeNode = Territory & { depth?: number; children: TreeNode[] };
    const territoryMap = new Map<string, TreeNode>();
    
    // Initialisation de la map
    territories.forEach(t => {
      territoryMap.set(t.id, { ...t, children: [] });
    });

    const roots: TreeNode[] = [];
    territories.forEach(t => {
      const node = territoryMap.get(t.id);
      if (node) {
        if (t.parentTerritoryId && territoryMap.has(t.parentTerritoryId)) {
          territoryMap.get(t.parentTerritoryId)!.children.push(node);
        } else {
          roots.push(node);
        }
      }
    });

    // Aplatissement récursif avec profondeur
    const flatten = (nodes: TreeNode[], depth = 0) => {
      nodes.forEach(node => {
        node.depth = depth;
        displayList.push(node);
        if (node.children) flatten(node.children, depth + 1);
      });
    };
    
    // Optionnel : Trier les racines par nom pour un rendu plus propre
    roots.sort((a, b) => a.name.localeCompare(b.name));
    flatten(roots);
  } else {
    // Vue filtrée plate
    displayList = territories.filter((t) => {
      const matchType = activeFilter === '' || t.territoryTypeCode === activeFilter;
      const matchSearch = search === '' ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        (t.code ?? '').toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }

  // Stats par type
  const stats = Object.entries(TYPE_LABELS).map(([key, label]) => ({
    key,
    label,
    count: territories.filter((t) => t.territoryTypeCode === key).length,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* En-tête de page institutionnel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administration des Territoires</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez la nomenclature territoriale de l'État (Pays, Départements, Communes, Arrondissements, Quartiers).
          </p>
        </div>
        <button
          onClick={() => reload()}
          title="Rafraîchir les données"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
        >
          <svg className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : 'text-gray-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Rafraîchir
        </button>
      </div>

      {/* Cartes statistiques (Design sobre) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div
            key={s.key}
            className="p-5 rounded-lg border border-gray-200 bg-white flex flex-col"
          >
            <span className="text-sm font-medium text-gray-500 mb-1">{s.label}</span>
            <span className="text-2xl font-bold text-gray-900">{s.count}</span>
          </div>
        ))}
      </div>

      {/* Barre de recherche et Filtres par onglets */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-2 rounded-lg border border-gray-200">
        
        {/* Onglets classiques */}
        <div className="flex overflow-x-auto hide-scrollbar px-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-md ${
                activeFilter === tab.key
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Recherche stricte */}
        <div className="relative w-full md:w-72 shrink-0 px-2 md:px-0">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher (nom, code)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
          />
        </div>

      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button onClick={() => reload()} className="text-sm font-semibold text-red-700 hover:text-red-800">
            Réessayer
          </button>
        </div>
      )}

      {/* Tableau de données */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        
        {/* En-tête du tableau : Compteur de résultats */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-800">Liste des territoires</h2>
          <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">
            {displayList.length} enregistrement{displayList.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3.5 font-semibold text-gray-700">Nom du territoire</th>
                <th className="px-6 py-3.5 font-semibold text-gray-700">Code INSEE/SIGIE</th>
                <th className="px-6 py-3.5 font-semibold text-gray-700">Niveau</th>
                <th className="px-6 py-3.5 font-semibold text-gray-700">Statut</th>
              </tr>
            </thead>
            {isLoading && (
              <tbody className="divide-y divide-gray-200">
                <tr key="loading">
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <svg className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <p className="text-sm text-gray-500">Chargement des données...</p>
                  </td>
                </tr>
              </tbody>
            )}

            {!isLoading && displayList.length === 0 && (
              <tbody className="divide-y divide-gray-200">
                <tr key="empty">
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-gray-900 mb-1">Aucun résultat</p>
                    <p className="text-sm text-gray-500">
                      {search ? 'Modifiez vos critères de recherche.' : 'La base de données territoriale est vide.'}
                    </p>
                  </td>
                </tr>
              </tbody>
            )}

            {!isLoading && displayList.length > 0 && (
              <tbody className="divide-y divide-gray-200">
                {displayList.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center" style={{ paddingLeft: t.depth ? `${t.depth * 1.5}rem` : '0' }}>
                        {t.depth && t.depth > 0 ? (
                          <span className="text-gray-300 mr-2" aria-hidden="true">└</span>
                        ) : null}
                        <p className="font-medium text-gray-900">{t.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {t.code ? (
                        <span className="font-mono text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                          {t.code}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md border border-gray-200 bg-gray-50 text-xs font-medium text-gray-700">
                        {TYPE_LABELS[t.territoryTypeCode ?? ''] ?? t.territoryTypeCode ?? 'Inconnu'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[t.status] ?? 'bg-gray-300'}`} />
                        <span className="text-sm font-medium text-gray-700">
                          {STATUS_LABELS[t.status] ?? t.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
