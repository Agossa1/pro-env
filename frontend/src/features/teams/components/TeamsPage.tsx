import React, { useEffect, useState } from 'react';
import { useTeams } from '../hooks/useTeams';
import { TeamType } from '../services/teams.types';
import type { FieldTeam } from '../services/teams.types';
import { CreateTeamModal } from './CreateTeamModal';
import { TeamDetailsModal } from './TeamDetailsModal';

const TEAM_TYPE_LABELS: Record<TeamType, string> = {
  [TeamType.PROVIDER]: 'Prestataire',
  [TeamType.INSTITUTION]: 'Institution',
};

const TEAM_TYPE_COLORS: Record<TeamType, string> = {
  [TeamType.PROVIDER]: 'bg-blue-50 text-blue-700 border-blue-200',
  [TeamType.INSTITUTION]: 'bg-purple-50 text-purple-700 border-purple-200',
};

export const TeamsPage: React.FC = () => {
  const { teams, isLoading, load, pagination } = useTeams();

  const [selectedTeam, setSelectedTeam] = useState<FieldTeam | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    load({ page: currentPage, limit: 20, teamType: filterType || undefined });
  }, [load, currentPage, filterType]);

  const filteredTeams = teams.filter((t) => {
    const matchSearch =
      search === '' || t.name.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleCreateClose = () => {
    setIsCreateOpen(false);
    load({ page: currentPage, limit: 20, teamType: filterType || undefined });
  };

  const handleDetailsClose = () => {
    setSelectedTeam(null);
    load({ page: currentPage, limit: 20, teamType: filterType || undefined });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Équipes</h1>
          <p className="text-base text-gray-600">Équipes terrain — prestataires et institutions</p>
        </div>
        <button
          id="create-team-btn"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-benin-green hover:bg-benin-green-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle équipe
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          id="teams-search-input"
          placeholder="Rechercher par nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-xs pl-4 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green"
        />
        <select
          id="teams-type-filter"
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
          className="w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-benin-green/20"
        >
          <option value="">Tous les types</option>
          <option value={TeamType.PROVIDER}>Prestataires</option>
          <option value={TeamType.INSTITUTION}>Institutions</option>
        </select>
        <div className="sm:ml-auto text-base text-gray-700 self-center">
          {pagination.total} équipe{pagination.total > 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 font-semibold text-gray-700">Nom</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Type</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Statut</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Créée le</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>

            {isLoading && (
              <tbody>
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Chargement des équipes...</td></tr>
              </tbody>
            )}

            {!isLoading && filteredTeams.length === 0 && (
              <tbody>
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Aucune équipe trouvée.
                    <br />
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="mt-2 text-benin-green hover:underline text-sm"
                    >
                      Créer la première équipe →
                    </button>
                  </td>
                </tr>
              </tbody>
            )}

            {!isLoading && filteredTeams.length > 0 && (
              <tbody className="divide-y divide-gray-100">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-sm text-gray-900 truncate max-w-[200px]">{team.name}</p>

                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border ${TEAM_TYPE_COLORS[team.teamType] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                        {TEAM_TYPE_LABELS[team.teamType] || team.teamType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium border ${
                        team.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {team.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(team.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedTeam(team)}
                        className="text-benin-green hover:text-benin-green-dark font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity"
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {pagination.page} sur {pagination.totalPages} — {pagination.total} équipe{pagination.total > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isCreateOpen && <CreateTeamModal onClose={handleCreateClose} />}
      {selectedTeam && <TeamDetailsModal team={selectedTeam} onClose={handleDetailsClose} />}
    </div>
  );
};
