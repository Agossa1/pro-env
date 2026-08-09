import { useState } from 'react';
import { Input, Textarea, FormField } from '../../../components/forms';
import { Button } from '../../../components/boutons';
import { Modal } from '../../../components/modals';
import { usePermissions } from '../hooks/usePermissions';
import type { CreatePermissionDto } from '../services/permissions.types';

interface CreatePermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreatePermissionModal({ isOpen, onClose, onSuccess }: CreatePermissionModalProps) {
  const { create, isMutating } = usePermissions();

  const [formData, setFormData] = useState<CreatePermissionDto>({
    module: '',
    action: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create(formData);
      setFormData({ module: '', action: '', description: '' });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la création de la permission');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouvelle Permission"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Module" required>
            <Input
              name="module"
              placeholder="ex: users, roles, reports..."
              value={formData.module}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Action" required>
            <Input
              name="action"
              placeholder="ex: create, read, update, delete..."
              value={formData.action}
              onChange={handleChange}
              required
            />
          </FormField>
        </div>

        <FormField label="Description détaillée">
          <Textarea
            name="description"
            placeholder="Que permet cette permission ?"
            value={formData.description || ''}
            onChange={handleChange}
            rows={3}
          />
        </FormField>

        <div className="pt-4 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isMutating}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isMutating || !formData.module || !formData.action}
          >
            {isMutating ? 'Création...' : 'Créer la permission'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
