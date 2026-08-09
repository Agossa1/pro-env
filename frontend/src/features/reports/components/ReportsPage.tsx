import React, { useEffect, useState } from 'react';
import { useReports } from '../hooks/useReports';
import { useTerritory } from '../../territory/hooks/useTerritory';
import Button from '../../../components/boutons/Button';
import { ReportStatus, IssueCategory } from '../services/reports.types';
import type { Report } from '../services/reports.types';
import { CreateReportModal } from './CreateReportModal';
import { ReportDetailsModal } from './ReportDetailsModal';

// Icônes temporaires (à remplacer par heroicons ou lucide-react selon le projet)
const GridIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>;
const ListIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>;
const PlusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>;

const STATUS_LABELS: Record<ReportStatus, string> = {
  [ReportStatus.DRAFT]: 'Brouillon',
  [ReportStatus.SUBMITTED]: 'Soumis',
  [ReportStatus.UNDER_REVIEW]: 'En cours d\'examen',
  [ReportStatus.IN_PROGRESS]: 'En cours',
  [ReportStatus.RESOLVED]: 'Résolu',
  [ReportStatus.CLOSED]: 'Clôturé',
  [ReportStatus.ARCHIVED]: 'Archivé',
};

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  [IssueCategory.DRAINAGE]: 'Assainissement / Drainage',
  [IssueCategory.ROAD]: 'Infrastructures Routières',
  [IssueCategory.WASTE]: 'Gestion des Déchets',
  [IssueCategory.BIODIVERSITY]: 'Biodiversité / Espaces Verts',
  [IssueCategory.ENVIRONMENT]: 'Environnement (Air/Eau)',
  [IssueCategory.OTHER]: 'Autre',
};

export const ReportsPage: React.FC = () => {
  const { reports, isLoading, error, load } = useReports();
  const { territories, load: loadTerritories } = useTerritory();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Filtres locaux (pourrait être passé à l'API)
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    load(); // Charger les signalements
    loadTerritories(); // Charger les territoires pour mapper les IDs vers les noms
  }, [load, loadTerritories]);

  // Map des territoires pour affichage rapide
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

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Signalements (Reports)</h1>
          <p className="text-sm text-gray-500">Gérez les signalements d'incidents et de requêtes d'intervention sur le territoire.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
            <span className="flex items-center gap-2">
              <PlusIcon />
              Nouveau Signalement
            </span>
          </Button>
        </div>
      </div>

      {/* Barre d'outils : Filtres & Vue */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <input
            type="text"
            placeholder="Rechercher par titre ou description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-xs pl-4 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Toutes les catégories</option>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        
        {/* Toggle Vue */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md flex items-center justify-center transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            title="Vue Tableau"
          >
            <ListIcon />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            title="Vue Grille"
          >
            <GridIcon />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 text-sm rounded-lg border border-red-200">
          Erreur: {error}
        </div>
      )}

      {/* Rendu des données */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold text-gray-700">Titre</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Catégorie</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Territoire</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              
              {isLoading && (
                <tbody className="divide-y divide-gray-100">
                  <tr key="loading">
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Chargement des signalements...</td>
                  </tr>
                </tbody>
              )}

              {!isLoading && filteredReports.length === 0 && (
                <tbody className="divide-y divide-gray-100">
                  <tr key="empty">
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Aucun signalement trouvé.</td>
                  </tr>
                </tbody>
              )}

              {!isLoading && filteredReports.length > 0 && (
                <tbody className="divide-y divide-gray-100">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[200px]" title={report.title}>{report.title}</td>
                      <td className="px-6 py-4 text-gray-600">{CATEGORY_LABELS[report.issueCategory] || report.issueCategory}</td>
                      <td className="px-6 py-4 text-gray-600">{territoryMap[report.territoryId] || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          {STATUS_LABELS[report.status] || report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedReport(report)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity"
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
          ) : filteredReports.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-gray-500">Aucun signalement trouvé.</div>
          ) : (
            filteredReports.map((report) => (
              <div key={report.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer" onClick={() => setSelectedReport(report)}>
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-blue-50 text-blue-700">
                    {CATEGORY_LABELS[report.issueCategory] || report.issueCategory}
                  </span>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 border border-gray-200 rounded text-gray-700">
                    {STATUS_LABELS[report.status] || report.status}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">{report.title}</h3>
                <p className="text-sm text-gray-500 flex-1 line-clamp-3 mb-4">{report.description || 'Aucune description fournie.'}</p>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <span className="text-xs text-gray-400">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => setSelectedReport(report)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                  >
                    Voir plus &rarr;
                  </button>
                </div>
              </div>
            ))
          )}
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
