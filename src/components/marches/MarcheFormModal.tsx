import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Marche } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateNextId } from '../../utils/formatters';

interface MarcheFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  marcheToEdit?: Marche | null;
}

export const MarcheFormModal: React.FC<MarcheFormModalProps> = ({
  isOpen,
  onClose,
  marcheToEdit,
}) => {
  const { marches, addMarche, updateMarche } = useApp();

  const [reference, setReference] = useState('');
  const [objet, setObjet] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [montant, setMontant] = useState<number | ''>('');
  const [observations, setObservations] = useState('');
  const [error, setError] = useState<string | null>(null);

  const previewId = marcheToEdit
    ? marcheToEdit.id
    : generateNextId('M', marches.map((m) => m.id));

  useEffect(() => {
    if (marcheToEdit) {
      setReference(marcheToEdit.reference);
      setObjet(marcheToEdit.objet);
      setDateDebut(marcheToEdit.dateDebut);
      setDateFin(marcheToEdit.dateFin);
      setMontant(marcheToEdit.montant);
      setObservations(marcheToEdit.observations || '');
    } else {
      setReference('');
      setObjet('');
      setDateDebut(new Date().toISOString().slice(0, 10));
      setDateFin('');
      setMontant('');
      setObservations('');
    }
    setError(null);
  }, [marcheToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reference.trim()) {
      setError('La référence du marché est obligatoire (ex: 01/2026).');
      return;
    }
    if (!objet.trim()) {
      setError('L\'objet du marché est obligatoire.');
      return;
    }
    if (!dateDebut || !dateFin) {
      setError('Les dates de début et de fin sont obligatoires.');
      return;
    }
    if (new Date(dateDebut) > new Date(dateFin)) {
      setError('La date de début doit être antérieure à la date de fin.');
      return;
    }
    if (typeof montant !== 'number' || montant <= 0) {
      setError('Le montant du marché doit être un nombre strictement supérieur à zéro.');
      return;
    }

    try {
      if (marcheToEdit) {
        updateMarche(marcheToEdit.id, {
          reference: reference.trim(),
          objet: objet.trim(),
          dateDebut,
          dateFin,
          montant,
          observations: observations.trim() || undefined,
        });
      } else {
        addMarche({
          reference: reference.trim(),
          objet: objet.trim(),
          dateDebut,
          dateFin,
          montant,
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
      title={marcheToEdit ? `Modifier le marché ${marcheToEdit.reference}` : 'Nouveau Marché de Formation'}
      subtitle="Enregistrez les informations contractuelles et financières du marché"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          {/* ID Marché (automatique) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ID Marché (Auto)
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
              Référence du Marché <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: 01/2026"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
            />
          </div>
        </div>

        {/* Objet */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Objet du Marché <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={2}
            placeholder="Ex: Formation continue sur les modules disciplinaires et d'ingénierie..."
            value={objet}
            onChange={(e) => setObjet(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Date début */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Date de début <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Date fin */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Date de fin <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Montant du marché */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Montant du Marché (en DH) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="any"
              required
              placeholder="Ex: 3500000"
              value={montant === '' ? '' : montant}
              onChange={(e) => setMontant(e.target.value === '' ? '' : parseFloat(e.target.value))}
              className="w-full px-3 py-2 pr-12 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 tabular-nums font-semibold"
            />
            <span className="absolute right-3 top-2 text-xs font-bold text-slate-500 pointer-events-none">
              DH
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Montant contractuel global alloué par l'administration.
          </p>
        </div>

        {/* Observations */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Observations / Remarques (Optionnel)
          </label>
          <input
            type="text"
            placeholder="Ex: Pôle Ingénierie, convention cadre..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
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
            {marcheToEdit ? 'Enregistrer les modifications' : 'Créer le marché'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
