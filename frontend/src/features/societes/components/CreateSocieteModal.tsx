import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSocietes } from '../hooks/useSocietes';
import { SocieteType, type CreateSocietePayload } from '../services/societes.types';
import { TYPE_LABELS } from './SocietesPage';
import {CiCircleAlert} from "react-icons/ci";

interface Props {
  onClose: () => void;
}

const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-300 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-benin-green/20 focus:border-benin-green";
const labelClass = "block text-lg font-medium text-gray-700 mb-1.5";

export const CreateSocieteModal: React.FC<Props> = ({ onClose }) => {
  const { create } = useSocietes();

  const [name, setName] = useState('');
  const [type, setType] = useState<SocieteType>(SocieteType.PRIVATE_COMPANY);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactEmail) {
      toast.error("Le nom et l'email sont requis.");
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

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Nouvelle société</h2>
            <p className="text-lg text-gray-600">Prestataire / concessionnaire + création du compte</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600 rounded-full transition-colors" type="button">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <form id="create-societe-form" onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Identification */}
            <div>
              <p className="text-xl font-bold text-gray-700 mb-4">Identification</p>
              <div className="space-y-4">
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
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xl font-bold text-gray-700   mb-4">Contact (compte &amp; invitation)</p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Email de contact *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className={inputClass}
                    placeholder="contact@societe.bj"
                  />
                  <p className="text-sm text-gray-600 mt-1">Un lien d'activation sera envoyé à cet email pour créer le mot de passe.</p>
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

            {/* Note : les sociétés sont des prestataires pouvant travailler avec toutes les mairies */}
            <div className="  border border-blue-100 rounded-lg px-4 py-3 flex items-center gap-2">
              <CiCircleAlert className="text-red-700 size-7 shrink-0" />
              <p className="text-sm text-red-700 m-0"> Les sociétés prestataires interviennent sur l'ensemble du territoire national.
                Elles ne sont pas rattachées à une commune ou un département spécifique.
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
            form="create-societe-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-white bg-benin-green rounded-lg hover:bg-benin-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Création...' : "Créer la société"}
          </button>
        </div>
      </div>
    </div>
  );
};
