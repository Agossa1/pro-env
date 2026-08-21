import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/headers';
import { Button } from '../../../components/boutons';
import { Input, Textarea, Select, Checkbox, FormField } from '../../../components/forms';
import { useRoles } from '../hooks/useRoles';
import { RoleTier, type UpdateRoleDto } from '../services/roles.types';
import { usePermissions } from '../../permissions/hooks/usePermissions';
import { ACTION_COLORS } from '../../permissions/services/permissions.types';

function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadById, selected: role, status, update, isMutating } = useRoles();

  const [formData, setFormData] = useState<UpdateRoleDto>({});
  const [isEditing, setIsEditing] = useState(false);

  const { 
    permissionsByModule, 
    rolePermissions, 
    loadRolePermissions, 
    assignToRole, 
    removeFromRole,
    isMutating: isMutatingPermissions 
  } = usePermissions();

  useEffect(() => {
    if (id) {
      loadById(id);
      loadRolePermissions(id);
    }
  }, [id, loadById, loadRolePermissions]);

  useEffect(() => {
    if (role && status === 'succeeded') {
      setFormData({
        name: role.name,
        description: role.description,
        tier: role.tier,
        canManageUsers: role.canManageUsers,
        canManageRoles: role.canManageRoles,
      });
    }
  }, [role, status]);

  if (status === 'loading') {
    return <div className="p-8 text-gray-500">Chargement...</div>;
  }

  if (status === 'failed' || !role) {
    return <div className="p-8 text-benin-red">Rôle introuvable.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await update(id, formData);
      setIsEditing(false);
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la modification');
    }
  };

  const togglePermission = async (permissionId: string, checked: boolean) => {
    if (!id) return;
    try {
      if (checked) {
        await assignToRole(id, [permissionId]);
      } else {
        await removeFromRole(id, permissionId);
      }
      // Recharger pour rafraîchir la vue
      loadRolePermissions(id);
    } catch (e: any) {
      alert(e.message || 'Erreur lors de la modification des permissions');
    }
  };

  return (
    <div>
      <PageHeader
        title={`Rôle : ${role.name}`}
        subtitle={`Code interne : ${role.code}`}
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate('/roles')}
          >
            Retour
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-300 rounded-sm  ">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Informations générales</h2>
              {!isEditing && (
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  Modifier
                </Button>
              )}
            </div>

            <div className="p-6">
              {isEditing ? (
                <form id="edit-role-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Nom d'affichage" required>
                      <Input
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        required
                      />
                    </FormField>

                    <FormField label="Niveau (Tier)">
                      <Select
                        name="tier"
                        value={formData.tier || ''}
                        onChange={handleChange}
                      >
                        <option value="">-- Aucun --</option>
                        <option value={RoleTier.PLATFORM}>Plateforme</option>
                        <option value={RoleTier.TERRITORIAL}>Territorial</option>
                        <option value={RoleTier.FIELD}>Terrain</option>
                      </Select>
                    </FormField>
                  </div>

                  <FormField label="Description">
                    <Textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      rows={3}
                    />
                  </FormField>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Privilèges globaux</h3>
                    <div className="space-y-3">
                      <label className="flex items-start gap-3">
                        <Checkbox
                          name="canManageUsers"
                          checked={formData.canManageUsers}
                          onChange={handleChange}
                        />
                        <div>
                          <div className="text-lg font-medium text-gray-900">Gérer les utilisateurs</div>
                          <div className="text-lg text-gray-500">Permet d'ajouter, modifier ou supprimer des utilisateurs.</div>
                        </div>
                      </label>

                      <label className="flex items-start gap-3">
                        <Checkbox
                          name="canManageRoles"
                          checked={formData.canManageRoles}
                          onChange={handleChange}
                        />
                        <div>
                          <div className="text-lg font-medium text-gray-900">Gérer les rôles et permissions</div>
                          <div className="text-lg text-gray-500">Permet de créer des rôles et d'attribuer des permissions.</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: role.name,
                        description: role.description,
                        tier: role.tier,
                        canManageUsers: role.canManageUsers,
                        canManageRoles: role.canManageRoles,
                      });
                    }}>
                      Annuler
                    </Button>
                    <Button type="submit" variant="primary" disabled={isMutating}>
                      {isMutating ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-lg font-medium text-gray-500 mb-1">Nom d'affichage</div>
                      <div className="text-base text-gray-900">{role.name}</div>
                    </div>
                    <div>
                      <div className="text-lg font-medium text-gray-500 mb-1">Niveau (Tier)</div>
                      <div className="text-base text-gray-900">{role.tier || '—'}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-lg font-medium text-gray-500 mb-1">Description</div>
                    <div className="text-base text-gray-900">{role.description || 'Aucune description'}</div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-500 mb-3">Privilèges globaux</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full size-16 ${role.canManageUsers ? 'bg-benin-green' : 'bg-gray-300'}`} />
                        <span className="text-base text-gray-700">Gestion des utilisateurs {role.canManageUsers ? '(Oui)' : '(Non)'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${role.canManageRoles ? 'bg-benin-green' : 'bg-gray-300'}`} />
                        <span className="text-base text-gray-700">Gestion des rôles {role.canManageRoles ? '(Oui)' : '(Non)'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-300 rounded-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">Permissions détaillées</h2>
            </div>
            <div className="p-0">
              {Object.entries(permissionsByModule).length === 0 ? (
                <div className="p-6 text-lg text-gray-500">Chargement des permissions...</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {Object.entries(permissionsByModule).map(([module, perms]) => (
                    <div key={module} className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 bg-gray-100 inline-block px-2 py-1 rounded">
                        {module}
                      </h3>
                      <div className="space-y-3 pl-2">
                        {perms.map(perm => {
                          const isChecked = rolePermissions.includes(perm.id);
                          const actionColor = ACTION_COLORS[perm.action] || 'bg-gray-100 text-gray-600';
                          return (
                            <label key={perm.id} className={`flex items-start gap-3 p-2 rounded-md transition-colors ${isChecked ? 'bg-benin-green/5' : 'hover:bg-gray-50'} ${isMutatingPermissions ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
                              <Checkbox 
                                checked={isChecked} 
                                onChange={(e) => togglePermission(perm.id, e.target.checked)}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-[16px]  px-1.5 py-0.5 rounded ${actionColor}`}>
                                    {perm.action}
                                  </span>
                                  <span className="text-lg font-medium text-gray-900">
                                    {perm.description || `${perm.action} sur ${perm.module}`}
                                  </span>
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoleDetailPage;
