import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTeams } from '../hooks/useTeams';
import { TeamType } from '../services/teams.types';
import type { CreateTeamPayload } from '../services/teams.types';
import { useSocietes } from '../../societes/hooks/useSocietes';

interface Props {
  onClose: () => void;
}

const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

export const CreateTeamModal: React.FC<Props> = ({ onClose }) => {
  const { create } = useTeams();
  const { list: societes, isLoading: loadingSocietes, load: loadSocietes } = useSocietes();

  const [name, setName] = useState('');
  const [teamType, setTeamType] = useState<TeamType>(TeamType.PROVIDER);
  const [organizationId, setOrganizationId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSocietes({ limit: 200 });
  }, [loadSocietes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Le nom de l'équipe est requis.");
      return;
    }

    if (teamType === TeamType.PROVIDER && !organizationId) {
      toast.error("Vous devez sélectionner une société pour une équipe prestataire.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateTeamPayload = {
        name: name.trim(),
        teamType,
        organizationId: teamType === TeamType.PROVIDER ? organizationId : null,
      };
      await create(payload).unwrap();
      toast.success('Équipe créée avec succès.');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Une erreur est survenue lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nouvelle équipe</h2>
            <p className="text-sm text-gray-500">Équipe terrain — institution ou prestataire</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors" type="button">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <form id="create-team-form" onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Type selector */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Type d'équipe</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: TeamType.PROVIDER, label: '🏗️ Prestataire', desc: 'Exécute les missions et interventions pour une société' },
                  { value: TeamType.INSTITUTION, label: '🏛️ Institution', desc: 'Techniciens publics créant les signalements terrain' },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => { setTeamType(value); setOrganizationId(''); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      teamType === value
                        ? 'border-benin-green bg-benin-green-light/30 text-benin-green-dark'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-snug">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Nom */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Informations</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Nom de l'équipe *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder={teamType === TeamType.PROVIDER ? "Ex: Équipe Nord — SONEB" : "Ex: Équipe Inspection Cotonou"}
                  />
                </div>

                {/* Société — seulement pour les providers */}
                {teamType === TeamType.PROVIDER && (
                  <div>
                    <label className={labelClass}>Société *</label>
                    <select
                      required
                      value={organizationId}
                      onChange={(e) => setOrganizationId(e.target.value)}
                      className={inputClass}
                      disabled={loadingSocietes}
                    >
                      <option value="">{loadingSocietes ? 'Chargement...' : '— Sélectionner une société —'}</option>
                      {societes.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">L'équipe sera rattachée à cette société prestataire.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info box */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <p className="text-xs text-blue-700">
                💡 Après la création, vous pourrez ajouter des membres (chef d'équipe et techniciens) depuis la fiche de l'équipe.
              </p>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="create-team-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-benin-green rounded-lg hover:bg-benin-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Création...' : 'Créer l\'équipe'}
          </button>
        </div>
      </div>
    </div>
  );
};
