import { useEffect } from 'react';
import { PageHeader } from '../../../components/headers';
import { Button, IconButton } from '../../../components/boutons';
import { usePermissions } from '../hooks/usePermissions';
import { ACTION_COLORS } from '../services/permissions.types';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CreatePermissionModal } from './CreatePermissionModal';

const EditIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

function PermissionsPage() {
  const { permissionsByModule, permissions, status, reload, remove } = usePermissions();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleDelete = async (id: string, module: string, action: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la permission ${action} sur ${module} ?`)) {
      try {
        await remove(id);
      } catch (e: any) {
        alert(e.message ?? 'Erreur lors de la suppression.');
      }
    }
  };

  const isLoading = status === 'loading';

  return (
    <div>
      <PageHeader
        title="Permissions système"
        subtitle="Catalogue de toutes les permissions granulaires"
        actions={
          <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => setIsCreateModalOpen(true)}>
            Nouvelle Permission
          </Button>
        }
      />

      <div className="bg-white border border-gray-300 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-lg font-semibold text-gray-700">
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                    Chargement des permissions...
                  </td>
                </tr>
              ) : permissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                    Aucune permission trouvée.
                  </td>
                </tr>
              ) : (
                Object.entries(permissionsByModule).map(([, perms]) => (
                  perms.map((perm) => {
                    const actionColor = ACTION_COLORS[perm.action] || 'bg-gray-100 text-gray-600 border-gray-200';
                    return (
                      <tr key={perm.id} className="hover:bg-benin-green-light/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            <span className="text-lg font-medium text-gray-900 capitalize">
                              {perm.module}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-lg font-medium border ${actionColor}`}>
                            {perm.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-lg text-gray-600">
                            {perm.description || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <IconButton
                              icon={<EditIcon />}
                              variant="ghost"
                              title="Modifier"
                              onClick={() => navigate(`/permissions/${perm.id}`)}
                            />
                            <IconButton
                              icon={<TrashIcon   />}
                              variant="ghost"
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                              title="Supprimer"
                              onClick={() => handleDelete(perm.id, perm.module, perm.action)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreatePermissionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

export default PermissionsPage;
