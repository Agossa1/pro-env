import React from 'react';
import { useReports } from '../hooks/useReports';
import { useTerritory } from '../../territory/hooks/useTerritory';
import {
  ReportStatus,
  IssueCategory,
  PriorityLevel,
} from '../services/reports.types';
import type { Report } from '../services/reports.types';

interface Props {
  report: Report;
  onClose: () => void;
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  [ReportStatus.DRAFT]: 'Brouillon',
  [ReportStatus.SUBMITTED]: 'Soumis',
  [ReportStatus.UNDER_REVIEW]: 'En cours d\'examen',
  [ReportStatus.IN_PROGRESS]: 'En cours de traitement',
  [ReportStatus.RESOLVED]: 'Résolu',
  [ReportStatus.CLOSED]: 'Clôturé',
  [ReportStatus.ARCHIVED]: 'Archivé',
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  [ReportStatus.DRAFT]: 'bg-gray-100 text-gray-700',
  [ReportStatus.SUBMITTED]: 'bg-blue-50 text-blue-700',
  [ReportStatus.UNDER_REVIEW]: 'bg-amber-50 text-amber-700',
  [ReportStatus.IN_PROGRESS]: 'bg-indigo-50 text-indigo-700',
  [ReportStatus.RESOLVED]: 'bg-emerald-50 text-emerald-700',
  [ReportStatus.CLOSED]: 'bg-gray-100 text-gray-500',
  [ReportStatus.ARCHIVED]: 'bg-gray-100 text-gray-400',
};

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  [IssueCategory.DRAINAGE]: 'Assainissement / Drainage',
  [IssueCategory.ROAD]: 'Infrastructures Routières',
  [IssueCategory.WASTE]: 'Gestion des Déchets',
  [IssueCategory.BIODIVERSITY]: 'Biodiversité / Espaces Verts',
  [IssueCategory.ENVIRONMENT]: 'Environnement (Air / Eau)',
  [IssueCategory.OTHER]: 'Autre',
};

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: 'text-gray-600 bg-gray-100',
  [PriorityLevel.MEDIUM]: 'text-yellow-700 bg-yellow-50',
  [PriorityLevel.HIGH]: 'text-orange-700 bg-orange-50',
  [PriorityLevel.URGENT]: 'text-red-700 bg-red-50',
  [PriorityLevel.CRITICAL]: 'text-rose-800 bg-rose-100',
};

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: 'Faible',
  [PriorityLevel.MEDIUM]: 'Modérée',
  [PriorityLevel.HIGH]: 'Haute',
  [PriorityLevel.URGENT]: 'Urgente',
  [PriorityLevel.CRITICAL]: 'Critique',
};

// Transitions de statut autorisées
const STATUS_TRANSITIONS: Partial<Record<ReportStatus, ReportStatus[]>> = {
  [ReportStatus.SUBMITTED]: [ReportStatus.UNDER_REVIEW, ReportStatus.CLOSED],
  [ReportStatus.UNDER_REVIEW]: [ReportStatus.IN_PROGRESS, ReportStatus.CLOSED],
  [ReportStatus.IN_PROGRESS]: [ReportStatus.RESOLVED, ReportStatus.CLOSED],
  [ReportStatus.RESOLVED]: [ReportStatus.CLOSED, ReportStatus.ARCHIVED],
};

export const ReportDetailsModal: React.FC<Props> = ({ report, onClose }) => {
  const { editReport, isLoading } = useReports();
  const { territories } = useTerritory();

  const territoryName = territories.find((t) => t.id === report.territoryId)?.name ?? '—';
  const transitions = STATUS_TRANSITIONS[report.status] ?? [];

  const handleStatusChange = async (newStatus: ReportStatus) => {
    try {
      await editReport(report.id, { status: newStatus });
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Erreur lors du changement de statut.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* En-tête */}
        <div className="px-8 pt-8 pb-5 border-b border-gray-200 flex items-start justify-between shrink-0">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[report.status]}`}>
                {STATUS_LABELS[report.status]}
              </span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PRIORITY_COLORS[report.priority]}`}>
                {PRIORITY_LABELS[report.priority]}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{report.title}</h2>
            <p className="text-sm text-gray-500 mt-1">{CATEGORY_LABELS[report.issueCategory]} · {territoryName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 shrink-0"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Corps */}
        <div className="px-8 py-6 flex-1 overflow-y-auto space-y-6">
          
          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {report.description || <span className="text-gray-400 italic">Aucune description fournie.</span>}
            </p>
          </div>

          {/* Métadonnées */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Déclaré le</p>
              <p className="text-sm font-semibold text-gray-800">{new Date(report.reportedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Délai SLA</p>
              <p className="text-sm font-semibold text-gray-800">{report.slaHours}h</p>
            </div>
            {report.latitude && report.longitude && (
              <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Localisation GPS</p>
                <p className="text-sm font-semibold text-gray-800">{report.latitude}, {report.longitude}</p>
              </div>
            )}
          </div>

          {/* Transitions de statut */}
          {transitions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Changer le statut</p>
              <div className="flex flex-wrap gap-2">
                {transitions.map((nextStatus) => (
                  <button
                    key={nextStatus}
                    onClick={() => handleStatusChange(nextStatus)}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors disabled:opacity-60 ${STATUS_COLORS[nextStatus]} border-current/20 hover:opacity-80`}
                  >
                    {STATUS_LABELS[nextStatus]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pied */}
        <div className="px-8 py-5 border-t border-gray-200 bg-gray-50/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
