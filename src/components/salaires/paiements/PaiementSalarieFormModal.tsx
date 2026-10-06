import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../../common/Modal';
import { PaiementSalarie, ModePaiementSalaire } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { generateNextId, formatMontant, formatDate } from '../../../utils/formatters';
import { AlertTriangle, Calendar, CreditCard, User, Building2, CheckCircle2 } from 'lucide-react';

interface PaiementSalarieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  paiementToEdit?: PaiementSalarie | null;
  defaultSalarieId?: string;
  defaultMarcheId?: string;
  defaultPeriode?: string;
}

const MODES_PAIEMENT: ModePaiementSalaire[] = ['Virement', 'Espèces', 'Chèque'];

const MOIS_LIST = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const ANNEES_LIST = [2025, 2026, 2027, 2028];

export const PaiementSalarieFormModal: React.FC<PaiementSalarieFormModalProps> = ({
  isOpen,
  onClose,
  paiementToEdit,
  defaultSalarieId,
  defaultMarcheId,
  defaultPeriode,
}) => {
  const {
    salaries,
    marchesSalaires,
    paiementsSalaires,
    addPaiementSalarie,
    updatePaiementSalarie,
  } = useApp();

  const [salarieId, setSalarieId] = useState('');
  const [marcheSalaireId, setMarcheSalaireId] = useState('');

  // Mois de paie scindé en Mois + Année
  const [selectedMois, setSelectedMois] = useState<string>('Septembre');
  const [selectedAnnee, setSelectedAnnee] = useState<number>(2026);

  const [montant, setMontant] = useState<string>('');
  const [dateEffective, setDateEffective] = useState('');
  const [mode, setMode] = useState<ModePaiementSalaire>('Virement');
  const [reference, setReference] = useState('');
  const [observation, setObservation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const previewId = paiementToEdit
    ? paiementToEdit.id
    : generateNextId('PAY-SAL', paiementsSalaires.map((p) => p.id));

  // Période calculée
  const periodeCalculee = `${selectedMois} ${selectedAnnee}`;

  useEffect(() => {
    if (paiementToEdit) {
      setSalarieId(paiementToEdit.salarieId);
      setMarcheSalaireId(paiementToEdit.marcheSalaireId);

      // Parse periode existante
      const parts = paiementToEdit.periode.trim().split(' ');
      if (parts.length >= 2 && MOIS_LIST.includes(parts[0])) {
        setSelectedMois(parts[0]);
        setSelectedAnnee(parseInt(parts[1], 10) || 2026);
      } else {
        setSelectedMois('Septembre');
        setSelectedAnnee(2026);
      }

      setMontant(
        paiementToEdit.montant !== undefined && paiementToEdit.montant !== null
          ? String(paiementToEdit.montant)
          : ''
      );
      setDateEffective(paiementToEdit.date);
      setMode(paiementToEdit.mode);
      setReference(paiementToEdit.reference);
      setObservation(paiementToEdit.observation || '');
    } else {
      const initialSalarieId = defaultSalarieId || (salaries[0]?.id || '');
      const initialMarcheId = defaultMarcheId || (marchesSalaires[0]?.id || '');
      setSalarieId(initialSalarieId);
      setMarcheSalaireId(initialMarcheId);

      if (defaultPeriode && defaultPeriode !== 'all') {
        const parts = defaultPeriode.trim().split(' ');
        if (parts.length >= 2 && MOIS_LIST.includes(parts[0])) {
          setSelectedMois(parts[0]);
          setSelectedAnnee(parseInt(parts[1], 10) || 2026);
        }
      } else {
        setSelectedMois('Septembre');
        setSelectedAnnee(2026);
      }

      setDateEffective(new Date().toISOString().slice(0, 10));
      setMode('Virement');
      setReference(`VIR-SAL-2026-${Math.floor(100 + Math.random() * 900)}`);
      setObservation('');

      // Auto populate montant from salarieBase
      const salarieObj = salaries.find((s) => s.id === initialSalarieId);
      if (salarieObj && salarieObj.salaireBase) {
        setMontant(String(salarieObj.salaireBase));
      } else {
        setMontant('');
      }
    }
    setError(null);
  }, [paiementToEdit, isOpen, defaultSalarieId, defaultMarcheId, defaultPeriode, salaries, marchesSalaires]);

  // When salarie changes, auto suggest salaireBase
  const handleSalarieChange = (newSalarieId: string) => {
    setSalarieId(newSalarieId);
    if (!paiementToEdit) {
      const s = salaries.find((sal) => sal.id === newSalarieId);
      if (s && s.salaireBase) {
        setMontant(String(s.salaireBase));
      }
    }
  };

  const handleModeChange = (newMode: ModePaiementSalaire) => {
    setMode(newMode);
    if (!paiementToEdit) {
      const year = selectedAnnee;
      const rand = Math.floor(100 + Math.random() * 900);
      if (newMode === 'Virement') {
        setReference(`VIR-SAL-${year}-${rand}`);
      } else if (newMode === 'Chèque') {
        setReference(`CHQ-BP-${Math.floor(100000 + Math.random() * 900000)}`);
      } else {
        setReference(`RECU-CAISSE-${year}-${rand}`);
      }
    }
  };

  // Détection en temps réel d'un paiement en doublon pour le même salarié, marché et mois
  const paiementExistantDoublon = useMemo(() => {
    if (!salarieId || !marcheSalaireId || !periodeCalculee) return null;

    return paiementsSalaires.find(
      (p) =>
        p.id !== paiementToEdit?.id &&
        p.salarieId === salarieId &&
        p.marcheSalaireId === marcheSalaireId &&
        p.periode.trim().toLowerCase() === periodeCalculee.trim().toLowerCase()
    );
  }, [paiementsSalaires, salarieId, marcheSalaireId, periodeCalculee, paiementToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!salarieId) {
      setError('Veuillez sélectionner le salarié bénéficiaire.');
      return;
    }
    if (!marcheSalaireId) {
      setError("Veuillez sélectionner le marché d'affectation.");
      return;
    }
    if (!selectedMois || !selectedAnnee) {
      setError('La sélection du mois et de l’année de paie est obligatoire.');
      return;
    }
    const parsedMontant = parseFloat(String(montant).replace(',', '.')) || 0;
    if (parsedMontant <= 0) {
      setError('Le montant versé doit être strictement supérieur à 0 DH.');
      return;
    }
    if (!dateEffective) {
      setError('Veuillez sélectionner la date de versement effectif.');
      return;
    }
    if (!reference.trim()) {
      setError('La référence de transaction ou numéro de chèque est obligatoire.');
      return;
    }

    // Blocage strict du doublon
    if (paiementExistantDoublon) {
      setError(
        `Impossible d'enregistrer ce paiement : un salaire de ${formatMontant(
          paiementExistantDoublon.montant
        )} a déjà été comptabilisé pour ce salarié pour le mois de ${periodeCalculee} sur ce marché (Réf : ${
          paiementExistantDoublon.reference
        }).`
      );
      return;
    }

    if (paiementToEdit) {
      updatePaiementSalarie(paiementToEdit.id, {
        salarieId,
        marcheSalaireId,
        periode: periodeCalculee,
        montant: parsedMontant,
        date: dateEffective,
        mode,
        reference: reference.trim(),
        observation: observation.trim() || undefined,
      });
    } else {
      addPaiementSalarie({
        salarieId,
        marcheSalaireId,
        periode: periodeCalculee,
        montant: parsedMontant,
        date: dateEffective,
        mode,
        reference: reference.trim(),
        observation: observation.trim() || undefined,
      });
    }

    onClose();
  };

  const selectedSalarieObj = salaries.find((s) => s.id === salarieId);
  const selectedMarcheObj = marchesSalaires.find((m) => m.id === marcheSalaireId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        paiementToEdit
          ? `Modifier Règlement Salarié — ${paiementToEdit.id}`
          : 'Enregistrer un Paiement Salarié'
      }
      subtitle="Saisie et suivi des rémunérations du personnel rattaché aux marchés"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Alerte Doublon Détecté en Temps Réel */}
        {paiementExistantDoublon && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Doublon Détecté pour le Mois de {periodeCalculee}</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Un règlement a déjà été enregistré pour <strong>{selectedSalarieObj?.prenom} {selectedSalarieObj?.nom}</strong> au titre de <strong>{periodeCalculee}</strong> sur ce marché :
            </p>
            <div className="bg-white/80 p-2 rounded-lg border border-amber-200 text-[11px] font-mono text-slate-700 flex justify-between items-center">
              <span>Réf : {paiementExistantDoublon.reference} (le {formatDate(paiementExistantDoublon.date)})</span>
              <span className="font-bold text-emerald-800">{formatMontant(paiementExistantDoublon.montant)}</span>
            </div>
            <p className="text-[11px] text-amber-700">
              Pour éviter les doubles versements accidentels, la saisie d'un nouveau paiement identique est bloquée. Modifiez le mois de paie ou l'enregistrement existant.
            </p>
          </div>
        )}

        {/* Badge ID Système */}
        <div className="flex items-center justify-between p-3 bg-teal-50/60 border border-teal-200/80 rounded-lg text-xs">
          <span className="text-teal-900 font-medium">Référence d'enregistrement système :</span>
          <span className="font-mono font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
            {previewId}
          </span>
        </div>

        {/* Salarié & Marché */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Salarié concerné <span className="text-rose-500">*</span>
            </label>
            <select
              value={salarieId}
              onChange={(e) => handleSalarieChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              required
            >
              <option value="" disabled>Sélectionner un salarié...</option>
              {salaries.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.prenom} {s.nom} ({s.specialite} - {s.cin})
                </option>
              ))}
            </select>
            {selectedSalarieObj && (
              <p className="mt-1 text-[11px] text-teal-700">
                Lieu : <span className="font-semibold">{selectedSalarieObj.lieuAffectation}</span> · Base :{' '}
                <span className="font-bold font-mono">
                  {selectedSalarieObj.salaireBase ? formatMontant(selectedSalarieObj.salaireBase) : 'Non fixé'}
                </span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Marché rattaché <span className="text-rose-500">*</span>
            </label>
            <select
              value={marcheSalaireId}
              onChange={(e) => setMarcheSalaireId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              required
            >
              <option value="" disabled>Sélectionner un marché...</option>
              {marchesSalaires.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.reference} — {m.objet.slice(0, 45)}...
                </option>
              ))}
            </select>
            {selectedMarcheObj && (
              <p className="mt-1 text-[11px] text-slate-500 truncate">
                {selectedMarcheObj.objet}
              </p>
            )}
          </div>
        </div>

        {/* Mois de Paie (Mois + Année) & Montant Versé */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              Mois de paie concerné <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedMois}
                onChange={(e) => setSelectedMois(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white font-medium text-slate-800"
                required
              >
                {MOIS_LIST.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedAnnee}
                onChange={(e) => setSelectedAnnee(parseInt(e.target.value, 10))}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white font-medium text-slate-800"
                required
              >
                {ANNEES_LIST.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-teal-800 font-semibold">
              Période retenue : <span className="font-mono">{periodeCalculee}</span>
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-800">
              Montant versé (DH) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
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
                const pasteText = e.clipboardData.getData('text');
                if (pasteText && pasteText.includes(',')) {
                  e.preventDefault();
                  setMontant(pasteText.replace(',', '.').trim());
                }
              }}
              placeholder="Ex: 6500"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white font-mono font-bold text-slate-900"
              required
            />
            {selectedSalarieObj?.salaireBase ? (
              <p className="text-[11px] text-slate-500">
                Salaire contractuel de base : {formatMontant(selectedSalarieObj.salaireBase)}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">Montant net décaissé</p>
            )}
          </div>
        </div>

        {/* Date effective de versement, Mode & Référence */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Date effective de versement <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={dateEffective}
              onChange={(e) => setDateEffective(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mode de règlement <span className="text-rose-500">*</span>
            </label>
            <select
              value={mode}
              onChange={(e) => handleModeChange(e.target.value as ModePaiementSalaire)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            >
              {MODES_PAIEMENT.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              N° Transaction / Chèque <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex: VIR-SAL-2026-091"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white font-mono"
              required
            />
          </div>
        </div>

        {/* Observation */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Observation / Justification comptable (optionnel)
          </label>
          <textarea
            rows={2}
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Précisions sur les retenues, primes ou justificatifs..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white resize-none"
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
            disabled={!!paiementExistantDoublon}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-sm transition-colors cursor-pointer ${
              paiementExistantDoublon
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {paiementToEdit ? 'Enregistrer les modifications' : 'Valider le paiement'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
