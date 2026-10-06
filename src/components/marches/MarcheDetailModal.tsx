import React, { useState } from 'react';
import {
  FolderGit2,
  Calendar,
  DollarSign,
  BookOpen,
  Users,
  Receipt,
  CreditCard,
  PieChart,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { formatMontant, formatDate, formatHeures, formatPourcentage } from '../../utils/formatters';
import { NatureFormationBadge, EtatPaiementBadge } from '../common/Badge';
import { Marche } from '../../types';

interface MarcheDetailModalProps {
  marcheId: string | null;
  onClose: () => void;
  onOpenAddFormation?: (marcheId: string) => void;
  onOpenAddDecompte?: (marcheId: string) => void;
}

export const MarcheDetailModal: React.FC<MarcheDetailModalProps> = ({
  marcheId,
  onClose,
  onOpenAddFormation,
  onOpenAddDecompte,
}) => {
  const { marches, formations, interventionsEnrichies, decomptes, paiements, getMarcheSituation } = useApp();
  const [activeTab, setActiveTab] = useState<'formations' | 'intervenants' | 'interventions' | 'decomptes' | 'paiements' | 'situation'>(
    'situation'
  );

  if (!marcheId) return null;
  const marche = marches.find((m) => m.id === marcheId);
  if (!marche) return null;

  const situation = getMarcheSituation(marche.id);

  // Formations du marché
  const marcheFormations = formations.filter((f) => f.marcheId === marche.id);
  const marcheFormationIds = new Set(marcheFormations.map((f) => f.id));

  // Interventions du marché
  const marcheInterventions = interventionsEnrichies.filter((itv) =>
    marcheFormationIds.has(itv.formationId)
  );

  // Intervenants uniques mobilisés sur ce marché
  const intervenantsMap = new Map();
  marcheInterventions.forEach((itv) => {
    if (itv.intervenant) {
      if (!intervenantsMap.has(itv.intervenant.id)) {
        intervenantsMap.set(itv.intervenant.id, {
          intervenant: itv.intervenant,
          modules: [itv.formation?.module],
          masseHoraire: itv.masseHoraire,
          montantTotal: itv.montantTotal,
          totalPaye: itv.totalPaye,
          resteAPayer: itv.resteAPayer,
        });
      } else {
        const item = intervenantsMap.get(itv.intervenant.id);
        item.modules.push(itv.formation?.module);
        item.masseHoraire += itv.masseHoraire;
        item.montantTotal += itv.montantTotal;
        item.totalPaye += itv.totalPaye;
        item.resteAPayer += itv.resteAPayer;
      }
    }
  });
  const marcheIntervenants = Array.from(intervenantsMap.values());

  // Décomptes du marché
  const marcheDecomptes = decomptes
    .filter((d) => d.marcheId === marche.id)
    .sort((a, b) => b.numero - a.numero);

  // Paiements réalisés sur les interventions de ce marché
  const marcheInterventionIds = new Set(marcheInterventions.map((itv) => itv.id));
  const marchePaiements = paiements
    .filter((p) => marcheInterventionIds.has(p.interventionId))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Modal
      isOpen={!!marcheId}
      onClose={onClose}
      title={`Marché ${marche.reference} (${marche.id})`}
      subtitle={marche.objet}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* EN-TÊTE RÉCAPITULATIF DU MARCHÉ */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Référence</span>
              <span className="font-semibold text-slate-900 text-sm font-mono mt-0.5 block">
                {marche.reference}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Période d'exécution</span>
              <span className="font-semibold text-slate-900 text-sm mt-0.5 block tabular-nums">
                {formatDate(marche.dateDebut)} → {formatDate(marche.dateFin)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Montant du Marché</span>
              <span className="font-bold text-blue-700 text-sm mt-0.5 block tabular-nums">
                {formatMontant(marche.montant)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Taux d'encaissement</span>
              <span className="font-bold text-emerald-700 text-sm mt-0.5 block tabular-nums">
                {formatPourcentage(situation?.tauxEncaissement || 0)}
              </span>
            </div>
          </div>
          {marche.observations && (
            <p className="mt-3 pt-3 border-t border-slate-200/70 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Observation : </span>
              {marche.observations}
            </p>
          )}
        </div>

        {/* NAVIGATION PAR ONGLETS (CONFORME SPÉCIFICATION) */}
        <div className="border-b border-slate-200">
          <nav className="flex space-x-1 overflow-x-auto pb-px">
            {[
              { key: 'situation', label: 'Situation Financière', icon: PieChart },
              { key: 'formations', label: `Formations (${marcheFormations.length})`, icon: BookOpen },
              { key: 'intervenants', label: `Intervenants (${marcheIntervenants.length})`, icon: Users },
              { key: 'interventions', label: `Interventions (${marcheInterventions.length})`, icon: FileSpreadsheet },
              { key: 'decomptes', label: `Décomptes reçus (${marcheDecomptes.length})`, icon: Receipt },
              { key: 'paiements', label: `Paiements (${marchePaiements.length})`, icon: CreditCard },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600 bg-blue-50/40 rounded-t-lg'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* CONTENU DES ONGLETS */}

        {/* ONGLET 1 : SITUATION FINANCIÈRE */}
        {activeTab === 'situation' && situation && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
                <span className="text-slate-500 font-medium">Montant du Marché</span>
                <p className="text-xl font-bold text-blue-900 mt-1 tabular-nums">
                  {formatMontant(situation.marche.montant)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Montant contractuel global</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                <span className="text-slate-500 font-medium">Total Décomptes Reçus</span>
                <p className="text-xl font-bold text-emerald-800 mt-1 tabular-nums">
                  {formatMontant(situation.totalDecomptesRecus)}
                </p>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  {formatPourcentage(situation.tauxEncaissement)} perçu ({marcheDecomptes.length} décomptes)
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
                <span className="text-slate-500 font-medium">Montant Restant à Recevoir</span>
                <p className="text-xl font-bold text-amber-800 mt-1 tabular-nums">
                  {formatMontant(situation.montantRestantARecevoir)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">À recouvrer auprès de l'entreprise</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-500 font-medium">Total Prévu pour Intervenants</span>
                <p className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                  {formatMontant(situation.montantTotalPrevuIntervenants)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Masse horaire : {formatHeures(situation.masseHoraireTotale)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
                <span className="text-slate-500 font-medium">Total Payé aux Intervenants</span>
                <p className="text-xl font-bold text-blue-900 mt-1 tabular-nums">
                  {formatMontant(situation.totalPayeIntervenants)}
                </p>
                <p className="text-[11px] text-blue-700 font-medium mt-1">
                  {formatPourcentage(situation.tauxPaiementIntervenants)} honoré
                </p>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80">
                <span className="text-slate-500 font-medium">Reste à Payer aux Intervenants</span>
                <p className="text-xl font-bold text-rose-800 mt-1 tabular-nums">
                  {formatMontant(situation.resteAPayerIntervenants)}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Engagements en attente</p>
              </div>
            </div>

            {/* Soldes finaux */}
            <div className="p-4.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Solde Prévisionnel du Marché
                </span>
                <p className="text-2xl font-bold tracking-tight text-white tabular-nums mt-0.5">
                  {formatMontant(situation.soldePrevisionnel)}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  Calcul : Montant Marché ({formatMontant(situation.marche.montant)}) - Total Prévu Intervenants ({formatMontant(situation.montantTotalPrevuIntervenants)})
                </p>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-700 pt-3 sm:pt-0 sm:pl-6 w-full sm:w-auto">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Trésorerie Actuelle
                </span>
                <p className="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">
                  {formatMontant(situation.soldeTresorerie)}
                </p>
                <p className="text-xs text-slate-400">
                  Décomptes reçus - Règlements intervenants
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 2 : FORMATIONS */}
        {activeTab === 'formations' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Formations rattachées à ce marché ({marcheFormations.length})
              </span>
              {onOpenAddFormation && (
                <button
                  onClick={() => onOpenAddFormation(marche.id)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une formation</span>
                </button>
              )}
            </div>

            {marcheFormations.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                Aucune formation associée à ce marché.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Module</th>
                      <th className="py-2.5 px-3">Nature</th>
                      <th className="py-2.5 px-3">Filière</th>
                      <th className="py-2.5 px-3 text-right">Intervenants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {marcheFormations.map((f) => {
                      const fItvs = marcheInterventions.filter((i) => i.formationId === f.id);
                      return (
                        <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {f.module}
                            <span className="block text-[11px] font-mono text-slate-400 font-normal">
                              {f.id}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <NatureFormationBadge nature={f.nature} />
                          </td>
                          <td className="py-3 px-3 text-slate-600">{f.filiere}</td>
                          <td className="py-3 px-3 text-right font-medium text-slate-800">
                            {fItvs.length} affecté{fItvs.length > 1 ? 's' : ''}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ONGLET 3 : INTERVENANTS */}
        {activeTab === 'intervenants' && (
          <div className="space-y-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Intervenants mobilisés sur ce marché ({marcheIntervenants.length})
            </span>

            {marcheIntervenants.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                Aucun intervenant n'a encore été affecté aux formations de ce marché.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Intervenant</th>
                      <th className="py-2.5 px-3">Spécialité</th>
                      <th className="py-2.5 px-3 text-right">Volume</th>
                      <th className="py-2.5 px-3 text-right">Montant Prévu</th>
                      <th className="py-2.5 px-3 text-right">Payé</th>
                      <th className="py-2.5 px-3 text-right">Reste</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {marcheIntervenants.map((item) => (
                      <tr key={item.intervenant.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-900 block">
                            {item.intervenant.prenom} {item.intervenant.nom}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {item.intervenant.email}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{item.intervenant.specialite}</td>
                        <td className="py-3 px-3 text-right font-medium text-slate-700 tabular-nums">
                          {formatHeures(item.masseHoraire)}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-900 tabular-nums">
                          {formatMontant(item.montantTotal)}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-emerald-700 tabular-nums">
                          {formatMontant(item.totalPaye)}
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-rose-700 tabular-nums">
                          {formatMontant(item.resteAPayer)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ONGLET 4 : INTERVENTIONS DÉTAILLÉES */}
        {activeTab === 'interventions' && (
          <div className="space-y-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Affectations & Interventions ({marcheInterventions.length})
            </span>

            {marcheInterventions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                Aucune intervention enregistrée.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Formation</th>
                      <th className="py-2.5 px-3">Intervenant</th>
                      <th className="py-2.5 px-3 text-right">Masse H.</th>
                      <th className="py-2.5 px-3 text-right">Taux H.</th>
                      <th className="py-2.5 px-3 text-right">Montant Total</th>
                      <th className="py-2.5 px-3 text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {marcheInterventions.map((itv) => (
                      <tr key={itv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-medium text-slate-900">
                          {itv.formation?.module}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {itv.intervenant ? `${itv.intervenant.prenom} ${itv.intervenant.nom}` : itv.intervenantId}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-700 tabular-nums font-mono">
                          {formatHeures(itv.masseHoraire)}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-700 tabular-nums font-mono">
                          {formatMontant(itv.tauxHoraire)}/h
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                          {formatMontant(itv.montantTotal)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <EtatPaiementBadge etat={itv.etat} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ONGLET 5 : DÉCOMPTES REÇUS */}
        {activeTab === 'decomptes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Décomptes reçus de l'entreprise chargée des formations ({marcheDecomptes.length})
              </span>
              {onOpenAddDecompte && (
                <button
                  onClick={() => onOpenAddDecompte(marche.id)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Enregistrer un décompte</span>
                </button>
              )}
            </div>

            {marcheDecomptes.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                Aucun décompte reçu pour le moment sur ce marché.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Numéro</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Réf. Virement</th>
                      <th className="py-2.5 px-3">Observation</th>
                      <th className="py-2.5 px-3 text-right">Montant Reçu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {marcheDecomptes.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          Décompte n° {d.numero}
                        </td>
                        <td className="py-3 px-3 text-slate-600 tabular-nums">{formatDate(d.date)}</td>
                        <td className="py-3 px-3 font-mono text-slate-600">{d.referenceVirement}</td>
                        <td className="py-3 px-3 text-slate-500">{d.observation || '-'}</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-700 tabular-nums">
                          {formatMontant(d.montantRecu)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-xs text-slate-900">
                    <tr>
                      <td colSpan={4} className="py-2.5 px-3">
                        Total des décomptes perçus
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-800 font-bold tabular-nums">
                        {formatMontant(situation?.totalDecomptesRecus || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ONGLET 6 : PAIEMENTS INTERVENANTS */}
        {activeTab === 'paiements' && (
          <div className="space-y-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Historique des paiements versés aux intervenants pour ce marché ({marchePaiements.length})
            </span>

            {marchePaiements.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                Aucun paiement n'a encore été effectué pour ce marché.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Intervenant</th>
                      <th className="py-2.5 px-3">Module</th>
                      <th className="py-2.5 px-3">Mode & Réf</th>
                      <th className="py-2.5 px-3 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {marchePaiements.map((p) => {
                      const itv = interventionsEnrichies.find((i) => i.id === p.interventionId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 text-slate-600 tabular-nums">{formatDate(p.date)}</td>
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {itv?.intervenant ? `${itv.intervenant.prenom} ${itv.intervenant.nom}` : p.interventionId}
                          </td>
                          <td className="py-3 px-3 text-slate-600">{itv?.formation?.module || '-'}</td>
                          <td className="py-3 px-3">
                            <span className="font-mono text-slate-700">{p.mode}</span>
                            <span className="text-[11px] text-slate-400 block font-mono">
                              {p.reference}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900 tabular-nums">
                            {formatMontant(p.montant)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-xs text-slate-900">
                    <tr>
                      <td colSpan={4} className="py-2.5 px-3">
                        Total payé aux intervenants
                      </td>
                      <td className="py-2.5 px-3 text-right text-blue-900 font-bold tabular-nums">
                        {formatMontant(situation?.totalPayeIntervenants || 0)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
