import React, { useEffect, useState } from 'react';
import { useReports } from '../hooks/useReports';
import { useTerritory } from '../../territory/hooks/useTerritory';
import { reportsApi } from '../services/reports.api';
import type { ReportMedia } from '../services/reports.api';
import { ReportStatus, IssueCategory, PriorityLevel, RiskLevel } from '../services/reports.types';
import type { Report } from '../services/reports.types';
import { CreateReportModal } from './CreateReportModal';
import { ReportDetailsModal } from './ReportDetailsModal';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserRoleCode } from '../../auth/services/auth.types';

const GridIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>;
const ListIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>;

const STATUS_LABELS: Record<ReportStatus, string> = {
  [ReportStatus.DRAFT]: 'Brouillon',
  [ReportStatus.SUBMITTED]: 'Soumis',
  [ReportStatus.UNDER_REVIEW]: 'En examen',
  [ReportStatus.IN_PROGRESS]: 'En cours',
  [ReportStatus.RESOLVED]: 'Résolu',
  [ReportStatus.CLOSED]: 'Clôturé',
  [ReportStatus.ARCHIVED]: 'Archivé',
};

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  [IssueCategory.DRAINAGE]: 'Assainissement',
  [IssueCategory.ROAD]: 'Voirie',
  [IssueCategory.WASTE]: 'Déchets',
  [IssueCategory.BIODIVERSITY]: 'Biodiversité',
  [IssueCategory.ENVIRONMENT]: 'Environnement',
  [IssueCategory.OTHER]: 'Autre',
};

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: 'Faible',
  [PriorityLevel.MEDIUM]: 'Modérée',
  [PriorityLevel.HIGH]: 'Haute',
  [PriorityLevel.URGENT]: 'Urgente',
  [PriorityLevel.CRITICAL]: 'Critique',
};

const PRIORITY_BADGE: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: 'bg-gray-100 text-gray-600 border-gray-200',
  [PriorityLevel.MEDIUM]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  [PriorityLevel.HIGH]: 'bg-orange-50 text-orange-700 border-orange-200',
  [PriorityLevel.URGENT]: 'bg-red-50 text-red-700 border-red-200',
  [PriorityLevel.CRITICAL]: 'bg-rose-100 text-rose-800 border-rose-200',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: 'Faible',
  [RiskLevel.MEDIUM]: 'Modéré',
  [RiskLevel.HIGH]: 'Élevé',
  [RiskLevel.CRITICAL]: 'Critique',
};

const RISK_BADGE: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: 'bg-gray-100 text-gray-600 border-gray-200',
  [RiskLevel.MEDIUM]: 'bg-sky-50 text-sky-700 border-sky-200',
  [RiskLevel.HIGH]: 'bg-amber-50 text-amber-700 border-amber-200',
  [RiskLevel.CRITICAL]: 'bg-purple-100 text-purple-800 border-purple-200',
};

const STATUS_BADGE: Record<ReportStatus, string> = {
  [ReportStatus.DRAFT]: 'bg-gray-100 text-gray-600 border-gray-200',
  [ReportStatus.SUBMITTED]: 'bg-benin-green-light text-benin-green border-benin-green/30',
  [ReportStatus.UNDER_REVIEW]: 'bg-amber-50 text-amber-700 border-amber-200',
  [ReportStatus.IN_PROGRESS]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  [ReportStatus.RESOLVED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [ReportStatus.CLOSED]: 'bg-gray-100 text-gray-500 border-gray-200',
  [ReportStatus.ARCHIVED]: 'bg-gray-100 text-gray-400 border-gray-200',
};

/** Placeholder quand aucune image */
const NoPhoto: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center bg-gray-50 text-gray-300 ${className}`}>
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
    </svg>
  </div>
);

export const ReportsPage: React.FC = () => {
  const { reports, isLoading, error, load } = useReports();
  const { territories, loadForForm } = useTerritory();
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Médias : map reportId → ReportMedia[]
  const [mediaMap, setMediaMap] = useState<Record<string, ReportMedia[]>>({});

  useEffect(() => {
    const filters: Record<string, string> = {};
    if (user) {
      if (user.role?.code === UserRoleCode.admin_mairie && user.municipalityId) {
        filters.municipalityId = user.municipalityId;
      } else if (user.role?.code === UserRoleCode.prefecture && user.regionId) {
        filters.regionId = user.regionId;
      } else if (user.role?.code === UserRoleCode.technicien) {
        filters.createdBy = user.id;
      }
    }
    load(filters);
    loadForForm();
  }, [load, loadForForm, user]);

  // Charge les médias de chaque signalement une seule fois
  useEffect(() => {
    reports.forEach((r) => {
      if (mediaMap[r.id] !== undefined) return;
      reportsApi.getReportMedia(r.id)
        .then((media) => setMediaMap((prev) => ({ ...prev, [r.id]: media })))
        .catch(() => setMediaMap((prev) => ({ ...prev, [r.id]: [] })));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports]);

  const territoryMap = territories.reduce((acc, curr) => {
    acc[curr.id] = curr.name;
    return acc;
  }, {} as Record<string, string>);

  const filteredReports = reports.filter((r) => {
    const matchStatus = filterStatus === '' || r.status === filterStatus;
    const matchCategory = filterCategory === '' || r.issueCategory === filterCategory;
    const matchSearch = search === '' || r.title.toLowerCase().includes(search.toLowerCase()) || (r.description && r.description.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchCategory && matchSearch;
  });

  const inputCls = "px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green";

  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Signalements</h1>
          <p className="text-sm text-gray-600 mt-0.5">Incidents et requêtes d'intervention sur le territoire</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium text-white bg-benin-green hover:bg-benin-green-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Nouveau signalement
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} w-full sm:max-w-xs`}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputCls} w-full sm:w-auto`}>
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className={`${inputCls} w-full sm:w-auto`}>
            <option value="">Toutes les catégories</option>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`} title="Vue tableau"><ListIcon /></button>
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600'}`} title="Vue grille"><GridIcon /></button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>
      )}

      {/* ── Vue TABLEAU ── */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3 text-sm font-medium text-gray-700">Signalement</th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-700">Photos</th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-700">Catégorie</th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-700">Priorité</th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-700">Risque</th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-700">Territoire</th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-700">Déclaré par</th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-700">Statut</th>
                  <th className="px-5 py-3 text-sm font-medium text-gray-700">Date</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>

              {isLoading ? (
                <tbody><tr><td colSpan={10} className="px-5 py-16 text-center text-sm text-gray-400">Chargement...</td></tr></tbody>
              ) : filteredReports.length === 0 ? (
                <tbody><tr><td colSpan={10} className="px-5 py-16 text-center text-sm text-gray-400">Aucun signalement.</td></tr></tbody>
              ) : (
                <tbody className="divide-y divide-gray-50">
                  {filteredReports.map((report) => {
                    const media = mediaMap[report.id] ?? [];
                    return (
                      <tr key={report.id} className="hover:bg-gray-50 transition-colors group">
                        {/* Titre */}
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900 truncate max-w-[180px]" title={report.title}>{report.title}</p>
                          <p className="text-[11px] text-gray-400 font-mono">{report.id.split('-')[0]}</p>
                        </td>

                        {/* Photos */}
                        <td className="px-5 py-3">
                          {media.length === 0 ? (
                            <NoPhoto className="w-10 h-10 rounded-md" />
                          ) : (
                            <div className="flex items-center gap-1">
                              {media.slice(0, 3).map((m, idx) => (
                                <button
                                  key={m.id}
                                  onClick={() => setLightbox(m.storagePath)}
                                  className="relative flex-shrink-0 focus:outline-none"
                                  title={m.fileName}
                                >
                                  <img
                                    src={m.storagePath}
                                    alt=""
                                    loading="lazy"
                                    className="w-10 h-10 object-cover rounded-md border border-gray-200 hover:border-gray-400 transition-colors"
                                  />
                                  {idx === 2 && media.length > 3 && (
                                    <span className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md text-white text-[11px] font-semibold">
                                      +{media.length - 3}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-3 text-gray-600 text-sm">{CATEGORY_LABELS[report.issueCategory] || report.issueCategory}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_BADGE[report.priority] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {PRIORITY_LABELS[report.priority] || report.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${RISK_BADGE[report.riskLevel] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {RISK_LABELS[report.riskLevel] || report.riskLevel}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-600 max-w-[140px] truncate">
                          {report.territoryName
                            || report.districtName
                            || report.municipalityName
                            || (report.municipalityId ? territoryMap[report.municipalityId] : '')
                            || '—'}
                        </td>
                        <td className="px-5 py-3">
                          <p className="text-sm text-gray-800">{report.createdByName || '—'}</p>
                          {report.createdByRole && <p className="text-[11px] text-gray-400 mt-0.5">{report.createdByRole}</p>}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[report.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {STATUS_LABELS[report.status] || report.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(report.reportedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => setSelectedReport(report)} className="text-benin-green hover:text-benin-green-dark text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Ouvrir
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              )}
            </table>
          </div>
        </div>
      ) : (
        /* ── Vue GRILLE ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full py-16 text-center text-sm text-gray-400">Chargement...</div>
          ) : filteredReports.length === 0 ? (
            <div className="col-span-full py-16 text-center text-sm text-gray-400">Aucun signalement.</div>
          ) : (
            filteredReports.map((report) => {
              const media = mediaMap[report.id] ?? [];
              return (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer flex flex-col overflow-hidden"
                >
                  {/* Galerie photos */}
                  {media.length === 0 ? (
                    <NoPhoto className="w-full h-32 rounded-none" />
                  ) : media.length === 1 ? (
                    <img
                      src={media[0].storagePath}
                      alt=""
                      loading="lazy"
                      className="w-full h-32 object-cover border-b border-gray-100"
                    />
                  ) : (
                    /* Grille 2 colonnes pour multiples images */
                    <div className={`grid border-b border-gray-100 ${media.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-px bg-gray-100`} style={{ height: '8rem' }}>
                      {media.slice(0, 3).map((m, idx) => (
                        <div key={m.id} className="relative overflow-hidden bg-gray-50">
                          <img
                            src={m.storagePath}
                            alt=""
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onClick={(e) => { e.stopPropagation(); setLightbox(m.storagePath); }}
                          />
                          {/* Badge +N sur la dernière tuile si plus de 3 */}
                          {idx === 2 && media.length > 3 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">+{media.length - 3}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Contenu */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Badges */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_BADGE[report.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {STATUS_LABELS[report.status] || report.status}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${PRIORITY_BADGE[report.priority] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {PRIORITY_LABELS[report.priority] || report.priority}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{report.title}</h3>
                    <p className="text-xs text-gray-400 mb-3">{CATEGORY_LABELS[report.issueCategory] || report.issueCategory}</p>
                    {report.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">{report.description}</p>
                    )}

                    {/* Pied */}
                    <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-700 font-medium">{report.createdByName || '—'}</p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(report.reportedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${RISK_BADGE[report.riskLevel] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {RISK_LABELS[report.riskLevel] || report.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white"
            onClick={() => setLightbox(null)}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <img
            src={lightbox}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {isCreateModalOpen && (
        <CreateReportModal onClose={() => setIsCreateModalOpen(false)} />
      )}

      {selectedReport && (
        <ReportDetailsModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
};
