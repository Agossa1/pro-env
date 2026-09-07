import { useEffect, useState } from 'react';
import { PageHeader } from '../../../../components/headers';
import { Button, IconButton } from '../../../../components/boutons';
import { useUsers } from '../../../users/hooks/useUsers';
import { useAuth } from '../../hooks/useAuth';
import { CreateUserModal } from '../CreateUserModal';

const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function UsersPage() {
  const { users, status, reload, toggleActive } = useUsers();
  const { user } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Le rôle "admin_mairie" (maire) n'a pas le droit de créer des utilisateurs
  const canCreateUser = user?.role?.code !== 'admin_mairie';

  useEffect(() => {
    reload();
  }, [reload]);

  const isLoading = status === 'loading';

  return (
    <div>
      <PageHeader
        title="Gestion des Utilisateurs"
        subtitle="Consultez et gérez les comptes utilisateurs de la plateforme"
        actions={
          canCreateUser ? (
            <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => setIsCreateModalOpen(true)}>
              Nouvel Utilisateur
            </Button>
          ) : undefined
        }
      />

      <div className="bg-white border border-gray-200 rounded  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-xl  text-gray-700">
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Rôle</th>
                <th className="px-6 py-4">Territoire</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            {isLoading && (
              <tbody className="divide-y divide-gray-100">
                <tr key="loading">
                  <td colSpan={5} className="px-6 py-8 text-center text-lg text-gray-700">
                    Chargement des utilisateurs...
                  </td>
                </tr>
              </tbody>
            )}

            {!isLoading && users.length === 0 && (
              <tbody className="divide-y divide-gray-100">
                <tr key="empty">
                  <td colSpan={5} className="px-6 py-8 text-center text-lg text-gray-700">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              </tbody>
            )}

            {!isLoading && users.length > 0 && (
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-benin-green-light/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-benin-green-light flex items-center justify-center text-benin-green font-bold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-900">{user.fullName}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phone && <div className="text-sm text-gray-400">{user.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md border text-sm font-medium bg-gray-50 text-gray-700 border-gray-200">
                        {user.roleName || user.roleCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.territoryName || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {user.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-emerald-50 text-emerald-700 w-fit">
                            Actif
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-rose-50 text-rose-700 w-fit">
                            Inactif
                          </span>
                        )}
                        {user.isVerified && (
                          <span className="text-[14px] text-gray-500">Vérifié</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconButton
                          icon={<TrashIcon />}
                          variant="ghost"
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title={user.isActive ? "Désactiver" : "Activer"}
                          onClick={() => {
                            if (window.confirm(`Voulez-vous ${user.isActive ? 'désactiver' : 'activer'} cet utilisateur ?`)) {
                              toggleActive(user.id);
                            }
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

export default UsersPage;
