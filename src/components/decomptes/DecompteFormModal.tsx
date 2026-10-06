import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Decompte } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatMontant, generateNextId } from '../../utils/formatters';

interface DecompteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  decompteToEdit?: Decompte | null;
  defaultMarcheId?: string;
}

export const DecompteFormModal: React.FC<DecompteFormModalProps> = ({
  isOpen,
  onClose,
  decompteToEdit,
  defaultMarcheId,
}) => {
  const { decomptes, marches, addDecompte, updateDecompte, getMarcheSituation } = useApp();

  const [marcheId, setMarcheId] = useState('');
  const [numero, setNumero] = useState<number | ''>(1);
  const [date, setDate] = useState('');
  const [montantRecu, setMontantRecu] = useState<number | ''>('');
  const [referenceVirement, setReferenceVirement] = useState('');
  const [observation, setObservation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const previewId = decompteToEdit
    ? decompteToEdit.id
    : generateNextId('DEC', decomptes.map((d) => d.id));

  // Trouver la situation du marché sélectionné
  const marcheSituation = marcheId ? getMarcheSituation(marcheId) : undefined;

  useEffect(() => {
    if (decompteToEdit) {
      setMarcheId(decompteToEdit.marcheId);
      setNumero(decompteToEdit.numero);
      setDate(decompteToEdit.date);
      setMontantRecu(decompteToEdit.montantRecu);
      setReferenceVirement(decompteToEdit.referenceVirement);
      setObservation(decompteToEdit.observation || '');
    } else {
      const initialMarche = defaultMarcheId || (marches.length > 0 ? marches[0].id : '');
      setMarcheId(initialMarche);
      
      // Calculer le prochain numéro de décompte pour ce marché
      const existingForMarche = decomptes.filter((d) => d.marcheId === initialMarche);
      const nextNum = existingForMarche.length + 1;
      setNumero(nextNum);

      setDate(new Date().toISOString().slice(0, 10));
      setMontantRecu('');
      setReferenceVirement(`VIR-TGR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);
      setObservation('');
    }
    setError(null);
  }, [decompteToEdit, defaultMarcheId, isOpen, marches, decomptes]);

  const handleMarcheChange = (newMarcheId: string) => {
    setMarcheId(newMarcheId);
    if (!decompteToEdit) {
      const existing = decomptes.filter((d) => d.marcheId === newMarcheId);
      setNumero(existing.length + 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!marcheId) {
      setError('Veuillez sélectionner un marché.');
      return;
    }
    if (typeof numero !== 'number' || numero <= 0) {
      setError('Le numéro de décompte doit être un entier supérieur ou égal à 1.');
      return;
    }
    if (!date) {
      setError('La date du décompte est obligatoire.');
      return;
    }
    if (typeof montantRecu !== 'number' || montantRecu <= 0) {
      setError('Le montant reçu doit être strictement supérieur à zéro.');
      return;
    }
    if (!referenceVirement.trim()) {
      setError('La référence du virement ou de l\'ordre de paiement est obligatoire.');
      return;
    }

    try {
      if (decompteToEdit) {
        updateDecompte(decompteToEdit.id, {
          marcheId,
          numero,
          date,
          montantRecu,
          referenceVirement: referenceVirement.trim(),
          observation: observation.trim() || undefined,
        });
      } else {
        addDecompte({
          marcheId,
          numero,
          date,
          montantRecu,
          referenceVirement: referenceVirement.trim(),
          observation: observation.trim() || undefined,
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
      title={decompteToEdit ? `Modifier le décompte n°${decompteToEdit.numero}` : 'Enregistrer un Décompte Reçu'}
      subtitle="Comptabilisez les encaissements reçus de l'entreprise financeuse ou attributaire"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          {/* ID Décompte (Auto) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ID Décompte (Auto)
            </label>
            <input
              type="text"
              value={previewId}
              disabled
              className="w-full px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Numéro de décompte */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Numéro du décompte <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={numero === '' ? '' : numero}
              onChange={(e) => setNumero(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-bold tabular-nums"
            />
          </div>
        </div>

        {/* Marché */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Marché de formation associé <span className="text-rose-500">*</span>
          </label>
          <select
            value={marcheId}
            onChange={(e) => handleMarcheChange(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
          >
            <option value="">Sélectionnez un marché...</option>
            {marches.map((m) => (
              <option key={m.id} value={m.id}>
                Marché {m.reference} ({m.id}) — Montant: {formatMontant(m.montant)}
              </option>
            ))}
          </select>
        </div>

        {/* Statut financier du marché sélectionné */}
        {marcheSituation && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs grid grid-cols-3 gap-2">
            <div>
              <span className="text-slate-500 block">Montant Marché :</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {formatMontant(marcheSituation.marche.montant)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Déjà Encaissé :</span>
              <span className="font-semibold text-emerald-700 tabular-nums">
                {formatMontant(marcheSituation.totalDecomptesRecus)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Reste à Recevoir :</span>
              <span className="font-bold text-amber-800 tabular-nums">
                {formatMontant(marcheSituation.montantRestantARecevoir)}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          {/* Montant reçu */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Montant reçu (DH) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                required
                placeholder="Ex: 370320"
                value={montantRecu === '' ? '' : montantRecu}
                onChange={(e) => setMontantRecu(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-2 pr-10 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-bold tabular-nums"
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                DH
              </span>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Date d'encaissement <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Référence virement */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Référence du Virement / Ordre de Trésorerie <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: VIR-TGR-2026-88912"
            value={referenceVirement}
            onChange={(e) => setReferenceVirement(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        {/* Observation */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Observation / Justificatif (Optionnel)
          </label>
          <input
            type="text"
            placeholder="Ex: Décompte n° 1 - Avancement initial..."
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
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
            {decompteToEdit ? 'Enregistrer les modifications' : 'Enregistrer le décompte'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
