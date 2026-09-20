import React, { useEffect, useState } from 'react';
import { useMissions } from '../hooks/useMissions';
import { MissionType, MissionStatus, PriorityLevel } from '../services/missions.types';
import { MissionDetailsModal } from './MissionDetailsModal';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserRoleCode } from '../../auth/services/auth.types';

// Icons
const GridIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>;
const ListIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>;

export const TYPE_LABELS: Record<MissionType, string> = {
  [MissionType.REPAIR]: 'Réparation',
  [MissionType.MAINTENANCE]: 'Maintenance',
  [MissionType.INSPECTION]: 'Inspection',
  [MissionType.CLEANING]: 'Nettoyage',
  [MissionType.CONSTRUCTION]: 'Construction',
  [MissionType.OTHER]: 'Autre',
};

export const STATUS_LABELS: Record<MissionStatus, string> = {
  [MissionStatus.DRAFT]: 'Brouillon',
  [MissionStatus.PLANNED]: 'Planifiée',
  [MissionStatus.ASSIGNED]: 'Assignée',
  [MissionStatus.ACCEPTED]: 'Acceptée',
  [MissionStatus.REJECTED]: 'Rejetée',
  [MissionStatus.IN_PROGRESS]: 'En cours',
  [MissionStatus.SUSPENDED]: 'Suspendue',
  [MissionStatus.COMPLETED]: 'Terminée',
  [MissionStatus.CANCELLED]: 'Annulée',
  [MissionStatus.CLOSED]: 'Clôturée',
};

export const STATUS_DOT: Record<MissionStatus, string> = {
  [MissionStatus.DRAFT]: 'bg-gray-400',
  [MissionStatus.PLANNED]: 'bg-indigo-400',
  [MissionStatus.ASSIGNED]: 'bg-benin-green',
  [MissionStatus.ACCEPTED]: 'bg-emerald-400',
  [MissionStatus.REJECTED]: 'bg-red-400',
  [MissionStatus.IN_PROGRESS]: 'bg-orange-400',
  [MissionStatus.SUSPENDED]: 'bg-amber-400',
  [MissionStatus.COMPLETED]: 'bg-green-400',
  [MissionStatus.CANCELLED]: 'bg-gray-400',
  [MissionStatus.CLOSED]: 'bg-slate-400',
};

export const STATUS_COLORS: Record<MissionStatus, string> = {
  [MissionStatus.DRAFT]: 'bg-gray-100 text-gray-700 border-gray-200',
  [MissionStatus.PLANNED]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  [MissionStatus.ASSIGNED]: 'bg-benin-green-light text-benin-green border-benin-green/30',
  [MissionStatus.ACCEPTED]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [MissionStatus.REJECTED]: 'bg-red-50 text-red-700 border-red-200',
  [MissionStatus.IN_PROGRESS]: 'bg-orange-50 text-orange-700 border-orange-200',
  [MissionStatus.SUSPENDED]: 'bg-amber-50 text-amber-700 border-amber-200',
  [MissionStatus.COMPLETED]: 'bg-green-50 text-green-700 border-green-200',
  [MissionStatus.CANCELLED]: 'bg-gray-50 text-gray-500 border-gray-200',
  [MissionStatus.CLOSED]: 'bg-slate-50 text-slate-700 border-slate-200',
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: 'Basse',
  [PriorityLevel.MEDIUM]: 'Moyenne',
  [PriorityLevel.HIGH]: 'Haute',
  [PriorityLevel.URGENT]: 'Urgente',
  [PriorityLevel.CRITICAL]: 'Critique',
};

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  [PriorityLevel.LOW]: 'bg-gray-100 text-gray-700 border-gray-200',
  [PriorityLevel.MEDIUM]: 'bg-benin-green-light text-benin-green border-benin-green/30',
  [PriorityLevel.HIGH]: 'bg-orange-100 text-orange-700 border-orange-200',
  [PriorityLevel.URGENT]: 'bg-red-100 text-red-700 border-red-200',
  [PriorityLevel.CRITICAL]: 'bg-rose-100 text-rose-800 border-rose-200',
};

export const MissionsPage: React.FC = () => {
  const { missions, isLoading, error, load } = useMissions();
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const selectedMission = missions.find(m => m.id === selectedMissionId) || null;

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const filters: Record<string, any> = {};
    if (user) {
      if (user.role?.code === UserRoleCode.admin_mairie && user.municipalityId) {
        filters.municipalityId = user.municipalityId;
      } else if (user.role?.code === UserRoleCode.prefecture && user.regionId) {
        filters.regionId = user.regionId;
      } else if (user.role?.code === UserRoleCode.technicien) {
        filters.assignedTo = user.id; // Or team id
      }
    }
    load(filters);
  }, [load, user]);

  const filteredMissions = missions.filter((m) => {
    const matchStatus = filterStatus === '' || m.status === filterStatus;
    const matchType = filterType === '' || m.missionType === filterType;
    const matchSearch = search === '' || m.title.toLowerCase().includes(search.toLowerCase()) || (m.description && m.description.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Missions</h1>
          <p className="text-sm text-gray-500">Gérez les missions d'intervention sur le territoire.</p>
        </div>
      </div>

      {/* Toolbar: Filters & View */}
      <div className="bg-white p-4 rounded-xl border border-gray-200  flex flex-col lg:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <input
            type="text"
            placeholder="Rechercher par titre ou description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:max-w-xs pl-4 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green"
          />
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

      {/* Data Render */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 font-semibold text-gray-700">Titre</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Priorité</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Territoire</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Statut</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Date Prévue</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                </tr>
              </thead>
              
              {isLoading && (
                <tbody className="divide-y divide-gray-100">
                  <tr key="loading">
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Chargement des missions...</td>
                  </tr>
                </tbody>
              )}

              {!isLoading && filteredMissions.length === 0 && (
                <tbody className="divide-y divide-gray-100">
                  <tr key="empty">
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Aucune mission trouvée.</td>
                  </tr>
                </tbody>
              )}

              {!isLoading && filteredMissions.length > 0 && (
                <tbody className="divide-y divide-gray-100">
                  {filteredMissions.map((mission) => (
                    <tr key={mission.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 truncate max-w-[200px]" title={mission.title}>{mission.title}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{mission.id}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{TYPE_LABELS[mission.missionType] || mission.missionType}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${PRIORITY_COLORS[mission.priorityLevel] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                          {PRIORITY_LABELS[mission.priorityLevel] || mission.priorityLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {mission.territoryName || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[mission.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          {STATUS_LABELS[mission.status] || mission.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {mission.scheduledAt ? new Date(mission.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedMissionId(mission.id)}
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
          ) : filteredMissions.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm text-gray-500">Aucune mission trouvée.</div>
          ) : (
            filteredMissions.map((mission) => (
              <div key={mission.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer" onClick={() => setSelectedMissionId(mission.id)}>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-benin-green-light text-benin-green">
                    {TYPE_LABELS[mission.missionType] || mission.missionType}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[mission.status] || 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                    {STATUS_LABELS[mission.status] || mission.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${PRIORITY_COLORS[mission.priorityLevel] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    Priorité : {PRIORITY_LABELS[mission.priorityLevel] || mission.priorityLevel}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">{mission.title}</h3>
                <p className="text-sm text-gray-500 flex-1 line-clamp-3 mb-4">{mission.description || 'Aucune description fournie.'}</p>
                <div className="pt-4 border-t border-gray-100 space-y-1.5 mt-auto">
                  <p className="text-xs text-gray-500 truncate" title={mission.territoryName || 'Territoire inconnu'}>
                    {mission.territoryName || '—'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {mission.scheduledAt ? new Date(mission.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Non planifiée'}
                    </span>
                    <button 
                      onClick={() => setSelectedMissionId(mission.id)}
                      className="text-benin-green hover:text-benin-green-dark font-medium text-xs"
                    >
                      Voir plus &rarr;
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedMission && (
        <MissionDetailsModal 
          mission={selectedMission} 
          onClose={() => setSelectedMissionId(null)} 
        />
      )}
    </div>
  );
};
