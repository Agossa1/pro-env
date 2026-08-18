import { Edit2, Trash2 } from 'lucide-react';
import type { RecentReport, RecentReportsPagination } from '../services/dashboard.types';

const STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-[#E3F2FD] text-[#1E88E5]', // New Lead style
  in_review: 'bg-[#FCE4EC] text-[#E91E63]', // In Progress style
  assigned: 'bg-[#FFF3E0] text-[#F57C00]',
  resolved: 'bg-[#E8F5E9] text-[#43A047]', // Won style
  closed: 'bg-[#F3F4F6] text-[#4B5563]',
  rejected: 'bg-[#FFEBEE] text-[#E53935]', // Loss style
};

const STATUS_LABELS: Record<string, string> = {
  submitted: 'Nouveau',
  in_review: 'En cours',
  assigned: 'Assigné',
  resolved: 'Résolu',
  closed: 'Fermé',
  rejected: 'Rejeté',
};

const CATEGORY_LABELS: Record<string, string> = {
  drainage: 'Drainage', road: 'Route', waste: 'Déchets',
  biodiversity: 'Biodiversité', environment: 'Environnement', other: 'Autre',
};

interface LeadsReportTableProps {
  result: RecentReportsPagination;
  search: string;
  status: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPageChange: (p: number) => void;
  isLoading: boolean;
}

export function LeadsReportTable({ result, search, status, onSearchChange, onStatusChange, onPageChange, isLoading }: LeadsReportTableProps) {
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
    <div className="bg-white p-4 sm:p-5 rounded-sm shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-gray-100 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-[15px] font-semibold text-[#4B5563]">Rapport Détaillé</h2>
        
        {/* Filtres */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
          <select
            value={status}
            onChange={(e) => { onStatusChange(e.target.value); onPageChange(1); }}
            className="text-[12px] bg-[#F3F4F6] text-gray-600 border-none rounded px-3 py-1.5 focus:outline-none cursor-pointer w-full xs:w-auto"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => { onSearchChange(e.target.value); onPageChange(1); }}
              placeholder="Rechercher..."
              className="text-[12px] bg-[#F3F4F6] text-gray-600 border-none rounded pl-8 pr-3 py-1.5 focus:outline-none w-full sm:w-40"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto flex-1 -mx-4 sm:mx-0">
        <div className="min-w-[640px] px-4 sm:px-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F3F4F6]">
              <th className="px-4 py-3 text-[13px] font-semibold text-[#4B5563] first:rounded-l last:rounded-r">Signalement</th>
              <th className="px-4 py-3 text-[13px] font-semibold text-[#4B5563]">Date</th>
              <th className="px-4 py-3 text-[13px] font-semibold text-[#4B5563]">Territoire</th>
              <th className="px-4 py-3 text-[13px] font-semibold text-[#4B5563]">Catégorie</th>
              <th className="px-4 py-3 text-[13px] font-semibold text-[#4B5563]">Statut</th>
              <th className="px-4 py-3 text-[13px] font-semibold text-[#4B5563] last:rounded-r">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-3 bg-gray-100 rounded" /></td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">Aucun signalement trouvé</td>
              </tr>
            ) : (
              data.map((r: RecentReport) => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {r.title.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[13px] font-medium text-[#4B5563] truncate max-w-[150px]">{r.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[12px] text-gray-500 whitespace-nowrap">
                    {new Date(r.reportedAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-4 text-[12px] text-gray-500 truncate max-w-[120px]">
                    {r.territory}
                  </td>
                  <td className="px-4 py-4 text-[12px] text-gray-500">
                    {CATEGORY_LABELS[r.category] ?? r.category}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <button className="w-6 h-6 rounded bg-benin-green-light text-benin-green flex items-center justify-center hover:bg-benin-green/20 transition-colors">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button className="w-6 h-6 rounded bg-[#FFEBEE] text-[#E53935] flex items-center justify-center hover:bg-red-100 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-2 py-1 text-[12px] font-medium text-gray-500 hover:text-gray-900 disabled:opacity-40"
            >
              Précédent
            </button>
            {pageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={i} className="px-2 py-1 text-[12px] text-gray-400">…</span>
              ) : (
                <button
                  key={i}
                  onClick={() => onPageChange(p as number)}
                  className={`w-6 h-6 flex items-center justify-center rounded text-[12px] font-medium ${
                    p === page ? 'bg-[#1E88E5] text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-2 py-1 text-[12px] font-medium text-gray-500 hover:text-gray-900 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
