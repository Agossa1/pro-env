import type { RecentReport, RecentReportsPagination } from '../services/dashboard.types';

const STATUS_STYLES: Record<string, string> = {
  submitted: 'text-benin-green bg-benin-green-light',
  in_review: 'text-amber-700 bg-amber-50',
  assigned: 'text-indigo-700 bg-indigo-50',
  resolved: 'text-emerald-700 bg-emerald-50',
  closed: 'text-gray-600 bg-gray-100',
  rejected: 'text-rose-700 bg-rose-50',
};
const STATUS_LABELS: Record<string, string> = {
  submitted: 'Soumis', in_review: 'En révision', assigned: 'Assigné',
  resolved: 'Résolu', closed: 'Fermé', rejected: 'Rejeté',
};
const CATEGORY_LABELS: Record<string, string> = {
  drainage: 'Drainage', road: 'Route', waste: 'Déchets',
  biodiversity: 'Biodiversité', environment: 'Environnement', other: 'Autre',
};
const PRIORITY_DOTS: Record<string, string> = {
  critical: 'bg-rose-500', high: 'bg-orange-400', medium: 'bg-amber-400', low: 'bg-gray-400',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

interface Props {
  result: RecentReportsPagination;
  search: string;
  status: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPageChange: (p: number) => void;
  isLoading: boolean;
}

export function RecentReports({ result, search, status, onSearchChange, onStatusChange, onPageChange, isLoading }: Props) {
  const { data, page, totalPages } = result;

  const pageNumbers = () => {
    const pages: (number | '...')[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-900">Signalements récents</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Filtre statut */}
          <select
            value={status}
            onChange={(e) => { onStatusChange(e.target.value); onPageChange(1); }}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-benin-green/30 bg-white"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {/* Recherche */}
          <div className="relative flex-1 sm:w-52">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { onSearchChange(e.target.value); onPageChange(1); }}
              placeholder="Rechercher..."
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-benin-green/30"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/70 text-xs font-semibold text-gray-500 border-b border-gray-100">
              <th className="px-6 py-3">Signalement</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Territoire</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="h-3 bg-gray-100 rounded" /></td>
                  ))}
                </tr>
              ))
              : data.length === 0
              ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                    Aucun signalement trouvé
                  </td>
                </tr>
              )
              : data.map((r: RecentReport) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOTS[r.priority] ?? 'bg-gray-300'}`} />
                      <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{r.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{formatDate(r.reportedAt)}</td>
                  <td className="px-4 py-4 text-sm text-gray-500">{CATEGORY_LABELS[r.category] ?? r.category}</td>
                  <td className="px-4 py-4 text-sm text-gray-500 truncate max-w-[120px]">{r.territory}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 transition-colors"
          >
            ← Précédent
          </button>
          <div className="flex items-center gap-1">
            {pageNumbers().map((p, i) =>
              p === '...'
                ? <span key={i} className="w-8 text-center text-sm text-gray-400">…</span>
                : (
                  <button
                    key={i}
                    onClick={() => onPageChange(p as number)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                      p === page
                        ? 'bg-benin-green text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                )
            )}
          </div>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 transition-colors"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
