import React, { useEffect, useState } from 'react';
import { useReports } from '../hooks/useReports';
import { useTerritory } from '../../territory/hooks/useTerritory';
import { reportsApi, type ReportMedia } from '../services/reports.api';
import {
  ReportStatus,
  IssueCategory,
  PriorityLevel,
  RiskLevel,
  WaterFlowStatus,
} from '../services/reports.types';
import type { Report } from '../services/reports.types';
import { CreateMissionModal } from '../../missions/components/CreateMissionModal';

interface Props {
  report: Report;
  onClose: () => void;
}

const STATUS_LABELS: Record<ReportStatus, string> = {
  [ReportStatus.DRAFT]: 'Brouillon',
  [ReportStatus.SUBMITTED]: 'Soumis',
  [ReportStatus.UNDER_REVIEW]: 'En cours d\'examen',
  [ReportStatus.IN_PROGRESS]: 'En traitement',
  [ReportStatus.RESOLVED]: 'Résolu',
  [ReportStatus.CLOSED]: 'Clôturé',
  [ReportStatus.ARCHIVED]: 'Archivé',
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  [ReportStatus.DRAFT]: 'bg-gray-100 text-gray-600',
  [ReportStatus.SUBMITTED]: 'bg-benin-green-light text-benin-green',
  [ReportStatus.UNDER_REVIEW]: 'bg-amber-50 text-amber-700',
  [ReportStatus.IN_PROGRESS]: 'bg-indigo-50 text-indigo-600',
  [ReportStatus.RESOLVED]: 'bg-emerald-50 text-emerald-700',
  [ReportStatus.CLOSED]: 'bg-gray-100 text-gray-500',
  [ReportStatus.ARCHIVED]: 'bg-gray-100 text-gray-400',
};

const STATUS_DOT: Record<ReportStatus, string> = {
  [ReportStatus.DRAFT]: 'bg-gray-400',
  [ReportStatus.SUBMITTED]: 'bg-benin-green',
  [ReportStatus.UNDER_REVIEW]: 'bg-amber-500',
  [ReportStatus.IN_PROGRESS]: 'bg-indigo-500',
  [ReportStatus.RESOLVED]: 'bg-emerald-500',
  [ReportStatus.CLOSED]: 'bg-gray-400',
  [ReportStatus.ARCHIVED]: 'bg-gray-300',
};

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  [IssueCategory.DRAINAGE]: 'Assainissement / Drainage',
  [IssueCategory.ROAD]: 'Infrastructures routières',
  [IssueCategory.WASTE]: 'Gestion des déchets',
  [IssueCategory.BIODIVERSITY]: 'Biodiversité / Espaces verts',
  [IssueCategory.ENVIRONMENT]: 'Environnement (air / eau)',
  [IssueCategory.OTHER]: 'Autre',
};

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: 'text-gray-500 bg-gray-100',
  [PriorityLevel.MEDIUM]: 'text-amber-700 bg-amber-50',
  [PriorityLevel.HIGH]: 'text-orange-700 bg-orange-50',
  [PriorityLevel.URGENT]: 'text-red-700 bg-red-50',
  [PriorityLevel.CRITICAL]: 'text-rose-800 bg-rose-50',
};

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: 'Faible',
  [PriorityLevel.MEDIUM]: 'Modérée',
  [PriorityLevel.HIGH]: 'Haute',
  [PriorityLevel.URGENT]: 'Urgente',
  [PriorityLevel.CRITICAL]: 'Critique',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: 'Faible',
  [RiskLevel.MEDIUM]: 'Modéré',
  [RiskLevel.HIGH]: 'Élevé',
  [RiskLevel.CRITICAL]: 'Critique',
};

const RISK_COLORS: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: 'text-gray-500 bg-gray-100',
  [RiskLevel.MEDIUM]: 'text-sky-700 bg-sky-50',
  [RiskLevel.HIGH]: 'text-amber-700 bg-amber-50',
  [RiskLevel.CRITICAL]: 'text-purple-700 bg-purple-50',
};

const FLOW_STATUS_LABELS: Record<WaterFlowStatus, string> = {
  [WaterFlowStatus.FREE]: 'Libre',
  [WaterFlowStatus.RESTRICTED]: 'Restreint',
  [WaterFlowStatus.BLOCKED]: 'Bouché',
};

// Transitions de statut autorisées
const STATUS_TRANSITIONS: Partial<Record<ReportStatus, ReportStatus[]>> = {
  [ReportStatus.SUBMITTED]: [ReportStatus.UNDER_REVIEW, ReportStatus.CLOSED],
  [ReportStatus.UNDER_REVIEW]: [ReportStatus.IN_PROGRESS, ReportStatus.CLOSED],
  [ReportStatus.IN_PROGRESS]: [ReportStatus.RESOLVED, ReportStatus.CLOSED],
  [ReportStatus.RESOLVED]: [ReportStatus.CLOSED, ReportStatus.ARCHIVED],
};

// Composant réutilisable pour une cellule de métadonnée
const MetaCell: React.FC<{ label: string; value: React.ReactNode; wide?: boolean }> = ({ label, value, wide }) => (
  <div className={`flex flex-col gap-0.5 py-3 px-4 rounded-lg bg-gray-50 border border-gray-100${wide ? ' col-span-2' : ''}`}>
    <span className="text-xs text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-800">{value}</span>
  </div>
);

export const ReportDetailsModal: React.FC<Props> = ({ report, onClose }) => {
  const { editReport, isLoading } = useReports();
  const { territories } = useTerritory();

  const [details, setDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);
  const [media, setMedia] = useState<ReportMedia[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [isCreateMissionModalOpen, setIsCreateMissionModalOpen] = useState<boolean>(false);

  // Chargement des détails 1:1 selon la catégorie
  useEffect(() => {
    if (report.issueCategory === IssueCategory.OTHER) {
      setDetails(null);
      return;
    }
    let cancelled = false;
    setLoadingDetails(true);
    reportsApi
      .getReportDetails(report.id)
      .then((d) => {
        if (!cancelled) setDetails(d);
      })
      .catch(() => {
        if (!cancelled) setDetails(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingDetails(false);
      });
    return () => {
      cancelled = true;
    };
  }, [report.id, report.issueCategory]);

  // Chargement des images du rapport
  useEffect(() => {
    let cancelled = false;
    reportsApi
      .getReportMedia(report.id)
      .then((m) => {
        if (!cancelled) setMedia(m);
      })
      .catch(() => {
        if (!cancelled) setMedia([]);
      });
    return () => {
      cancelled = true;
    };
  }, [report.id]);

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
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/30"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">

          {/* En-tête */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-start justify-between gap-4 shrink-0">
            <div className="flex-1 min-w-0">

              {/* Badges statut / priorité / risque */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {/* Statut avec point coloré */}
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${STATUS_COLORS[report.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[report.status]}`} />
                  {STATUS_LABELS[report.status]}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${PRIORITY_COLORS[report.priority]}`}>
                  {PRIORITY_LABELS[report.priority]}
                </span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${RISK_COLORS[report.riskLevel]}`}>
                  Risque {RISK_LABELS[report.riskLevel]}
                </span>
              </div>

              {/* Titre */}
              <h2 className="text-lg font-semibold text-gray-900 leading-tight truncate">{report.title}</h2>

              {/* Sous-titre : catégorie · territoire */}
              <p className="text-sm text-gray-500 mt-0.5">
                {CATEGORY_LABELS[report.issueCategory]}
                <span className="mx-1.5 text-gray-300">·</span>
                {report.territoryName || territoryName}
              </p>

              {/* Auteur */}
              {(report.createdByName || report.createdByRole) && (
                <p className="text-xs text-gray-400 mt-1.5">
                  Signalé par{' '}
                  <span className="font-medium text-gray-600">{report.createdByName || '—'}</span>
                  {report.createdByRole && (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
                      {report.createdByRole}
                    </span>
                  )}
                </p>
              )}

              {/* ID */}
              <p className="text-[10px] text-gray-300 mt-1.5 font-mono">{report.id}</p>
            </div>

            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100 shrink-0 -mt-0.5"
              aria-label="Fermer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Corps scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {/* Description */}
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1.5">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {report.description || <span className="text-gray-400 italic">Aucune description fournie.</span>}
              </p>
            </div>

            {/* Photos */}
            {media.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">
                  Photos <span className="text-gray-300">({media.length})</span>
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {media.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setLightbox(m.storagePath)}
                      className="block rounded-lg overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-benin-green"
                    >
                      <img
                        src={m.storagePath}
                        alt={m.fileName || 'Photo'}
                        loading="lazy"
                        className="w-full h-24 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Métadonnées */}
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2">Informations</p>
              <div className="grid grid-cols-2 gap-2">
                <MetaCell label="Déclaré le" value={new Date(report.reportedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                <MetaCell label="Délai SLA" value={`${report.slaHours} h`} />
                <MetaCell label="Priorité" value={PRIORITY_LABELS[report.priority] || report.priority} />
                <MetaCell label="Niveau de risque" value={RISK_LABELS[report.riskLevel] || report.riskLevel} />
                {report.createdByName && (
                  <MetaCell
                    label="Signalé par"
                    value={
                      <span className="flex items-center gap-1.5 flex-wrap">
                        {report.createdByName}
                        {report.createdByRole && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
                            {report.createdByRole}
                          </span>
                        )}
                      </span>
                    }
                  />
                )}
                {report.createdAt && (
                  <MetaCell label="Enregistré le" value={new Date(report.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                )}
                {report.latitude && report.longitude && (
                  <MetaCell
                    label="Coordonnées GPS"
                    wide
                    value={<span className="font-mono text-xs">{report.latitude}, {report.longitude}</span>}
                  />
                )}
              </div>
            </div>

            {/* Détails spécifiques à la catégorie */}
            {report.issueCategory !== IssueCategory.OTHER && (
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">Détails spécifiques</p>
                {loadingDetails ? (
                  <p className="text-sm text-gray-400 italic">Chargement des détails…</p>
                ) : details ? (
                  <div className="grid grid-cols-2 gap-2">
                    {report.issueCategory === IssueCategory.DRAINAGE && (
                      <>
                        {details.blockage_level_pct != null && (
                          <MetaCell label="Taux de colmatage" value={`${details.blockage_level_pct} %`} />
                        )}
                        {details.water_level_cm != null && (
                          <MetaCell label="Niveau d'eau" value={`${details.water_level_cm} cm`} />
                        )}
                        {details.flow_status != null && (
                          <MetaCell
                            label="État d'écoulement"
                            wide
                            value={FLOW_STATUS_LABELS[details.flow_status as WaterFlowStatus] ?? details.flow_status}
                          />
                        )}
                      </>
                    )}
                    {report.issueCategory === IssueCategory.ROAD && (
                      <>
                        {details.damage_surface_m2 != null && (
                          <MetaCell label="Surface endommagée" value={`${details.damage_surface_m2} m²`} />
                        )}
                        {details.pothole_depth_cm != null && (
                          <MetaCell label="Profondeur nid-de-poule" value={`${details.pothole_depth_cm} cm`} />
                        )}
                      </>
                    )}
                    {report.issueCategory === IssueCategory.WASTE && (
                      <>
                        {details.estimated_volume_m3 != null && (
                          <MetaCell label="Volume estimé" value={`${details.estimated_volume_m3} m³`} />
                        )}
                        {details.waste_type != null && (
                          <MetaCell label="Type de déchets" value={details.waste_type} />
                        )}
                      </>
                    )}
                    {report.issueCategory === IssueCategory.BIODIVERSITY && (
                      <>
                        {details.species_name != null && (
                          <MetaCell label="Espèce" value={details.species_name} />
                        )}
                        {details.observation_type != null && (
                          <MetaCell label="Type d'observation" value={details.observation_type} />
                        )}
                        {details.count != null && (
                          <MetaCell label="Nombre" value={details.count} />
                        )}
                      </>
                    )}
                    {report.issueCategory === IssueCategory.ENVIRONMENT && (
                      <>
                        {details.sensor_id != null && (
                          <MetaCell label="Capteur (ID)" value={<span className="font-mono text-xs break-all">{details.sensor_id}</span>} />
                        )}
                        {details.measured_value != null && (
                          <MetaCell label="Valeur mesurée" value={`${details.measured_value}${details.unit ? ' ' + details.unit : ''}`} />
                        )}
                        {details.unit != null && (
                          <MetaCell label="Unité" value={details.unit} />
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Aucun détail spécifique renseigné.</p>
                )}
              </div>
            )}

            {/* Changement de statut */}
            {transitions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 mb-2">Changer le statut</p>
                <div className="flex flex-wrap gap-2">
                  {transitions.map((nextStatus) => (
                    <button
                      key={nextStatus}
                      onClick={() => handleStatusChange(nextStatus)}
                      disabled={isLoading}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-medium border transition-opacity disabled:opacity-50 ${STATUS_COLORS[nextStatus]} border-current/10 hover:opacity-75`}
                    >
                      {STATUS_LABELS[nextStatus]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pied */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
            <button
              onClick={() => setIsCreateMissionModalOpen(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-benin-green hover:bg-benin-green-dark transition-colors shadow-sm"
            >
              Créer une mission
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

      {/* Lightbox photo */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Aperçu"
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Fermer l'aperçu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}
      {/* Modale de création de mission */}
      {isCreateMissionModalOpen && (
        <CreateMissionModal
          onClose={() => setIsCreateMissionModalOpen(false)}
          initialReportId={report.id}
          initialTerritoryId={report.territoryId}
          initialTerritoryName={report.territoryName || (territoryName !== '—' ? territoryName : 'Territoire lié au signalement')}
          initialTitle={`Mission: ${report.title}`}
          initialDescription={report.description || ''}
        />
      )}
    </>
  );
};
