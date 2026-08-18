import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSocietes } from '../hooks/useSocietes';
import { useTerritory } from '../../territory/hooks/useTerritory';
import { SocieteType, type CreateSocietePayload } from '../services/societes.types';
import { TYPE_LABELS } from './SocietesPage';

interface Props {
  onClose: () => void;
}

const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

export const CreateSocieteModal: React.FC<Props> = ({ onClose }) => {
  const { create } = useSocietes();
  const { territories, loadForForm } = useTerritory();

  const [name, setName] = useState('');
  const [type, setType] = useState<SocieteType>(SocieteType.PRIVATE_COMPANY);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [communeId, setCommuneId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadForForm();
  }, [loadForForm]);

  const departments = territories.filter((t) => t.territoryTypeCode === 'DEPARTMENT');
  const communes = territories.filter((t) => t.territoryTypeCode === 'COMMUNE');
  const filteredCommunes = communes.filter((c) => c.parentTerritoryId === departmentId);

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartmentId(e.target.value);
    setCommuneId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactEmail || !communeId) {
      toast.error("Le nom, l'email et la commune sont requis.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload: CreateSocietePayload = {
        name,
        type,
        registrationNumber: registrationNumber || null,
        contactEmail,
        contactPhone: contactPhone || null,
        territoryId: communeId,
      };
      await create(payload).unwrap();
      toast.success(`Société créée. Un lien d'activation a été envoyé à ${contactEmail}.`);
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

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Nouvelle société</h2>
            <p className="text-sm text-gray-500">Prestataire / concessionnaire + création du compte</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

                  <div>
                    <label className={labelClass}>Nom de la société *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      placeholder="Ex: SONEB"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Type *</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as SocieteType)}
                        className={inputClass}
                      >
                        {Object.entries(TYPE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>N° d'enregistrement</label>
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        className={inputClass}
                        placeholder="Ex: RCCM-2024-001"
                      />
                    </div>
                      onChange={(e) => setContactEmail(e.target.value)}
                      className={inputClass}
                      placeholder="contact@societe.bj"
                    />
                    <p className="text-xs text-gray-400 mt-1">Un lien d'activation sera envoyé à cet email pour créer le mot de passe.</p>
                  </div>
                  <div>
                    <label className={labelClass}>Téléphone</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className={inputClass}
                      placeholder="+229 00 00 00 00"
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-3">Territoire de compétence</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Département *</label>
                    <select
                      value={departmentId}
                      onChange={handleDepartmentChange}
                      className={inputClass}
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Commune *</label>
                    <select
                      value={communeId}
                      onChange={(e) => setCommuneId(e.target.value)}
                      className={inputClass}
                      required
                      disabled={!departmentId}
                    >
                      <option value="">
                        {departmentId ? 'Sélectionner...' : "D'abord un département"}
                      </option>
                      {filteredCommunes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!success ? (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              onClick={() => { const form = document.querySelector('form'); if (form) form.requestSubmit(); }}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-benin-green rounded-lg hover:bg-benin-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Création...' : "Créer la société"}
            </button>
          </div>
        ) : (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
