import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useUsers } from '../../users/hooks/useUsers';
import { useRoles } from '../../roles/hooks/useRoles';
import { apiClient } from '../../../libs/api-client';
import type { AppUser } from '../../users/services/users.types';

interface TerritoryOption {
  id: string;
  name: string;
  code: string;
  territoryTypeId: string;
  parentTerritoryId: string | null;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AppUser | null;
}

export function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const { update, isMutating, reload } = useUsers();
  const { roles, reload: reloadRoles, status: rolesStatus } = useRoles();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [departments, setDepartments] = useState<TerritoryOption[]>([]);
  const [communes, setCommunes] = useState<TerritoryOption[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [communeId, setCommuneId] = useState('');
  const [isLoadingTerritories, setIsLoadingTerritories] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charge les rôles à l'ouverture
  useEffect(() => {
    if (isOpen && rolesStatus === 'idle') reloadRoles();
  }, [isOpen, rolesStatus, reloadRoles]);

  // Pré-remplissage du formulaire avec les données de l'utilisateur sélectionné
  useEffect(() => {
    if (isOpen && user) {
      setFullName(user.fullName ?? '');
      setPhone(user.phone ?? '');
      setRoleId(user.roleId ?? '');
      setDepartmentId(user.regionId ?? '');
      setCommuneId(user.municipalityId ?? '');
      setCommunes([]);
      setError(null);
    }
  }, [isOpen, user]);

  // Chargement des départements (niveau 1 du découpage administratif du Bénin)
  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingTerritories(true);
    apiClient.get<any>('/territories', {
      params: { territoryTypeCode: 'DEPARTMENT', limit: 200 },
    })
      .then((res) => {
        const list: TerritoryOption[] = Array.isArray(res.data) ? res.data : [];
        setDepartments(list);
      })
      .catch(() => setDepartments([]))
      .finally(() => setIsLoadingTerritories(false));
  }, [isOpen]);

  // Chargement des communes quand un département est sélectionné
  useEffect(() => {
    if (!departmentId) { setCommunes([]); setCommuneId(''); return; }
    setIsLoadingTerritories(true);
    apiClient.get<any>('/territories', {
      params: { parentTerritoryId: departmentId, limit: 200 },
    })
      .then((res) => {
        const all: TerritoryOption[] = Array.isArray(res.data) ? res.data : [];
        setCommunes(all);
      })
      .catch(() => setCommunes([]))
      .finally(() => setIsLoadingTerritories(false));
  }, [departmentId]);

  const selectedRole = roles.find((r) => r.id === roleId);
  const isPrefecture  = selectedRole?.code === 'prefecture';
  const isAdminMairie = selectedRole?.code === 'admin_mairie';
  const isDst = selectedRole?.code === 'dst';
  const isTechnicien = selectedRole?.code === 'technicien';
  const isSociete = selectedRole?.code === 'societe';

  const needsDepartment = isPrefecture || isAdminMairie || isDst || isTechnicien || isSociete;
  const needsCommune = isAdminMairie || isDst || isTechnicien || isSociete;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) return;

    // Validation territoire pour rôles territoriaux
    if (needsDepartment && !departmentId) {
      setError('Un département est obligatoire pour ce rôle.');
      return;
    }
    if (needsCommune && !communeId) {
      setError('Une commune est obligatoire pour ce rôle.');
      return;
    }

    try {
      await update({
        id: user.id,
        fullName: fullName !== user.fullName ? fullName : undefined,
        phone: phone !== (user.phone ?? '') ? phone : undefined,
        roleId: roleId !== user.roleId ? roleId : undefined,
        regionId: needsDepartment && departmentId ? departmentId : undefined,
        municipalityId: needsCommune && communeId ? communeId : undefined,
      });
      toast.success('Utilisateur mis à jour avec succès.');
      reload();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? 'Une erreur est survenue.');
      toast.error(err?.message ?? 'Erreur lors de la mise à jour.');
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Modifier l'utilisateur</h2>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Nom & Téléphone */}
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Informations personnelles</p>
              <div className="space-y-3">
                <div>
                  <label htmlFor="edit-fullname" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="edit-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Téléphone
                  </label>
                  <input
                    id="edit-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+229 00 00 00 00"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Rôle */}
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Rôle & Permissions</p>
              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Rôle attribué <span className="text-red-500">*</span>
                </label>
                <select
                  id="edit-role"
                  required
                  value={roleId}
                  onChange={(e) => { setRoleId(e.target.value); setDepartmentId(''); setCommuneId(''); }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
                >
                  <option value="">-- Sélectionner un rôle --</option>
                  {roles
                    .filter((r) => r.code !== 'citoyen')
                    .map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
                {selectedRole && (
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedRole.tier === 'platform' ? 'bg-purple-100 text-purple-700'
                      : selectedRole.tier === 'territorial' ? 'bg-emerald-100 text-emerald-700'
                      : selectedRole.tier === 'field' ? 'bg-orange-100 text-orange-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                      {selectedRole.tier === 'platform' ? 'Plateforme nationale'
                       : selectedRole.tier === 'territorial' ? 'Administration territoriale'
                       : selectedRole.tier === 'field' ? 'Agent terrain'
                       : 'Sans restriction géographique'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Territoire (si rôle territorial) */}
            {needsDepartment && (
              <>
                <div className="border-t border-gray-100" />
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                    Rattachement territorial <span className="text-red-500">*</span>
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="edit-dept" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Département {isPrefecture ? <span className="text-red-500">*</span> : ''}
                      </label>
                      <select
                        id="edit-dept"
                        required={isPrefecture}
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        disabled={isLoadingTerritories}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-60"
                      >
                        <option value="">
                          {isLoadingTerritories ? 'Chargement...'
                           : departments.length === 0 ? 'Aucun département'
                           : '-- Sélectionner un département --'}
                        </option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {needsCommune && (
                      <div>
                        <label htmlFor="edit-commune" className="block text-sm font-medium text-gray-700 mb-1.5">
                          Commune <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="edit-commune"
                          required
                          value={communeId}
                          onChange={(e) => setCommuneId(e.target.value)}
                          disabled={isLoadingTerritories || !departmentId}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-60"
                        >
                          <option value="">
                            {isLoadingTerritories ? 'Chargement...'
                             : !departmentId ? "Sélectionnez d'abord un département"
                             : communes.length === 0 ? 'Aucune commune disponible'
                             : '-- Sélectionner une commune --'}
                          </option>
                          {communes.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Territoire actuel si déjà défini */}
                  {user.territoryName && !departmentId && (
                    <p className="mt-2 text-xs text-gray-500">
                      Territoire actuel : <span className="font-medium text-gray-700">{user.territoryName}</span>
                      {' '}— laissez vide pour ne pas le modifier.
                    </p>
                  )}
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="edit-user-form"
            disabled={isMutating || isLoadingTerritories}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
          >
            {isMutating ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Enregistrement...
              </>
            ) : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditUserModal;
