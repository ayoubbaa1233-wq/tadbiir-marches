import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { Intervention, SeanceIntervention } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatMontant, generateNextId, formatDate } from '../../utils/formatters';
import { Calendar, Plus, Trash2, Clock, Calculator, AlertCircle } from 'lucide-react';

interface InterventionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  interventionToEdit?: Intervention | null;
  defaultFormationId?: string;
  defaultIntervenantId?: string;
}

interface SeanceFormRow {
  id: string;
  date: string;
  heures: number | '';
  description: string;
}

export const InterventionFormModal: React.FC<InterventionFormModalProps> = ({
  isOpen,
  onClose,
  interventionToEdit,
  defaultFormationId,
  defaultIntervenantId,
}) => {
  const { interventions, formations, intervenants, marches, addIntervention, updateIntervention } = useApp();

  const [formationId, setFormationId] = useState('');
  const [intervenantId, setIntervenantId] = useState('');
  const [masseHoraire, setMasseHoraire] = useState<number | ''>('');
  const [tauxHoraire, setTauxHoraire] = useState<number | ''>(350);
  const [observations, setObservations] = useState('');
  const [seances, setSeances] = useState<SeanceFormRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const previewId = interventionToEdit
    ? interventionToEdit.id
    : generateNextId('ITV', interventions.map((i) => i.id));

  // Somme dynamique des heures des séances
  const totalHeuresSeances = useMemo(() => {
    return seances.reduce((acc, s) => acc + (typeof s.heures === 'number' && s.heures > 0 ? s.heures : 0), 0);
  }, [seances]);

  // Si des séances sont définies, la masse horaire est strictement égale à la somme des séances
  const effectiveMasseHoraire = seances.length > 0
    ? totalHeuresSeances
    : (typeof masseHoraire === 'number' ? masseHoraire : 0);

  // Calcul dynamique du montant total
  const calculatedMontantTotal =
    effectiveMasseHoraire * (typeof tauxHoraire === 'number' && tauxHoraire >= 0 ? tauxHoraire : 0);

  useEffect(() => {
    if (interventionToEdit) {
      setFormationId(interventionToEdit.formationId);
      setIntervenantId(interventionToEdit.intervenantId);
      setMasseHoraire(interventionToEdit.masseHoraire);
      setTauxHoraire(interventionToEdit.tauxHoraire);
      setObservations(interventionToEdit.observations || '');
      if (interventionToEdit.seances && interventionToEdit.seances.length > 0) {
        setSeances(
          interventionToEdit.seances.map((s) => ({
            id: s.id,
            date: s.date,
            heures: s.heures,
            description: s.description || '',
          }))
        );
      } else {
        setSeances([]);
      }
    } else {
      const initialFormationId = defaultFormationId || (formations.length > 0 ? formations[0].id : '');
      setFormationId(initialFormationId);
      setIntervenantId(defaultIntervenantId || (intervenants.length > 0 ? intervenants[0].id : ''));
      setMasseHoraire(30);
      setTauxHoraire(350);
      setObservations('');
      setSeances([]);
    }
    setError(null);
  }, [interventionToEdit, defaultFormationId, defaultIntervenantId, isOpen, formations, intervenants]);

  // Ajout dynamique d'une séance
  const handleAddSeance = () => {
    let defaultDate = new Date().toISOString().slice(0, 10);

    if (seances.length > 0) {
      const lastDate = seances[seances.length - 1].date;
      if (lastDate) {
        const d = new Date(lastDate);
        d.setDate(d.getDate() + 7);
        defaultDate = d.toISOString().slice(0, 10);
      }
    }

    const newIndex = seances.length + 1;
    const newSeance: SeanceFormRow = {
      id: `SEA-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
      date: defaultDate,
      heures: 4,
      description: `Séance ${newIndex}`,
    };

    setSeances((prev) => [...prev, newSeance]);
  };

  // Suppression d'une séance
  const handleRemoveSeance = (id: string) => {
    setSeances((prev) => prev.filter((s) => s.id !== id));
  };

  // Mise à jour d'un champ de séance
  const handleUpdateSeance = (id: string, field: keyof SeanceFormRow, value: any) => {
    setSeances((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formationId) {
      setError('Veuillez sélectionner une formation.');
      return;
    }
    if (!intervenantId) {
      setError('Veuillez sélectionner un intervenant.');
      return;
    }

    // Validation des séances si présentes
    let cleanSeances: SeanceIntervention[] | undefined = undefined;
    let finalMasseHoraire = typeof masseHoraire === 'number' ? masseHoraire : 0;

    if (seances.length > 0) {
      for (let i = 0; i < seances.length; i++) {
        const s = seances[i];
        if (!s.date) {
          setError(`Veuillez renseigner la date de la séance n°${i + 1}.`);
          return;
        }
        if (typeof s.heures !== 'number' || s.heures <= 0) {
          setError(`Le volume horaire de la séance n°${i + 1} doit être supérieur à zéro.`);
          return;
        }
      }

      finalMasseHoraire = totalHeuresSeances;
      cleanSeances = seances.map((s) => ({
        id: s.id,
        date: s.date,
        heures: Number(s.heures),
        description: s.description.trim() || undefined,
      }));
    }

    if (finalMasseHoraire <= 0) {
      setError('La masse horaire globale doit être strictement supérieure à zéro.');
      return;
    }

    if (typeof tauxHoraire !== 'number' || tauxHoraire < 0) {
      setError('Le taux horaire doit être un nombre positif ou nul.');
      return;
    }

    try {
      if (interventionToEdit) {
        updateIntervention(interventionToEdit.id, {
          formationId,
          intervenantId,
          masseHoraire: finalMasseHoraire,
          tauxHoraire,
          seances: cleanSeances,
          observations: observations.trim() || undefined,
        });
      } else {
        addIntervention({
          formationId,
          intervenantId,
          masseHoraire: finalMasseHoraire,
          tauxHoraire,
          seances: cleanSeances,
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
      title={interventionToEdit ? `Modifier l'intervention ${interventionToEdit.id}` : 'Nouvelle Affectation / Intervention'}
      subtitle="Associez un intervenant à un module avec calendrier des séances et calcul automatique"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          {/* ID Intervention (Auto) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ID Intervention (Auto)
            </label>
            <input
              type="text"
              value={previewId}
              disabled
              className="w-full px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Montant calculé en direct */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Montant Total Calculé (Auto)
            </label>
            <div className="px-3 py-2 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded-lg tabular-nums flex items-center justify-between">
              <span>{formatMontant(calculatedMontantTotal)}</span>
              <span className="text-[10px] text-blue-600 font-normal">
                {effectiveMasseHoraire} h × {tauxHoraire || 0} DH
              </span>
            </div>
          </div>
        </div>

        {/* Formation rattachée */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Formation / Module Pédagogique <span className="text-rose-500">*</span>
          </label>
          <select
            value={formationId}
            onChange={(e) => setFormationId(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
          >
            <option value="">Sélectionnez une formation...</option>
            {formations.map((f) => {
              const marche = marches.find((m) => m.id === f.marcheId);
              return (
                <option key={f.id} value={f.id}>
                  {f.module} ({f.filiere}) — Réf: {marche?.reference || f.marcheId}
                </option>
              );
            })}
          </select>
        </div>

        {/* Intervenant affecté */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Intervenant Mobilisé <span className="text-rose-500">*</span>
          </label>
          <select
            value={intervenantId}
            onChange={(e) => setIntervenantId(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
          >
            <option value="">Sélectionnez un intervenant...</option>
            {intervenants.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nom} {i.prenom} ({i.specialite})
              </option>
            ))}
          </select>
        </div>

        {/* SECTION SÉANCES & CRÉNEAUX D'INTERVENTION */}
        <div className="border border-slate-200 rounded-xl bg-slate-50/70 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Planning des Séances & Créneaux ({seances.length})
              </h4>
            </div>
            <button
              type="button"
              onClick={handleAddSeance}
              className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-100/80 hover:bg-blue-200/80 rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une séance</span>
            </button>
          </div>

          {seances.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-slate-300 rounded-lg bg-white/60">
              <p className="text-xs text-slate-500">
                Aucune séance individuelle n'est encore définie.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Cliquez sur <span className="font-semibold text-blue-600">"+ Ajouter une séance"</span> pour planifier les dates et heures avec calcul automatique, ou définissez un volume forfaitaire ci-dessous.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <div className="grid grid-cols-12 gap-2 text-[11px] font-semibold text-slate-500 uppercase px-1">
                <span className="col-span-1 text-center">N°</span>
                <span className="col-span-4">Date de séance *</span>
                <span className="col-span-3">Volume (h) *</span>
                <span className="col-span-3">Objectif / Thème</span>
                <span className="col-span-1 text-center">Action</span>
              </div>

              {seances.map((s, idx) => (
                <div
                  key={s.id}
                  className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-2xs text-xs"
                >
                  <span className="col-span-1 text-center font-mono text-slate-400 font-semibold text-[11px]">
                    #{idx + 1}
                  </span>

                  <div className="col-span-4">
                    <input
                      type="date"
                      required
                      value={s.date}
                      onChange={(e) => handleUpdateSeance(s.id, 'date', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-3">
                    <div className="relative">
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        required
                        placeholder="Heures"
                        value={s.heures === '' ? '' : s.heures}
                        onChange={(e) =>
                          handleUpdateSeance(
                            s.id,
                            'heures',
                            e.target.value === '' ? '' : parseFloat(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 font-semibold tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 pointer-events-none">
                        h
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Thème / TP..."
                      value={s.description}
                      onChange={(e) => handleUpdateSeance(s.id, 'description', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveSeance(s.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Supprimer cette séance"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Total calculé automatiquement des séances */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/80 border border-blue-200 text-xs text-blue-900 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-blue-600" />
                  <span>Total cumulé des séances :</span>
                </span>
                <span className="font-bold text-sm font-mono tabular-nums text-blue-950">
                  {totalHeuresSeances} heures
                </span>
              </div>
            </div>
          )}
        </div>

        {/* PARAMÈTRES HORAIRES & FINANCIERS */}
        <div className="grid grid-cols-2 gap-3.5">
          {/* Masse horaire */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Masse Horaire Totale <span className="text-rose-500">*</span>
              </label>
              {seances.length > 0 && (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  ✓ Calculé auto ({seances.length} séance{seances.length > 1 ? 's' : ''})
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="number"
                min="0.5"
                step="any"
                required
                readOnly={seances.length > 0}
                placeholder="Ex: 30"
                value={effectiveMasseHoraire === 0 && seances.length === 0 ? (masseHoraire === '' ? '' : masseHoraire) : effectiveMasseHoraire}
                onChange={(e) => {
                  if (seances.length === 0) {
                    setMasseHoraire(e.target.value === '' ? '' : parseFloat(e.target.value));
                  }
                }}
                className={`w-full px-3 py-2 text-xs rounded-lg text-slate-900 tabular-nums font-semibold ${
                  seances.length > 0
                    ? 'bg-slate-100 border border-slate-300 text-slate-700 cursor-not-allowed'
                    : 'bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium pointer-events-none">
                heures
              </span>
            </div>
          </div>

          {/* Taux horaire */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Taux Horaire (DH / h) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="any"
                required
                placeholder="Ex: 350"
                value={tauxHoraire === '' ? '' : tauxHoraire}
                onChange={(e) => setTauxHoraire(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 tabular-nums font-semibold"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-medium pointer-events-none">
                DH/h
              </span>
            </div>
          </div>
        </div>

        {/* Encadré formule dynamique */}
        <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
          <span>
            Formule : <span className="font-semibold text-slate-900">{effectiveMasseHoraire} h</span> × <span className="font-semibold text-slate-900">{tauxHoraire || 0} DH/h</span>
          </span>
          <span className="font-bold text-blue-900 font-mono text-xs">
            = {formatMontant(calculatedMontantTotal)}
          </span>
        </p>

        {/* Observations */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Observations / Modalités pédagogiques (Optionnel)
          </label>
          <input
            type="text"
            placeholder="Ex: Travaux dirigés, ateliers pratiques, cours magistral..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            {interventionToEdit ? 'Enregistrer les modifications' : 'Créer l\'intervention'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
