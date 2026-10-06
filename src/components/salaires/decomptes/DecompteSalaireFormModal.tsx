import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { DecompteSalaire } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { generateNextId, formatMontant } from '../../../utils/formatters';

interface DecompteSalaireFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  decompteToEdit?: DecompteSalaire | null;
  defaultMarcheId?: string;
}

export const DecompteSalaireFormModal: React.FC<DecompteSalaireFormModalProps> = ({
  isOpen,
  onClose,
  decompteToEdit,
  defaultMarcheId,
}) => {
  const {
    marchesSalaires,
    decomptesSalaires,
    getMarcheSalaireSituation,
    addDecompteSalaire,
    updateDecompteSalaire,
  } = useApp();

  const [marcheSalaireId, setMarcheSalaireId] = useState('');
  const [numero, setNumero] = useState<number>(1);
  const [date, setDate] = useState('');
  const [montantRecu, setMontantRecu] = useState<string>('');
  const [referenceVirement, setReferenceVirement] = useState('');
  const [observation, setObservation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const previewId = decompteToEdit
    ? decompteToEdit.id
    : generateNextId('DEC-SAL', decomptesSalaires.map((d) => d.id));

  // Determine next decompte number for selected market
  const calculateNextNumero = (selectedMid: string) => {
    const existing = decomptesSalaires.filter((d) => d.marcheSalaireId === selectedMid);
    if (existing.length === 0) return 1;
    const maxNum = Math.max(...existing.map((d) => d.numero));
    return maxNum + 1;
  };

  useEffect(() => {
    if (decompteToEdit) {
      setMarcheSalaireId(decompteToEdit.marcheSalaireId);
      setNumero(decompteToEdit.numero);
      setDate(decompteToEdit.date);
      setMontantRecu(
        decompteToEdit.montantRecu !== undefined && decompteToEdit.montantRecu !== null
          ? String(decompteToEdit.montantRecu)
          : ''
      );
      setReferenceVirement(decompteToEdit.referenceVirement);
      setObservation(decompteToEdit.observation || '');
    } else {
      const initialMarcheId = defaultMarcheId || (marchesSalaires[0]?.id || '');
      setMarcheSalaireId(initialMarcheId);
      setNumero(calculateNextNumero(initialMarcheId));
      setDate(new Date().toISOString().slice(0, 10));
      setMontantRecu('');
      setReferenceVirement(`VIR-ENC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setObservation('');
    }
    setError(null);
  }, [decompteToEdit, isOpen, defaultMarcheId, marchesSalaires]);

  const handleMarcheChange = (newMarcheId: string) => {
    setMarcheSalaireId(newMarcheId);
    if (!decompteToEdit) {
      setNumero(calculateNextNumero(newMarcheId));
    }
  };

  const selectedMarche = marchesSalaires.find((m) => m.id === marcheSalaireId);
  const situation = selectedMarche ? getMarcheSalaireSituation(selectedMarche.id) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!marcheSalaireId) {
      setError('Veuillez sélectionner le marché de salaires concerné.');
      return;
    }
    if (!numero || numero <= 0) {
      setError('Le numéro du décompte doit être supérieur ou égal à 1.');
      return;
    }
    if (!date) {
      setError('Veuillez sélectionner la date de règlement ou d’encaissement.');
      return;
    }
    const parsedMontant = parseFloat(String(montantRecu).replace(',', '.')) || 0;
    if (parsedMontant <= 0) {
      setError('Le montant encaissé doit être supérieur à 0 DH.');
      return;
    }
    if (!referenceVirement.trim()) {
      setError('La référence du virement ou avis d’opération bancaire est obligatoire.');
      return;
    }

    if (decompteToEdit) {
      updateDecompteSalaire(decompteToEdit.id, {
        marcheSalaireId,
        numero: Number(numero),
        date,
        montantRecu: parsedMontant,
        referenceVirement: referenceVirement.trim(),
        observation: observation.trim() || undefined,
      });
    } else {
      addDecompteSalaire({
        marcheSalaireId,
        numero: Number(numero),
        date,
        montantRecu: parsedMontant,
        referenceVirement: referenceVirement.trim(),
        observation: observation.trim() || undefined,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        decompteToEdit
          ? `Modifier Décompte Salaire N° ${decompteToEdit.numero} (${decompteToEdit.id})`
          : 'Enregistrer un Décompte (Salaires)'
      }
      subtitle="Encaissement des virements et décomptes émis pour le marché de salaires"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Situation du Marché */}
        {selectedMarche && situation && (
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                Marché {selectedMarche.reference} : {selectedMarche.objet.slice(0, 50)}...
              </span>
              <span className="font-mono text-emerald-800 font-bold">
                Taux: {situation.tauxEncaissement.toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-200/60 text-[11px]">
              <div>
                <span className="text-slate-500 block">Montant Marché:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {formatMontant(selectedMarche.montantContractuel)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Déjà Encaissé:</span>
                <span className="font-semibold text-teal-700 font-mono">
                  {formatMontant(situation.totalDecomptesRecus)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Reste à Recevoir:</span>
                <span className="font-bold text-amber-700 font-mono">
                  {formatMontant(situation.resteARecevoir)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sélection Marché & Numéro */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Marché rattaché <span className="text-rose-500">*</span>
            </label>
            <select
              value={marcheSalaireId}
              onChange={(e) => handleMarcheChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              required
            >
              <option value="" disabled>Sélectionner un marché...</option>
              {marchesSalaires.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.reference} — {m.objet.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              N° de Décompte <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={numero}
              onChange={(e) => setNumero(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-mono font-bold"
              required
            />
          </div>
        </div>

        {/* Montant & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Montant du décompte (DH) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={montantRecu}
              onChange={(e) => {
                const val = e.target.value.replace(',', '.');
                setMontantRecu(val);
              }}
              onKeyDown={(e) => {
                if (e.key === ',') {
                  e.preventDefault();
                  const current = String(montantRecu);
                  if (!current.includes('.') && !current.includes(',')) {
                    setMontantRecu(current ? `${current}.` : '0.');
                  }
                }
              }}
              onPaste={(e) => {
                const pasteText = e.clipboardData.getData('text');
                if (pasteText && pasteText.includes(',')) {
                  e.preventDefault();
                  setMontantRecu(pasteText.replace(',', '.').trim());
                }
              }}
              placeholder="Ex: 150000"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-mono font-bold text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date de règlement / encaissement <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              required
            />
          </div>
        </div>

        {/* Référence virement */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Observation / Référence de virement <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={referenceVirement}
            onChange={(e) => setReferenceVirement(e.target.value)}
            placeholder="Ex: VIR-TGR-2026-0881 ou Avis de crédit bancaire"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white font-mono"
            required
          />
        </div>

        {/* Observations complémentaires */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Note complémentaire (optionnel)
          </label>
          <textarea
            rows={2}
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Précisions sur les retenues de garantie, délais d'ordonnancement..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {decompteToEdit ? 'Enregistrer les modifications' : 'Valider le décompte'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
