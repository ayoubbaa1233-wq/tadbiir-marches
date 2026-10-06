import React from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { formatMontant, formatHeures, formatDate } from '../../utils/formatters';
import { NatureFormationBadge, EtatPaiementBadge } from '../common/Badge';
import { Phone, Mail, Award, CreditCard, FolderGit2, BookOpen } from 'lucide-react';

interface IntervenantDetailModalProps {
  intervenantId: string | null;
  onClose: () => void;
}

export const IntervenantDetailModal: React.FC<IntervenantDetailModalProps> = ({
  intervenantId,
  onClose,
}) => {
  const { getIntervenantSituation } = useApp();

  if (!intervenantId) return null;
  const situation = getIntervenantSituation(intervenantId);
  if (!situation) return null;

  const {
    intervenant,
    masseHoraireTotale,
    montantTotalPrevu,
    totalPaye,
    resteAPayer,
    interventions,
    formations,
    marches,
    paiements,
  } = situation;

  return (
    <Modal
      isOpen={!!intervenantId}
      onClose={onClose}
      title={`${intervenant.prenom} ${intervenant.nom}`}
      subtitle={`Spécialité : ${intervenant.specialite} · ID: ${intervenant.id}`}
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Fiche coordonnées */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{intervenant.telephone || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{intervenant.email || '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">{intervenant.specialite || '-'}</span>
            </div>
          </div>
          {(intervenant.cin || intervenant.rib) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-3 pt-3 border-t border-slate-200/70 font-mono text-slate-600">
              {intervenant.cin && <div>CIN: <span className="text-slate-900 font-semibold">{intervenant.cin}</span></div>}
              {intervenant.rib && <div>RIB: <span className="text-slate-900 font-semibold">{intervenant.rib}</span></div>}
            </div>
          )}
        </div>

        {/* Synthèse financière globale de l'intervenant */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-100/90 border border-slate-200">
            <span className="text-slate-500 font-medium block">Heures Cumulées</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block tabular-nums">
              {formatHeures(masseHoraireTotale)}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {interventions.length} intervention(s)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80">
            <span className="text-slate-500 font-medium block">Montant Prévu</span>
            <span className="text-xl font-bold text-blue-900 mt-1 block tabular-nums">
              {formatMontant(montantTotalPrevu)}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Total des honoraires dus
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
            <span className="text-slate-500 font-medium block">Total Déjà Payé</span>
            <span className="text-xl font-bold text-emerald-800 mt-1 block tabular-nums">
              {formatMontant(totalPaye)}
            </span>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              {paiements.length} versement(s) effectué(s)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/80">
            <span className="text-slate-500 font-medium block">Reste à Payer</span>
            <span className="text-xl font-bold text-rose-800 mt-1 block tabular-nums">
              {formatMontant(resteAPayer)}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              En attente d'ordonnancement
            </span>
          </div>
        </div>

        {/* Formations et Marchés associés */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            Interventions et Modules Pris en Charge ({interventions.length})
          </h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Marché</th>
                  <th className="py-2.5 px-3">Formation / Module</th>
                  <th className="py-2.5 px-3 text-right">Volume</th>
                  <th className="py-2.5 px-3 text-right">Taux / h</th>
                  <th className="py-2.5 px-3 text-right">Total Prévu</th>
                  <th className="py-2.5 px-3 text-right">Payé</th>
                  <th className="py-2.5 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interventions.map((itv) => (
                  <tr key={itv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                      {itv.marche?.reference || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {itv.formation?.module || '-'}
                      <span className="block text-[11px] font-normal text-slate-400">
                        {itv.formation?.filiere}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-700 tabular-nums">
                      {formatHeures(itv.masseHoraire)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 tabular-nums">
                      {formatMontant(itv.tauxHoraire)}/h
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                      {formatMontant(itv.montantTotal)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-700 tabular-nums">
                      {formatMontant(itv.totalPaye)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <EtatPaiementBadge etat={itv.etat} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historique des paiements de cet intervenant */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
            Historique des Paiements Reçus ({paiements.length})
          </h4>
          {paiements.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
              Aucun paiement n'a encore été versé à cet intervenant.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Réf. & Mode</th>
                    <th className="py-2 px-3">Observation</th>
                    <th className="py-2 px-3 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paiements.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-slate-600 tabular-nums">
                        {formatDate(p.date)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-800">{p.mode}</span>
                        <span className="block text-[11px] font-mono text-slate-400">
                          {p.reference}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{p.observation || '-'}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {formatMontant(p.montant)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
