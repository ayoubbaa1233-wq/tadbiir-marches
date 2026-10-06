import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Intervenant } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateNextId } from '../../utils/formatters';

interface IntervenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  intervenantToEdit?: Intervenant | null;
}

export const IntervenantFormModal: React.FC<IntervenantFormModalProps> = ({
  isOpen,
  onClose,
  intervenantToEdit,
}) => {
  const { intervenants, addIntervenant, updateIntervenant } = useApp();

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [cin, setCin] = useState('');
  const [rib, setRib] = useState('');
  const [error, setError] = useState<string | null>(null);

  const previewId = intervenantToEdit
    ? intervenantToEdit.id
    : generateNextId('INT', intervenants.map((i) => i.id));

  useEffect(() => {
    if (intervenantToEdit) {
      setNom(intervenantToEdit.nom);
      setPrenom(intervenantToEdit.prenom);
      setTelephone(intervenantToEdit.telephone);
      setEmail(intervenantToEdit.email);
      setSpecialite(intervenantToEdit.specialite);
      setCin(intervenantToEdit.cin || '');
      setRib(intervenantToEdit.rib || '');
    } else {
      setNom('');
      setPrenom('');
      setTelephone('');
      setEmail('');
      setSpecialite('');
      setCin('');
      setRib('');
    }
    setError(null);
  }, [intervenantToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nom.trim() || !prenom.trim()) {
      setError('Le nom et le prénom de l\'intervenant sont obligatoires.');
      return;
    }
    if (!email.trim() && !telephone.trim()) {
      setError('Veuillez renseigner au moins un moyen de contact (Email ou Téléphone).');
      return;
    }
    if (!specialite.trim()) {
      setError('La spécialité ou discipline est obligatoire.');
      return;
    }

    try {
      if (intervenantToEdit) {
        updateIntervenant(intervenantToEdit.id, {
          nom: nom.trim().toUpperCase(),
          prenom: prenom.trim(),
          telephone: telephone.trim(),
          email: email.trim(),
          specialite: specialite.trim(),
          cin: cin.trim() || undefined,
          rib: rib.trim() || undefined,
        });
      } else {
        addIntervenant({
          nom: nom.trim().toUpperCase(),
          prenom: prenom.trim(),
          telephone: telephone.trim(),
          email: email.trim(),
          specialite: specialite.trim(),
          cin: cin.trim() || undefined,
          rib: rib.trim() || undefined,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={intervenantToEdit ? `Modifier l'intervenant ${intervenantToEdit.id}` : 'Nouvel Intervenant'}
      subtitle="Ajouter un formateur ou expert dans le répertoire administratif"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3.5">
          {/* ID Intervenant (Auto) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ID Intervenant
            </label>
            <input
              type="text"
              value={previewId}
              disabled
              className="w-full px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nom de famille <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: BENJELLOUN"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Prénom */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Prénom <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Mohamed"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Spécialité */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Spécialité / Discipline d'expertise <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Génie Civil & Béton Armé, Droit des Marchés Publics..."
            value={specialite}
            onChange={(e) => setSpecialite(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Téléphone */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Numéro de Téléphone
            </label>
            <input
              type="text"
              placeholder="Ex: +212 6 61 23 45 67"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Adresse Email
            </label>
            <input
              type="email"
              placeholder="Ex: intervenant@domaine.ma"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* CIN */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              CIN (Carte Nationale d'Identité)
            </label>
            <input
              type="text"
              placeholder="Ex: AB123456"
              value={cin}
              onChange={(e) => setCin(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* RIB */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              RIB Bancaire (24 chiffres)
            </label>
            <input
              type="text"
              placeholder="Ex: 011 780 0000123456789012 45"
              value={rib}
              onChange={(e) => setRib(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            {intervenantToEdit ? 'Enregistrer les modifications' : 'Ajouter l\'intervenant'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
