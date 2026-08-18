import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useRoles } from '../../roles/hooks/useRoles';
import { apiClient } from '../../../libs/api-client';
import type { RegisterDto } from '../services/auth.types';

/** Structure minimale d'un territoire renvoyé par GET /api/territories */
interface TerritoryOption {
  id: string;
  name: string;
  code: string;
  territoryTypeId: string;
  parentTerritoryId: string | null;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const { createUser, isMutating, clearError } = useAdminUsers();
  const { roles, reload: reloadRoles, status: rolesStatus } = useRoles();

  const [fullName, setFullName]             = useState('');
  const [email, setEmail]                   = useState('');
  const [phone, setPhone]                   = useState('');
  const [roleCode, setRoleCode]             = useState('');
  const [departments, setDepartments]       = useState<TerritoryOption[]>([]);
  const [communes, setCommunes]             = useState<TerritoryOption[]>([]);
  const [departmentId, setDepartmentId]     = useState('');
  const [communeId, setCommuneId]           = useState('');
  const [deptTypeId, setDeptTypeId]         = useState('');
  const [isLoadingTerritories, setIsLoadingTerritories] = useState(false);

  // Charge les rôles à l'ouverture si pas encore fait
  useEffect(() => {
    if (isOpen && rolesStatus === 'idle') reloadRoles();
  }, [isOpen, rolesStatus, reloadRoles]);

  // Réinitialisation du formulaire quand on ferme le modal
  useEffect(() => {
    if (!isOpen) {
      setFullName('');
      setEmail('');
      setPhone('');
      setRoleCode('');
      setDepartmentId('');
      setCommuneId('');
      clearError();
    }
  }, [isOpen, clearError]);

  // ── Chargement hiérarchique des territoires ─────────────────────────────────

  const fetchByTypeId = useCallback(async (territoryTypeId: string): Promise<TerritoryOption[]> => {
    const res = await apiClient.get<{ data: TerritoryOption[] }>('/territories', {
      params: { territoryTypeId, limit: 200 },
    });
    return res.data ?? [];
  }, []);

  const fetchByParentId = useCallback(async (parentTerritoryId: string): Promise<TerritoryOption[]> => {
    const res = await apiClient.get<{ data: TerritoryOption[] }>('/territories', {
      params: { parentTerritoryId, limit: 200 },
    });
    return res.data ?? [];
  }, []);

  // Résolution des types de territoires (DEPARTMENT, COMMUNE) au montage
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiClient.get<{ data: Array<{ id: string; code: string }> }>('/territories/types', {
          params: { limit: 100 },
        });
        if (!active) return;
        const types = res.data ?? [];
        setDeptTypeId(types.find((t) => t.code === 'DEPARTMENT')?.id ?? '');
      } catch {
        // silencieux
      }
    })();
    return () => { active = false; };
  }, []);

  // Chargement des départements une fois le typeId résolu
  useEffect(() => {
    if (!deptTypeId || !isOpen) return;
    let active = true;
    setIsLoadingTerritories(true);
    fetchByTypeId(deptTypeId)
      .then((list) => { if (active) setDepartments(list); })
      .catch(() => { if (active) setDepartments([]); })
      .finally(() => { if (active) setIsLoadingTerritories(false); });
    return () => { active = false; };
  }, [deptTypeId, fetchByTypeId, isOpen]);

  // Chargement des communes quand on change de département
  useEffect(() => {
    setCommuneId('');
    if (!departmentId || !isOpen) {
      setCommunes([]);
      return;
    }
    let active = true;
    setIsLoadingTerritories(true);
    fetchByParentId(departmentId)
      .then((list) => { if (active) setCommunes(list); })
      .catch(() => { if (active) setCommunes([]); })
      .finally(() => { if (active) setIsLoadingTerritories(false); });
    return () => { active = false; };
  }, [departmentId, fetchByParentId, isOpen]);

  // ── Rôle sélectionné ────────────────────────────────────────────────────────

  const selectedRole = roles.find((r) => r.code === roleCode) ?? null;

  // Règles de rattachement territorial basées sur le rôle
  const isPrefecture   = roleCode === 'prefecture';
  const isMairie       = roleCode === 'admin_mairie';
  const needsDepartment = isPrefecture || isMairie;
  const needsCommune    = isMairie;

  // Reset territoire si le rôle change
  useEffect(() => {
    if (!needsDepartment) {
      setDepartmentId('');
      setCommuneId('');
    }
  }, [needsDepartment]);

  // ── Soumission ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validation territoire obligatoire
    if (isPrefecture && !departmentId) {
      toast.error('Veuillez sélectionner le département de rattachement.');
      return;
    }
    if (isMairie && !communeId) {
      toast.error('Veuillez sélectionner la commune de rattachement.');
      return;
    }

    const territoryId = isMairie
      ? (communeId || departmentId || undefined)
      : isPrefecture
        ? (departmentId || undefined)
        : undefined;

    const dto: RegisterDto = {
      fullName,
      email,
      phone: phone || undefined,
      roleCode,
      territoryId,
    };

    try {
      await createUser(dto);
      toast.success(`Compte créé avec succès. Un code d'activation a été envoyé à ${email}.`);
      setFullName('');
      setEmail('');
      setPhone('');
      setRoleCode('');
      setDepartmentId('');
      setCommuneId('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14" strokeLinecap="round"/>
                <line x1="22" y1="11" x2="16" y2="11" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Nouvel utilisateur</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto">


          <form id="create-user-modal-form" onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* Informations personnelles */}
            <div>
              <p className="text-sm font-normal text-gray-700 mb-4">
                Informations personnelles
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="reg-fullname" className="block text-md font-normal text-gray-700 mb-1.5">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Jean DOHOU"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="reg-email" className="block text-lg font-normal text-gray-700 mb-1.5">
                    Adresse email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@benin.gouv.bj"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="reg-phone" className="block text-lg font-normal text-gray-700 mb-1.5">
                    Téléphone
                  </label>
                  <input
                    id="reg-phone"
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
              <p className="text-sm font-normal text-gray-700 mb-4">
                Rôle &amp; Permissions
              </p>
              <div>
                <label htmlFor="reg-role" className="block text-lg font-normal text-gray-700 mb-1.5">
                  Rôle attribué <span className="text-red-500">*</span>
                </label>
                <select
                  id="reg-role"
                  required
                  value={roleCode}
                  onChange={(e) => setRoleCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
                >
                  <option value="">-- Sélectionner un rôle --</option>
                  {roles
                    .filter((r) => r.code !== 'citoyen')
                    .map((r) => (
                      <option key={r.id} value={r.code}>{r.name}</option>
                    ))}
                </select>
                {selectedRole && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedRole.tier === 'platform' ? 'bg-purple-100 text-purple-700'
                      : selectedRole.tier === 'territorial' ? 'bg-benin-green-light text-benin-green'
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

            {/* Territoire */}
            {needsDepartment && (
              <>
                <div className="border-t border-gray-100" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-4">
                    Rattachement territorial
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="reg-department" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Département {isPrefecture ? <span className="text-red-500">*</span> : ''}
                      </label>
                      <select
                        id="reg-department"
                        required={isPrefecture}
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        disabled={isLoadingTerritories}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors disabled:opacity-60"
                      >
                        <option value="">
                          {isLoadingTerritories ? 'Chargement...'
                           : departments.length === 0 ? 'Aucun département disponible'
                           : '-- Sélectionner un département --'}
                        </option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    {needsCommune && (
                      <div>
                        <label htmlFor="reg-commune" className="block text-sm font-medium text-gray-700 mb-1.5">
                          Commune <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="reg-commune"
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
                </div>
              </>
            )}

          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="create-user-modal-form"
                disabled={isMutating || isLoadingTerritories}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-60 shadow-sm"
              >
                {isMutating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Création...
                  </>
                ) : (
                  'Créer le compte'
                )}
              </button>
            </>
        </div>

      </div>
    </div>
  );
}
