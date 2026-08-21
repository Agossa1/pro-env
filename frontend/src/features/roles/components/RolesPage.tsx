import { useEffect, useState } from 'react';
import { PageHeader } from '../../../components/headers';
import { Button, IconButton } from '../../../components/boutons';
import { useRoles } from '../hooks/useRoles';
import { CreateRoleModal } from './CreateRoleModal';
import { TIER_LABELS, TIER_COLORS } from '../services/roles.types';
import { useNavigate } from 'react-router-dom';

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

function RolesPage() {
  const { roles, isLoading, reload, remove } = useRoles();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${name}" ?`)) {
      try {
        await remove(id);
      } catch (e: any) {
        alert(e.message ?? 'Erreur lors de la suppression.');
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="Gestion des Rôles"
        subtitle="Administration des rôles système et de leurs privilèges"
        actions={
          <Button variant="primary" leftIcon={<PlusIcon />} onClick={() => setIsCreateModalOpen(true)}>
            Nouveau Rôle
          </Button>
        }
      />

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-lg   text-gray-700">
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Nom du Rôle</th>
                <th className="px-6 py-4">Niveau (Tier)</th>
                <th className="px-6 py-4">Permissions (Pages)</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-base text-gray-700">
                    Chargement des rôles...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-base text-gray-700">
                    Aucun rôle trouvé.
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-benin-green-light/30 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-lg font-medium text-gray-900 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                        {role.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{role.name}</div>
                      {role.description && (
                        <div className="text-base text-gray-500 mt-1 line-clamp-1">
                          {role.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {role.tier ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-base font-medium ${TIER_COLORS[role.tier]}`}>
                          {TIER_LABELS[role.tier]}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-base font-medium text-gray-600">
                      {role.pageIds.length} page(s)
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconButton
                          icon={<EditIcon />}
                          variant="ghost"
                          title="Modifier"
                          onClick={() => navigate(`/roles/${role.id}`)}
                        />
                        <IconButton
                          icon={<TrashIcon />}
                          variant="ghost"
                          className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                          title="Supprimer"
                          onClick={() => handleDelete(role.id, role.name)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateRoleModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}

export default RolesPage;
