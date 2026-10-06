import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Formation, Intervention, InterventionEnrichie } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatDate, formatMontant, formatHeures } from '../../utils/formatters';
import { NatureFormationBadge, EtatPaiementBadge } from '../common/Badge';
import {
  FolderGit2,
  Users,
  Calendar,
  Plus,
  Clock,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Phone,
  Mail,
  UserCheck,
} from 'lucide-react';
import { InterventionFormModal } from '../interventions/InterventionFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface FormationDetailModalProps {
  formationId: string | null;
  onClose: () => void;
  onOpenAddIntervention?: (formationId: string) => void;
}

export const FormationDetailModal: React.FC<FormationDetailModalProps> = ({
  formationId,
  onClose,
  onOpenAddIntervention,
}) => {
  const { formations, marches, interventionsEnrichies, deleteIntervention } = useApp();

  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);
  const [isInternalAddModalOpen, setIsInternalAddModalOpen] = useState(false);
  const [interventionToDelete, setInterventionToDelete] = useState<InterventionEnrichie | null>(null);
  const [blockedIntervention, setBlockedIntervention] = useState<InterventionEnrichie | null>(null);

  if (!formationId) return null;
  const formation = formations.find((f) => f.id === formationId);
  if (!formation) return null;

  const marche = marches.find((m) => m.id === formation.marcheId);
  const interventions = interventionsEnrichies.filter((itv) => itv.formationId === formation.id);

  const totalHeures = interventions.reduce((acc, itv) => acc + itv.masseHoraire, 0);
  const totalBudget = interventions.reduce((acc, itv) => acc + itv.montantTotal, 0);
  const totalPaye = interventions.reduce((acc, itv) => acc + itv.totalPaye, 0);
  const resteAPayer = interventions.reduce((acc, itv) => acc + itv.resteAPayer, 0);

  const handleOpenAdd = () => {
    if (onOpenAddIntervention) {
      onOpenAddIntervention(formation.id);
    } else {
      setIsInternalAddModalOpen(true);
    }
  };

  const handleDeleteClick = (itv: InterventionEnrichie) => {
    const hasPaiements = (itv.paiements && itv.paiements.length > 0) || itv.totalPaye > 0;
    if (hasPaiements) {
      setBlockedIntervention(itv);
      return;
    }
    setInterventionToDelete(itv);
  };

  const handleConfirmDelete = () => {
    if (!interventionToDelete) return;
    deleteIntervention(interventionToDelete.id);
    setInterventionToDelete(null);
  };

  return (
    <>
      <Modal
        isOpen={!!formationId}
        onClose={onClose}
        title={`${formation.module} (${formation.id})`}
        subtitle={`Filière : ${formation.filiere} · Marché : ${marche?.reference || formation.marcheId}`}
        maxWidth="4xl"
      >
        <div className="space-y-5">
          {/* En-tête de la formation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Nature</span>
                <div className="mt-1">
                  <NatureFormationBadge nature={formation.nature} />
                </div>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Filière</span>
                <span className="font-semibold text-slate-900 mt-1 block">
                  {formation.filiere}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Marché rattaché</span>
                <span className="font-semibold text-blue-700 mt-1 block font-mono">
                  {marche?.reference || formation.marcheId}
                </span>
              </div>
            </div>

            {formation.description && (
              <p className="mt-3 pt-3 border-t border-slate-200/70 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Description : </span>
                {formation.description}
              </p>
            )}
          </div>

          {/* Synthèse financière du module */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-100/80 border border-slate-200">
              <span className="text-slate-500 block">Masse Horaire Totale</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block tabular-nums">
                {formatHeures(totalHeures)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-slate-500 block">Budget Prévu</span>
              <span className="font-bold text-blue-900 text-sm mt-0.5 block tabular-nums">
                {formatMontant(totalBudget)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-slate-500 block">Total Honoré</span>
              <span className="font-bold text-emerald-800 text-sm mt-0.5 block tabular-nums">
                {formatMontant(totalPaye)}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <span className="text-slate-500 block">Reste à Payer</span>
              <span className="font-bold text-amber-800 text-sm mt-0.5 block tabular-nums">
                {formatMontant(resteAPayer)}
              </span>
            </div>
          </div>

          {/* Intervenants affectés à ce module & Détail des séances */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Intervenants & Séances d'intervention ({interventions.length})</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Détail précis des dates, volumes horaires et honoraires calculés par intervenant
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-blue-200 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Affecter un intervenant</span>
              </button>
            </div>

            {interventions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-600">
                  Aucun intervenant n'est encore affecté à ce module.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Cliquez sur "Affecter un intervenant" pour associer un enseignant et planifier ses séances.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {interventions.map((itv) => {
                  const seancesList = itv.seances || [];
                  const nombreSeances = seancesList.length;

                  return (
                    <div
                      key={itv.id}
                      className="border border-slate-200/90 rounded-xl bg-white overflow-hidden shadow-2xs transition-shadow hover:shadow-xs"
                    >
                      {/* En-tête de la fiche intervenant */}
                      <div className="p-3.5 bg-slate-50/90 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {itv.intervenant?.nom ? itv.intervenant.nom.charAt(0) : 'I'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-xs">
                                {itv.intervenant
                                  ? `${itv.intervenant.prenom} ${itv.intervenant.nom}`
                                  : itv.intervenantId}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                {itv.id}
                              </span>
                              <EtatPaiementBadge etat={itv.etat} />
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-medium text-slate-700">
                                {itv.intervenant?.specialite || 'Spécialiste'}
                              </span>
                              {itv.intervenant?.telephone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{itv.intervenant.telephone}</span>
                                </span>
                              )}
                              {itv.intervenant?.email && (
                                <span className="flex items-center gap-1 truncate max-w-xs">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{itv.intervenant.email}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Synthèse horaire & financière de l'intervenant */}
                        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-[11px] text-slate-500">Taux :</span>
                              <span className="text-xs font-semibold text-slate-800 font-mono">
                                {formatMontant(itv.tauxHoraire)}/h
                              </span>
                            </div>
                            <div className="flex items-center justify-end gap-1.5 mt-0.5">
                              <span className="text-[11px] text-slate-500">Total :</span>
                              <span className="text-xs font-bold text-blue-900 font-mono tabular-nums">
                                {formatMontant(itv.montantTotal)}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded tabular-nums">
                                {formatHeures(itv.masseHoraire)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingIntervention(itv)}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200 hover:border-blue-200 cursor-pointer"
                              title="Modifier les séances et les honoraires"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteClick(itv)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200 hover:border-rose-200 cursor-pointer"
                              title={
                                (itv.paiements && itv.paiements.length > 0) || itv.totalPaye > 0
                                  ? "Paiements déjà enregistrés - retrait bloqué"
                                  : "Retirer cet intervenant de cette formation"
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Sous-tableau compact des séances */}
                      <div className="p-3">
                        {nombreSeances > 0 ? (
                          <div className="border border-slate-200/80 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                                <tr>
                                  <th className="py-1.5 px-3 w-10 text-center">N°</th>
                                  <th className="py-1.5 px-3 w-40">Date d'intervention</th>
                                  <th className="py-1.5 px-3 w-28 text-center">Volume horaire</th>
                                  <th className="py-1.5 px-3">Objectif / Thème abordé</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                {seancesList.map((s, idx) => (
                                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                                    <td className="py-2 px-3 text-center font-mono text-slate-400 text-[11px]">
                                      {idx + 1}
                                    </td>
                                    <td className="py-2 px-3 whitespace-nowrap">
                                      <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3 text-blue-600" />
                                        <span className="font-semibold text-slate-900 tabular-nums">
                                          {formatDate(s.date)}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-2 px-3 text-center whitespace-nowrap">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold text-[11px] font-mono tabular-nums">
                                        <Clock className="w-2.5 h-2.5 text-blue-500" />
                                        {s.heures}h
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-slate-600">
                                      {s.description || (
                                        <span className="text-slate-400 italic">
                                          Séance pédagogique
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-slate-50/90 border-t border-slate-200 text-[11px] font-medium text-slate-700">
                                <tr>
                                  <td colSpan={2} className="py-1.5 px-3 text-slate-500 font-medium">
                                    Total séances calculé ({nombreSeances} créneau{nombreSeances > 1 ? 'x' : ''})
                                  </td>
                                  <td className="py-1.5 px-3 text-center font-bold text-blue-900 font-mono tabular-nums">
                                    {formatHeures(itv.masseHoraire)}
                                  </td>
                                  <td className="py-1.5 px-3 text-right text-slate-700 font-semibold font-mono">
                                    Montant honoraires : <span className="text-blue-900 font-bold">{formatMontant(itv.montantTotal)}</span>
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/70 text-xs">
                            <div className="flex items-center gap-2 text-amber-800">
                              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>
                                Volume forfaitaire défini : <strong>{formatHeures(itv.masseHoraire)}</strong> ({formatMontant(itv.montantTotal)}). Les créneaux détaillés n'ont pas encore été renseignés.
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingIntervention(itv)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200/80 rounded transition-colors cursor-pointer shrink-0"
                            >
                              + Détailler les séances
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal d'édition/ajout d'intervention interne */}
      {(editingIntervention || isInternalAddModalOpen) && (
        <InterventionFormModal
          isOpen={!!editingIntervention || isInternalAddModalOpen}
          onClose={() => {
            setEditingIntervention(null);
            setIsInternalAddModalOpen(false);
          }}
          interventionToEdit={editingIntervention}
          defaultFormationId={formation.id}
        />
      )}

      {/* Boîte de dialogue de confirmation de retrait */}
      <ConfirmDialog
        isOpen={!!interventionToDelete}
        onClose={() => setInterventionToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Désaffecter l'intervenant"
        message={`Êtes-vous sûr de vouloir retirer cet intervenant de cette formation ?

Intervenant : ${
          interventionToDelete?.intervenant
            ? `${interventionToDelete.intervenant.prenom} ${interventionToDelete.intervenant.nom}`
            : interventionToDelete?.intervenantId || 'Intervenant'
        }
Masse horaire : ${formatHeures(interventionToDelete?.masseHoraire || 0)} (${interventionToDelete?.seances?.length || 0} séance(s) planifiée(s))
Honoraires prévus : ${formatMontant(interventionToDelete?.montantTotal || 0)}

Cette action supprimera uniquement son affectation à ce module ainsi que ses séances rattachées. L'intervenant restera conservé dans l'annuaire général.`}
        confirmLabel="Retirer de la formation"
        cancelLabel="Annuler"
        variant="danger"
      />

      {/* Modal d'alerte sécurité métier : paiements existants */}
      {blockedIntervention && (
        <Modal
          isOpen={!!blockedIntervention}
          onClose={() => setBlockedIntervention(null)}
          title="Suppression impossible : Paiements enregistrés"
          maxWidth="md"
        >
          <div className="flex items-start gap-3.5">
            <div className="shrink-0 p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-900 text-sm">
                Règlements déjà comptabilisés
              </p>
              <p className="leading-relaxed">
                L'intervenant{' '}
                <strong className="text-slate-900">
                  {blockedIntervention.intervenant
                    ? `${blockedIntervention.intervenant.prenom} ${blockedIntervention.intervenant.nom}`
                    : blockedIntervention.intervenantId}
                </strong>{' '}
                a déjà perçu{' '}
                <strong className="text-amber-800 font-bold font-mono">
                  {formatMontant(blockedIntervention.totalPaye)}
                </strong>{' '}
                ({blockedIntervention.paiements?.length || 1} règlement(s)) pour son intervention sur ce module.
              </p>
              <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-amber-900 text-[11px] leading-relaxed">
                <strong>Sécurité comptable :</strong> Pour éviter la création de paiements orphelins sans intervention de rattachement, il est obligatoire d'annuler ou de réaffecter d'abord ces règlements dans l'onglet des paiements avant de pouvoir désaffecter cet intervenant.
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBlockedIntervention(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </Modal>
      )}
    </>
  );
};
