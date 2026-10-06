import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { MarcheSalaire } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { generateNextId } from '../../../utils/formatters';

interface MarcheSalaireFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  marcheToEdit?: MarcheSalaire | null;
}

export const MarcheSalaireFormModal: React.FC<MarcheSalaireFormModalProps> = ({
  isOpen,
  onClose,
  marcheToEdit,
}) => {
  const { marchesSalaires, addMarcheSalaire, updateMarcheSalaire } = useApp();

  const [reference, setReference] = useState('');
  const [objet, setObjet] = useState('');
  const [dateCommencement, setDateCommencement] = useState('');
  const [delaiMois, setDelaiMois] = useState<number | ''>(12);
  const [montantContractuel, setMontantContractuel] = useState<string>('');
  const [observations, setObservations] = useState('');
  const [error, setError] = useState<string | null>(null);

  const previewId = marcheToEdit
    ? marcheToEdit.id
    : generateNextId('MS', marchesSalaires.map((m) => m.id));

  useEffect(() => {
    if (marcheToEdit) {
      setReference(marcheToEdit.reference);
      setObjet(marcheToEdit.objet);
      setDateCommencement(marcheToEdit.dateCommencement);
      setDelaiMois(marcheToEdit.delaiMois);
      setMontantContractuel(
        marcheToEdit.montantContractuel !== undefined && marcheToEdit.montantContractuel !== null
          ? String(marcheToEdit.montantContractuel)
          : ''
      );
      setObservations(marcheToEdit.observations || '');
    } else {
      setReference('');
      setObjet('');
      setDateCommencement(new Date().toISOString().slice(0, 10));
      setDelaiMois(12);
      setMontantContractuel('');
      setObservations('');
    }
    setError(null);
  }, [marcheToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reference.trim()) {
      setError('La référence du marché de salaires est obligatoire (ex: 01/SAL/2026).');
      return;
    }
    if (!objet.trim()) {
      setError('L\'objet du marché est obligatoire.');
      return;
    }
    if (!dateCommencement) {
      setError('La date de commencement est obligatoire.');
      return;
    }
    if (typeof delaiMois !== 'number' || delaiMois <= 0) {
      setError('Le délai en mois doit être un nombre strictement positif.');
      return;
    }
    const parsedMontant = parseFloat(String(montantContractuel).replace(',', '.')) || 0;
    if (parsedMontant <= 0) {
      setError('Le montant contractuel doit être strictement supérieur à zéro.');
      return;
    }

    try {
      if (marcheToEdit) {
        updateMarcheSalaire(marcheToEdit.id, {
          reference: reference.trim(),
          objet: objet.trim(),
          dateCommencement,
          delaiMois,
          montantContractuel: parsedMontant,
          observations: observations.trim() || undefined,
        });
      } else {
        addMarcheSalaire({
          reference: reference.trim(),
          objet: objet.trim(),
          dateCommencement,
          delaiMois,
          montantContractuel: parsedMontant,
          observations: observations.trim() || undefined,
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
      title={marcheToEdit ? `Modifier le Marché Salaires ${marcheToEdit.reference}` : 'Nouveau Marché (Salaires)'}
      subtitle="Création ou mise à jour d'un marché d'affectation des salariés"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          {/* Identifiant Auto */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              N° Dossier (Auto)
            </label>
            <input
              type="text"
              value={previewId}
              disabled
              className="w-full px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Référence */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Référence Marché <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: 01/SAL/2026"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-medium"
            />
          </div>
        </div>

        {/* Objet du marché */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Objet du Marché <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            required
            placeholder="Ex: Mise à disposition de personnel de soutien technique et pédagogique..."
            value={objet}
            onChange={(e) => setObjet(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Date de commencement */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Date de commencement <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dateCommencement}
              onChange={(e) => setDateCommencement(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Délai (en mois) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Délai d'exécution (Mois) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="60"
              required
              placeholder="Ex: 12"
              value={delaiMois}
              onChange={(e) => setDelaiMois(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
            />
          </div>
        </div>

        {/* Montant contractuel */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Montant Contractuel Global (TTC en DH) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="any"
              required
              placeholder="Ex: 480000"
              value={montantContractuel}
              onChange={(e) => {
                const val = e.target.value.replace(',', '.');
                setMontantContractuel(val);
              }}
              onKeyDown={(e) => {
                if (e.key === ',') {
                  e.preventDefault();
                  const current = String(montantContractuel);
                  if (!current.includes('.') && !current.includes(',')) {
                    setMontantContractuel(current ? `${current}.` : '0.');
                  }
                }
              }}
              onPaste={(e) => {
                const pasteText = e.clipboardData.getData('text');
                if (pasteText && pasteText.includes(',')) {
                  e.preventDefault();
                  setMontantContractuel(pasteText.replace(',', '.').trim());
                }
              }}
              className="w-full px-3 py-2 pr-10 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-bold font-mono"
            />
            <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
              DH
            </span>
          </div>
        </div>

        {/* Observations */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Observations administratives (Optionnel)
          </label>
          <textarea
            rows={2}
            placeholder="Clauses particulières, numéros de bon de commande, conventions..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none"
          />
        </div>

        {/* Boutons d'action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            {marcheToEdit ? 'Enregistrer les modifications' : 'Créer le marché'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
