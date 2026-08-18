import { useState } from 'react';
import { Input, Textarea, FormField } from '../../../components/forms';
import { Button } from '../../../components/boutons';
import { Modal } from '../../../components/modals';
import toast from 'react-hot-toast';
import { useRoles } from '../hooks/useRoles';
import type { CreateRoleDto } from '../services/roles.types';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateRoleModal({ isOpen, onClose, onSuccess }: CreateRoleModalProps) {
  const { create, isMutating } = useRoles();

  const [formData, setFormData] = useState<CreateRoleDto>({
    code: '',
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create(formData);
      setFormData({ code: '', name: '', description: '' });
      toast.success('Rôle créé avec succès');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création du rôle');
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
      title="Création d'un nouveau rôle système"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Code du rôle" required>
            <Input
              name="code"
              placeholder="ex: ADMIN, MANAGER, VIEWER..."
              value={formData.code}
              onChange={handleChange}
              required
            />
          </FormField>

          <FormField label="Nom d'affichage" required>
            <Input
              name="name"
              placeholder="ex: Administrateur Système"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormField>
        </div>

        <FormField label="Description">
          <Textarea
            name="description"
            placeholder="Description et usage de ce rôle..."
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
            disabled={isMutating || !formData.code || !formData.name}
          >
            {isMutating ? 'Création...' : 'Créer le rôle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
