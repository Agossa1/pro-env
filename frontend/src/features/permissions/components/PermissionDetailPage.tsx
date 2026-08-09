import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/headers';
import { Button } from '../../../components/boutons';
import { Textarea, FormField } from '../../../components/forms';
import { usePermissions } from '../hooks/usePermissions';
import { ACTION_COLORS, type UpdatePermissionDto } from '../services/permissions.types';

function PermissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loadById, selected: permission, status, update, isMutating } = usePermissions();

  const [formData, setFormData] = useState<UpdatePermissionDto>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      loadById(id);
    }
  }, [id, loadById]);

  useEffect(() => {
    if (permission && status === 'succeeded') {
      setFormData({
        description: permission.description,
      });
    }
  }, [permission, status]);

  if (status === 'loading') {
    return <div className="p-8 text-gray-500">Chargement...</div>;
  }

  if (status === 'failed' || !permission) {
    return <div className="p-8 text-benin-red">Permission introuvable.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const actionColor = ACTION_COLORS[permission.action] || 'bg-gray-100 text-gray-600';

  return (
    <div>
      <PageHeader
        title={`Permission : ${permission.module} / ${permission.action}`}
        subtitle="Détails de l'habilitation"
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate('/permissions')}
          >
            Retour
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Informations</h2>
              {!isEditing && (
                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                  Modifier
                </Button>
              )}
            </div>

            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Module</div>
                    <div className="text-base text-gray-900 font-mono bg-gray-50 p-2 rounded inline-block">{permission.module}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Action</div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${actionColor}`}>
                      {permission.action}
                    </span>
                  </div>

                  <FormField label="Description">
                    <Textarea
                      name="description"
                      value={formData.description || ''}
                      onChange={handleChange}
                      rows={4}
                    />
                  </FormField>

                  <div className="pt-6 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => {
                      setIsEditing(false);
                      setFormData({ description: permission.description });
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
                      <div className="text-sm font-medium text-gray-500 mb-1">Module</div>
                      <div className="text-base text-gray-900 font-mono bg-gray-50 p-2 rounded inline-block">
                        {permission.module}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">Action</div>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${actionColor}`}>
                        {permission.action}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Description</div>
                    <div className="text-base text-gray-900 whitespace-pre-wrap">
                      {permission.description || 'Aucune description détaillée.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PermissionDetailPage;
