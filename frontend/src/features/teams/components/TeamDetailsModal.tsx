import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTeams } from '../hooks/useTeams';
import { useUsers } from '../../users/hooks/useUsers';
import { TeamMemberRole, TeamType } from '../services/teams.types';
import type { FieldTeam } from '../services/teams.types';
import { useSelector } from 'react-redux';
import { selectTeamMembers, selectTeamsLoading } from '../services/teams.selectors';

interface Props {
  team: FieldTeam;
  onClose: () => void;
}

const ROLE_LABELS: Record<TeamMemberRole, string> = {
  [TeamMemberRole.COMMAND_LEAD]: '👑 Chef de Mission',
  [TeamMemberRole.OPS_OPERATOR]: '👷 Opérateur Terrain',
  [TeamMemberRole.LOG_OFFICER]: '📦 Chargé de Logistique',
  [TeamMemberRole.SAFETY_OFFICER]: '🛡️ Référent Sécurité / HSE',
};

const ROLE_COLORS: Record<TeamMemberRole, string> = {
  [TeamMemberRole.COMMAND_LEAD]: 'bg-blue-50 text-blue-700 border-blue-200',
  [TeamMemberRole.OPS_OPERATOR]: 'bg-green-50 text-green-700 border-green-200',
  [TeamMemberRole.LOG_OFFICER]: 'bg-orange-50 text-orange-700 border-orange-200',
  [TeamMemberRole.SAFETY_OFFICER]: 'bg-red-50 text-red-700 border-red-200',
};

const TEAM_TYPE_LABELS: Record<TeamType, string> = {
  [TeamType.PROVIDER]: 'Prestataire',
  [TeamType.INSTITUTION]: 'Institution',
};

export const TeamDetailsModal: React.FC<Props> = ({ team, onClose }) => {
  const { loadMembers, addMember, removeMember, update } = useTeams();
  const { users, reload: loadUsers } = useUsers();
  const members = useSelector(selectTeamMembers);
  const isLoading = useSelector(selectTeamsLoading);

  const [activeTab, setActiveTab] = useState<'info' | 'members'>('info');

  // Add member form state
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<TeamMemberRole>(TeamMemberRole.OPS_OPERATOR);
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    loadMembers(team.id);
    loadUsers(1, 1000); // Load up to 1000 users for the dropdown
  }, [team.id, loadMembers, loadUsers]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) {
      toast.error("Le nom et l'email sont requis.");
      return;
    }
    setIsAddingMember(true);
    try {
      // Le backend crée l'utilisateur (rôle technicien) puis l'ajoute à l'équipe
      await addMember(team.id, {
        fullName: newFullName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim() || undefined,
        roleInTeam: newRole,
        organizationId: team.organizationId || null,
      }).unwrap();
      
      toast.success('Membre ajouté avec succès.');
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setNewRole(TeamMemberRole.OPS_OPERATOR);
      
      // Refresh the users list so the newly created user is in the local cache
      loadUsers(1, 1000);
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'ajout du membre.");
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Retirer ce membre de l\'équipe ?')) return;
    try {
      await removeMember(team.id, memberId).unwrap();
      toast.success('Membre retiré.');
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la suppression du membre.');
    }
  };

  const handleToggleActive = async () => {
    try {
      await update(team.id, { isActive: !team.isActive }).unwrap();
      toast.success(team.isActive ? 'Équipe désactivée.' : 'Équipe activée.');
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la mise à jour.');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-benin-green-light flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-benin-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{team.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                  team.teamType === TeamType.PROVIDER
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}>
                  {TEAM_TYPE_LABELS[team.teamType]}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                  team.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}>
                  {team.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-100 flex gap-1 shrink-0 bg-gray-50">
          {[
            { key: 'info', label: 'Informations' },
            { key: 'members', label: `Membres (${members.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'info' | 'members')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                activeTab === key
                  ? 'border-benin-green text-benin-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6">
          {activeTab === 'info' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Type d'équipe</p>
                  <p className="text-sm font-semibold text-gray-700">{TEAM_TYPE_LABELS[team.teamType]}</p>
                </div>
                {team.organizationId && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Société rattachée</p>
                    <p className="text-sm font-semibold text-gray-700">Identifiant: {team.organizationId.substring(0, 8)}...</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Créée le</p>
                  <p className="text-sm text-gray-700">{new Date(team.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Activer/Désactiver */}
              <div className={`rounded-xl border p-4 flex items-center justify-between ${
                team.isActive ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{team.isActive ? 'Équipe active' : 'Équipe inactive'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {team.isActive ? 'L\'équipe peut être assignée à des missions.' : 'L\'équipe ne peut pas être assignée.'}
                  </p>
                </div>
                <button
                  onClick={handleToggleActive}
                  className={`px-4 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    team.isActive
                      ? 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      : 'bg-benin-green text-white border-benin-green hover:bg-benin-green-dark'
                  }`}
                >
                  {team.isActive ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-5">
              {/* Add member form */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-3">Ajouter un membre</p>
                <form onSubmit={handleAddMember} className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Nom complet"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="px-3 py-2 text-sm rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green"
                    />
                    <input
                      type="email"
                      placeholder="Adresse email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="px-3 py-2 text-sm rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green"
                    />
                    <input
                      type="text"
                      placeholder="Numéro de téléphone (optionnel)"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="px-3 py-2 text-sm rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green"
                    />
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as TeamMemberRole)}
                      className="px-3 py-2 text-sm rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green"
                    >
                      <option value={TeamMemberRole.OPS_OPERATOR}>Opérateur Terrain</option>
                      <option value={TeamMemberRole.COMMAND_LEAD}>Chef de Mission</option>
                      <option value={TeamMemberRole.LOG_OFFICER}>Chargé de Logistique</option>
                      <option value={TeamMemberRole.SAFETY_OFFICER}>Référent Sécurité / HSE</option>
                    </select>
                  </div>
                  <div className="flex justify-end mt-1">
                  <button
                    type="submit"
                    disabled={isAddingMember}
                    className="px-4 py-2 text-sm font-medium text-white bg-benin-green rounded-lg hover:bg-benin-green-dark disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    {isAddingMember ? 'Ajout...' : 'Ajouter'}
                  </button>
                  </div>
                </form>
              </div>

              {/* Members list */}
              {isLoading ? (
                <div className="py-8 text-center text-sm text-gray-500">Chargement des membres...</div>
              ) : members.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  <svg className="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Aucun membre dans cette équipe.
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => {
                    const user = users.find(u => u.id === member.userId);
                    return (
                    <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors group gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {user ? user.fullName : member.userId}
                          </p>
                          {user && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {user.email} {user.phone ? `• ${user.phone}` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${ROLE_COLORS[member.roleInTeam]}`}>
                          {ROLE_LABELS[member.roleInTeam]}
                        </span>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Retirer le membre"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )})}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
