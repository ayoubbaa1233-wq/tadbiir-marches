import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Paiement, ModePaiement } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatMontant, generateNextId } from '../../utils/formatters';

interface PaiementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  paiementToEdit?: Paiement | null;
  defaultInterventionId?: string;
}

export const PaiementFormModal: React.FC<PaiementFormModalProps> = ({
  isOpen,
  onClose,
  paiementToEdit,
  defaultInterventionId,
}) => {
  const { paiements, interventionsEnrichies, addPaiement, updatePaiement } = useApp();

  const [interventionId, setInterventionId] = useState('');
  const [date, setDate] = useState('');
  const [montant, setMontant] = useState<string>('');
  const [mode, setMode] = useState<ModePaiement>('Virement');
  const [reference, setReference] = useState('');
  const [observation, setObservation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const previewId = paiementToEdit
    ? paiementToEdit.id
    : generateNextId('PAY', paiements.map((p) => p.id));

  // Filtrer les interventions sélectionnables :
  // - Uniquement celles ayant un reste à payer strictement supérieur à 0 (resteAPayer > 0)
  // - En mode édition, conserver l'intervention liée au paiement même si son reste actuel est à 0
  const selectableInterventions = useMemo(() => {
    return interventionsEnrichies.filter((itv) => {
      if (paiementToEdit && itv.id === paiementToEdit.interventionId) {
        return true;
      }
      if (defaultInterventionId && itv.id === defaultInterventionId) {
        return true;
      }
      return itv.resteAPayer > 0;
    });
  }, [interventionsEnrichies, paiementToEdit, defaultInterventionId]);

  // Trouver l'intervention sélectionnée pour afficher les détails financiers
  const selectedItv = interventionsEnrichies.find((i) => i.id === interventionId);

  // Plafond maximum autorisé pour le paiement sur cette intervention
  const maxMontant = selectedItv
    ? paiementToEdit && selectedItv.id === paiementToEdit.interventionId
      ? selectedItv.resteAPayer + paiementToEdit.montant
      : selectedItv.resteAPayer
    : undefined;

  const numericMontant = useMemo(() => {
    if (!montant || montant.trim() === '') return 0;
    const parsed = parseFloat(String(montant).replace(',', '.'));
    return isNaN(parsed) ? 0 : parsed;
  }, [montant]);

  useEffect(() => {
    if (paiementToEdit) {
      setInterventionId(paiementToEdit.interventionId);
      setDate(paiementToEdit.date);
      setMontant(paiementToEdit.montant !== undefined && paiementToEdit.montant !== null ? String(paiementToEdit.montant) : '');
      setMode(paiementToEdit.mode);
      setReference(paiementToEdit.reference);
      setObservation(paiementToEdit.observation || '');
    } else {
      // Trouver l'intervention par défaut parmi les interventions éligibles
      const defaultItv =
        defaultInterventionId && selectableInterventions.some((i) => i.id === defaultInterventionId)
          ? selectableInterventions.find((i) => i.id === defaultInterventionId)
          : selectableInterventions.length > 0
          ? selectableInterventions[0]
          : undefined;

      const initialId = defaultItv ? defaultItv.id : '';
      setInterventionId(initialId);
      setDate(new Date().toISOString().slice(0, 10));
      setMontant(defaultItv && defaultItv.resteAPayer > 0 ? String(defaultItv.resteAPayer) : '');
      setMode('Virement');
      setReference(`VIR-PAI-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setObservation('');
    }
    setError(null);
  }, [paiementToEdit, defaultInterventionId, isOpen, selectableInterventions]);

  // Si on change d'intervention et qu'on est en création, pré-remplir avec le reste à payer
  const handleInterventionChange = (newItvId: string) => {
    setInterventionId(newItvId);
    if (!paiementToEdit) {
      const itv = selectableInterventions.find((i) => i.id === newItvId);
      if (itv && itv.resteAPayer > 0) {
        setMontant(String(itv.resteAPayer));
      } else {
        setMontant('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!interventionId) {
      setError('Veuillez sélectionner l\'intervention concernée.');
      return;
    }
    if (!date) {
      setError('La date de règlement est obligatoire.');
      return;
    }
    const parsedMontant = parseFloat(String(montant).replace(',', '.'));
    if (isNaN(parsedMontant) || parsedMontant <= 0) {
      setError('Le montant du paiement doit être supérieur à zéro.');
      return;
    }
    if (maxMontant !== undefined && parsedMontant > maxMontant + 0.0001) {
      setError(
        `Le montant versé (${formatMontant(parsedMontant)}) ne peut pas dépasser le reste dû (${formatMontant(maxMontant)}).`
      );
      return;
    }
    if (!reference.trim()) {
      setError('La référence ou le numéro de virement/reçu est obligatoire.');
      return;
    }

    try {
      if (paiementToEdit) {
        updatePaiement(paiementToEdit.id, {
          interventionId,
          date,
          montant: parsedMontant,
          mode,
          reference: reference.trim(),
          observation: observation.trim() || undefined,
        });
      } else {
        addPaiement({
          interventionId,
          date,
          montant: parsedMontant,
          mode,
          reference: reference.trim(),
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
      title={paiementToEdit ? `Modifier le paiement ${paiementToEdit.id}` : 'Enregistrer un Paiement Intervenant'}
      subtitle="Comptabilisez un versement d'honoraires par tranche (virement ou espèces)"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          {/* ID Paiement (Auto) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ID Paiement (Auto)
            </label>
            <input
              type="text"
              value={previewId}
              disabled
              className="w-full px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Date de paiement */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Date de règlement <span className="text-rose-500">*</span>
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

        {/* Intervention */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Intervention / Affectation concernée <span className="text-rose-500">*</span>
          </label>
          <select
            value={interventionId}
            onChange={(e) => handleInterventionChange(e.target.value)}
            required
            disabled={selectableInterventions.length === 0}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {selectableInterventions.length === 0 ? (
              <option value="">Aucune intervention en attente de paiement</option>
            ) : (
              <>
                <option value="">Sélectionnez une intervention...</option>
                {selectableInterventions.map((itv) => {
                  const isSoldedEdit = paiementToEdit && itv.id === paiementToEdit.interventionId && itv.resteAPayer === 0;
                  return (
                    <option key={itv.id} value={itv.id}>
                      {itv.id} : {itv.intervenant?.prenom} {itv.intervenant?.nom} — {itv.formation?.module} ({isSoldedEdit ? 'Soldé' : `Reste: ${formatMontant(itv.resteAPayer)}`})
                    </option>
                  );
                })}
              </>
            )}
          </select>
          {selectableInterventions.length === 0 && !paiementToEdit && (
            <p className="text-[11px] text-amber-700 mt-1.5">
              Toutes les interventions sont actuellement soldées. Aucun paiement ne peut être enregistré.
            </p>
          )}
        </div>

        {/* Détails financiers de l'intervention sélectionnée */}
        {selectedItv && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs grid grid-cols-3 gap-2">
            <div>
              <span className="text-slate-500 block">Total Prévu :</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {formatMontant(selectedItv.montantTotal)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Déjà Réglé :</span>
              <span className="font-semibold text-emerald-700 tabular-nums">
                {formatMontant(selectedItv.totalPaye)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Reste Dû :</span>
              <span className="font-bold text-rose-700 tabular-nums">
                {formatMontant(maxMontant !== undefined ? maxMontant : selectedItv.resteAPayer)}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          {/* Montant */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Montant versé (DH) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                max={maxMontant !== undefined && maxMontant > 0 ? maxMontant : undefined}
                required
                placeholder={
                  maxMontant !== undefined
                    ? `Max: ${formatMontant(maxMontant)}`
                    : 'Ex: 5000'
                }
                value={montant}
                onChange={(e) => {
                  const val = e.target.value.replace(',', '.');
                  setMontant(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === ',') {
                    e.preventDefault();
                    const current = String(montant);
                    if (!current.includes('.') && !current.includes(',')) {
                      setMontant(current ? `${current}.` : '0.');
                    }
                  }
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData('text');
                  if (text && text.includes(',')) {
                    e.preventDefault();
                    setMontant(text.replace(',', '.').trim());
                  }
                }}
                className={`w-full px-3 py-2 pr-10 text-xs bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 font-bold tabular-nums ${
                  maxMontant !== undefined && numericMontant > maxMontant + 0.0001
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-600 bg-rose-50/40 text-rose-900'
                    : 'border-slate-300 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
              <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">
                DH
              </span>
            </div>
            {selectedItv && maxMontant !== undefined && (
              <div className="flex items-center justify-between text-[11px] mt-1">
                <span className="text-slate-500">
                  Reste dû maximal : <strong className="text-slate-700 font-mono">{formatMontant(maxMontant)}</strong>
                </span>
                {numericMontant > maxMontant + 0.0001 && (
                  <span className="text-rose-600 font-semibold">
                    Dépassement du reste dû (+{formatMontant(numericMontant - maxMontant)})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Mode de paiement */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Mode de Règlement <span className="text-rose-500">*</span>
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as ModePaiement)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium cursor-pointer"
            >
              <option value="Virement">Virement Bancaire</option>
              <option value="Espèces">Espèces (contre reçu)</option>
            </select>
          </div>
        </div>

        {/* Référence */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Référence du paiement / N° Ordre de virement / Reçu <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: VIR-2026-102 ou RECU-ESP-042"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        {/* Observation */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Observation / Remarque (Optionnel)
          </label>
          <input
            type="text"
            placeholder="Ex: Acompte 1, solde de tout compte..."
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
            disabled={selectableInterventions.length === 0 && !paiementToEdit}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            {paiementToEdit ? 'Enregistrer les modifications' : 'Valider le paiement'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
