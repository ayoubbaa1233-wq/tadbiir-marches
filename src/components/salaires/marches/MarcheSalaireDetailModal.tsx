import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import { formatDate, formatMontant } from '../../../utils/formatters';
import {
  Briefcase,
  FileCheck2,
  Calendar,
  CreditCard,
  Plus,
  Clock,
  Building2,
  AlertCircle,
  Users,
} from 'lucide-react';

interface MarcheSalaireDetailModalProps {
  marcheId: string | null;
  onClose: () => void;
  onOpenAddDecompte?: (marcheId: string) => void;
  onOpenAddPaiement?: (marcheId: string) => void;
}

export const MarcheSalaireDetailModal: React.FC<MarcheSalaireDetailModalProps> = ({
  marcheId,
  onClose,
  onOpenAddDecompte,
  onOpenAddPaiement,
}) => {
  const {
    marchesSalaires,
    decomptesSalaires,
    paiementsSalairesEnrichis,
    getMarcheSalaireSituation,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'decomptes' | 'paiements'>('decomptes');

  if (!marcheId) return null;
  const marche = marchesSalaires.find((m) => m.id === marcheId);
  if (!marche) return null;

  const situation = getMarcheSalaireSituation(marche.id);
  const marcheDecomptes = decomptesSalaires.filter((d) => d.marcheSalaireId === marche.id);
  const marchePaiements = paiementsSalairesEnrichis.filter((p) => p.marcheSalaireId === marche.id);

  const totalDecomptes = situation?.totalDecomptesRecus || 0;
  const resteARecevoir = situation?.resteARecevoir || 0;
  const totalSalaires = situation?.totalSalairesVerses || 0;
  const soldeTresorerie = situation?.soldeTresorerie || 0;
  const tauxEncaissement = situation?.tauxEncaissement || 0;

  return (
    <Modal
      isOpen={!!marcheId}
      onClose={onClose}
      title={`Marché ${marche.reference} — Fiche Exécutive`}
      subtitle={marche.objet}
      maxWidth="4xl"
    >
      <div className="space-y-5">
        {/* En-tête général du marché */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Référence Marché</span>
              <span className="font-bold text-slate-900 mt-1 block font-mono text-sm">
                {marche.reference}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Date de commencement</span>
              <span className="font-semibold text-slate-800 mt-1 block tabular-nums">
                {formatDate(marche.dateCommencement)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Délai d'exécution</span>
              <span className="font-semibold text-slate-800 mt-1 block">
                {marche.delaiMois} mois
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Taux d'encaissement</span>
              <span className="font-bold text-emerald-700 mt-1 block tabular-nums">
                {tauxEncaissement.toFixed(1)} %
              </span>
            </div>
          </div>

          {marche.observations && (
            <p className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Observations : </span>
              {marche.observations}
            </p>
          )}
        </div>

        {/* 4 Cartes Synthèse Financière (Thème Émeraude / Teal) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-100/90 border border-slate-200">
            <span className="text-slate-500 block">Montant Contractuel</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block tabular-nums font-mono">
              {formatMontant(marche.montantContractuel)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-700 block font-medium">Décomptes Reçus</span>
            <span className="font-bold text-emerald-950 text-sm mt-0.5 block tabular-nums font-mono">
              {formatMontant(totalDecomptes)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
            <span className="text-teal-700 block font-medium">Salaires Versés</span>
            <span className="font-bold text-teal-950 text-sm mt-0.5 block tabular-nums font-mono">
              {formatMontant(totalSalaires)}
            </span>
          </div>

          <div
            className={`p-3 rounded-lg border ${
              resteARecevoir > 0
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <span className="text-slate-500 block">Reste à Recevoir</span>
            <span className="font-bold text-sm mt-0.5 block tabular-nums font-mono">
              {formatMontant(resteARecevoir)}
            </span>
          </div>
        </div>

        {/* Trésorerie disponible du marché */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-900 text-white text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Solde de trésorerie disponible (Encaissé — Salaires Payés) :</span>
          </div>
          <span className="font-mono font-bold text-sm text-emerald-300 tabular-nums">
            {formatMontant(soldeTresorerie)}
          </span>
        </div>

        {/* Onglets secondaires : Décomptes & Salaires */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('decomptes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeSubTab === 'decomptes'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Décomptes reçus ({marcheDecomptes.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('paiements')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeSubTab === 'paiements'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Salaires versés ({marchePaiements.length})
              </button>
            </div>

            {activeSubTab === 'decomptes' && onOpenAddDecompte && (
              <button
                type="button"
                onClick={() => onOpenAddDecompte(marche.id)}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau Décompte</span>
              </button>
            )}

            {activeSubTab === 'paiements' && onOpenAddPaiement && (
              <button
                type="button"
                onClick={() => onOpenAddPaiement(marche.id)}
                className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau Paiement</span>
              </button>
            )}
          </div>

          <div className="pt-3">
            {activeSubTab === 'decomptes' ? (
              marcheDecomptes.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-xs text-slate-500">
                  Aucun décompte encaissé pour le moment sur ce marché.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">N°</th>
                        <th className="py-2 px-3">Date Encaissement</th>
                        <th className="py-2 px-3">Montant Encaissé</th>
                        <th className="py-2 px-3">Réf Virement / Observation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {marcheDecomptes.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2 px-3 font-semibold text-emerald-800">
                            Décompte N°{d.numero}
                          </td>
                          <td className="py-2 px-3 tabular-nums">{formatDate(d.date)}</td>
                          <td className="py-2 px-3 font-bold font-mono text-emerald-900 tabular-nums">
                            {formatMontant(d.montantRecu)}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            <span className="font-mono text-xs">{d.referenceVirement}</span>
                            {d.observation && (
                              <span className="block text-[11px] text-slate-400">
                                {d.observation}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : marchePaiements.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-xs text-slate-500">
                Aucun versement de salaire enregistré sur ce marché.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Salarié</th>
                      <th className="py-2 px-3">Période</th>
                      <th className="py-2 px-3">Montant</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Mode & Référence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {marchePaiements.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {p.salarie ? `${p.salarie.prenom} ${p.salarie.nom}` : p.salarieId}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {p.salarie?.specialite}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-700">{p.periode}</td>
                        <td className="py-2 px-3 font-bold font-mono text-teal-900 tabular-nums">
                          {formatMontant(p.montant)}
                        </td>
                        <td className="py-2 px-3 tabular-nums text-slate-600">{formatDate(p.date)}</td>
                        <td className="py-2 px-3 text-slate-600">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-[10px]">
                            {p.mode}
                          </span>
                          <span className="ml-1.5 font-mono text-[11px] text-slate-500">
                            {p.reference}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
