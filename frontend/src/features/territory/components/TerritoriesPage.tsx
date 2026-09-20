/*
 * |--------------------------------------------------------------------------
 * | TERRITORIES PAGE
 * |--------------------------------------------------------------------------
 * | Tableau de bord de gestion des territoires :
 * | Département → Commune → Arrondissement → Quartier
 * |--------------------------------------------------------------------------
 */

import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useTerritory } from '../hooks/useTerritory';
import { fetchTerritories } from '../services/territory.api';

// ─── Codes de type de territoire (miroir backend) ─────────────────────────────
const TYPE_LABELS: Record<string, string> = {
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

// ─── Icônes SVG par niveau ─────────────────────────────────────────────────────
const LEVEL_ICONS: Record<string, JSX.Element> = {
  DEPARTMENT: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M9 21V7l3-4 3 4v14M9 11h6"/>
    </svg>
  ),
  COMMUNE: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"/>
    </svg>
  ),
  ARRONDISSEMENT: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"/>
    </svg>
  ),
  QUARTIER: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
    </svg>
  ),
};

// ─── Palette couleurs par niveau ───────────────────────────────────────────────
const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  DEPARTMENT:     { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    badge: 'bg-blue-100 text-blue-700' },
  COMMUNE:        { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  ARRONDISSEMENT: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   badge: 'bg-amber-100 text-amber-700' },
  QUARTIER:       { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  badge: 'bg-purple-100 text-purple-700' },
};

// ─── Filtres disponibles ──────────────────────────────────────────────────────
const FILTER_TABS = [
  { key: '',               label: 'Tous' },
  { key: 'DEPARTMENT',     label: 'Départements' },
  { key: 'COMMUNE',        label: 'Communes' },
  { key: 'ARRONDISSEMENT', label: 'Arrondissements' },
  { key: 'QUARTIER',       label: 'Quartiers' },
];

const STAT_LEVELS = ['DEPARTMENT', 'COMMUNE', 'ARRONDISSEMENT', 'QUARTIER'] as const;

export default function TerritoriesPage() {
  const [activeFilter, setActiveFilter] = useState('');
  const [search, setSearch]             = useState('');
  const [currentPage, setCurrentPage]   = useState(1);
  const limit = 20;

  // ─── Stats par niveau (totaux depuis la DB) ────────────────────────────────
  const [levelTotals, setLevelTotals] = useState<Record<string, number>>({
    DEPARTMENT: 0, COMMUNE: 0, ARRONDISSEMENT: 0, QUARTIER: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    setLoadingStats(true);
    Promise.all(
      STAT_LEVELS.map((code) => fetchTerritories(1, 1, undefined, code).then((r) => ({ code, total: r.total })))
    ).then((results) => {
      const totals: Record<string, number> = {};
      results.forEach(({ code, total }) => { totals[code] = total; });
      setLevelTotals(totals);
    }).finally(() => setLoadingStats(false));
  }, []);

  // ─── Recherche debouncée ───────────────────────────────────────────────────
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearch(search); }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { territories, isLoading, error, pagination, load } = useTerritory({
    territoryTypeCode: activeFilter || undefined,
    search: debouncedSearch || undefined,
  });

  useEffect(() => {
    load(currentPage, limit);
  }, [load, currentPage, activeFilter, debouncedSearch]);

  useEffect(() => { setCurrentPage(1); }, [activeFilter, debouncedSearch]);

  const displayList = territories;
  const grandTotal  = Object.values(levelTotals).reduce((s, n) => s + n, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administration des Territoires</h1>
          <p className="text-sm text-gray-500 mt-1">
            Nomenclature territoriale du Bénin — Département → Commune → Arrondissement → Quartier
          </p>
        </div>
        <button
          onClick={() => load(currentPage, limit)}
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

      {/* ─── Cartes de statistiques par niveau ─────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_LEVELS.map((code) => {
          const colors = LEVEL_COLORS[code];
          return (
            <button
              key={code}
              onClick={() => setActiveFilter(activeFilter === code ? '' : code)}
              className={`p-5 rounded-xl border text-left transition-all hover:shadow-md ${
                activeFilter === code
                  ? `${colors.bg} ${colors.border} shadow-sm ring-2 ring-offset-1 ring-current ${colors.text}`
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`flex items-center gap-2 mb-3 ${activeFilter === code ? colors.text : 'text-gray-500'}`}>
                {LEVEL_ICONS[code]}
                <span className="text-xs font-semibold uppercase tracking-wide">{TYPE_LABELS[code]}</span>
              </div>
              <p className={`text-3xl font-bold ${activeFilter === code ? colors.text : 'text-gray-900'}`}>
                {loadingStats ? (
                  <span className="inline-block w-12 h-7 bg-gray-200 rounded animate-pulse" />
                ) : (
                  levelTotals[code].toLocaleString('fr-FR')
                )}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {((levelTotals[code] / (grandTotal || 1)) * 100).toFixed(1)}% du total
              </p>
            </button>
          );
        })}
      </div>

      {/* ─── Barre filtres + recherche ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-2 rounded-lg border border-gray-200">
        <div className="flex overflow-x-auto hide-scrollbar px-2 gap-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded-md flex items-center gap-2 ${
                activeFilter === tab.key
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.key !== '' && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeFilter === tab.key
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {loadingStats ? '…' : levelTotals[tab.key]?.toLocaleString('fr-FR') ?? '0'}
                </span>
              )}
              {tab.key === '' && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeFilter === ''
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {loadingStats ? '…' : grandTotal.toLocaleString('fr-FR')}
                </span>
              )}
            </button>
          ))}
        </div>

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
          <button onClick={() => load(currentPage, limit)} className="text-sm font-semibold text-red-700 hover:text-red-800">
            Réessayer
          </button>
        </div>
      )}

      {/* ─── Tableau de données ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">

        {/* En-tête tableau */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              {activeFilter ? `Liste des ${FILTER_TABS.find(t => t.key === activeFilter)?.label}` : 'Tous les territoires'}
            </h2>
            {debouncedSearch && (
              <p className="text-xs text-gray-400 mt-0.5">Filtrage sur : « {debouncedSearch} »</p>
            )}
          </div>
          <span className="text-xs font-medium text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-md shadow-sm">
            {pagination ? `${pagination.total.toLocaleString('fr-FR')} résultat${pagination.total > 1 ? 's' : ''}` : `${displayList.length} résultat${displayList.length > 1 ? 's' : ''}`}
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
                {displayList.map((t) => {
                  const colors = LEVEL_COLORS[t.territoryTypeCode ?? ''];
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{t.name}</p>
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
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs font-medium ${colors?.badge ?? 'bg-gray-100 text-gray-600'} ${colors?.border ?? 'border-gray-200'}`}>
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
                  );
                })}
              </tbody>
            )}
          </table>
        </div>

        {/* ─── Pagination Footer ─────────────────────────────────────────────── */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page <span className="font-medium text-gray-900">{pagination.page}</span> sur{' '}
              <span className="font-medium text-gray-900">{pagination.totalPages}</span>
              {' '}— Total :{' '}
              <span className="font-medium text-gray-900">{pagination.total.toLocaleString('fr-FR')}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>

              {/* Numéros de pages */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const half = 2;
                let start = Math.max(1, currentPage - half);
                const end = Math.min(pagination.totalPages, start + 4);
                start = Math.max(1, end - 4);
                return start + i;
              }).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                    p === currentPage
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
