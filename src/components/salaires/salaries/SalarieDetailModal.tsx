import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { useApp } from '../../../context/AppContext';
import { formatDate, formatMontant } from '../../../utils/formatters';
import {
  User,
  CreditCard,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Plus,
} from 'lucide-react';
import { PaiementSalarieFormModal } from '../paiements/PaiementSalarieFormModal';

interface SalarieDetailModalProps {
  salarieId: string | null;
  onClose: () => void;
  onOpenAddPaiement?: (salarieId: string) => void;
}

export const SalarieDetailModal: React.FC<SalarieDetailModalProps> = ({
  salarieId,
  onClose,
  onOpenAddPaiement,
}) => {
  const { salaries, getSalarieSituation, marchesSalaires } = useApp();
  const [isPaiementModalOpen, setIsPaiementModalOpen] = useState(false);

  if (!salarieId) return null;
  const salarie = salaries.find((s) => s.id === salarieId);
  if (!salarie) return null;

  const situation = getSalarieSituation(salarie.id);
  const totalSalairesRecus = situation?.totalSalairesRecus || 0;
  const paiements = situation?.paiements || [];

  return (
    <>
      <Modal
        isOpen={!!salarieId}
        onClose={onClose}
        title={`${salarie.prenom} ${salarie.nom} — Fiche Salarié`}
        subtitle={`${salarie.specialite} · ${salarie.id}`}
        maxWidth="3xl"
      >
        <div className="space-y-5">
          {/* En-tête profil */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {salarie.prenom.charAt(0)}
                  {salarie.nom.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {salarie.prenom} {salarie.nom}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {salarie.specialite}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200 font-medium">
                      {salarie.lieuAffectation === 'Autre'
                        ? salarie.lieuAffectationAutre || 'Autre lieu'
                        : salarie.lieuAffectation}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-emerald-200/80 sm:pl-5">
                <span className="text-[11px] font-medium text-slate-500 block">
                  Total Rémunérations Versées
                </span>
                <span className="text-base font-bold text-emerald-700 font-mono">
                  {formatMontant(totalSalairesRecus)}
                </span>
              </div>
            </div>
          </div>

          {/* Grille informations personnelles et administratives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Données administratives et bancaires */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                Identité & Banque
              </h4>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Matricule :</span>
                <span className="font-mono font-semibold text-slate-800">{salarie.id}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">CIN :</span>
                <span className="font-mono font-bold text-slate-800">{salarie.cin || '—'}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">RIB bancaire :</span>
                <span className="font-mono text-slate-700 text-[11px] max-w-[200px] truncate" title={salarie.rib}>
                  {salarie.rib || 'Non renseigné'}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Salaire de référence :</span>
                <span className="font-mono font-bold text-emerald-700">
                  {salarie.salaireBase ? formatMontant(salarie.salaireBase) : 'Non fixé'}
                </span>
              </div>
            </div>

            {/* Coordonnées & Affectation */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Coordonnées & Affectation
              </h4>
              <div className="flex justify-between py-0.5 items-center">
                <span className="text-slate-500 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> Téléphone :
                </span>
                <span className="font-medium text-slate-800">{salarie.telephone || '—'}</span>
              </div>
              <div className="flex justify-between py-0.5 items-center">
                <span className="text-slate-500 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" /> Email :
                </span>
                <span className="font-medium text-slate-800 truncate max-w-[180px]" title={salarie.email}>
                  {salarie.email || '—'}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Adresse :</span>
                <span className="font-medium text-slate-700 text-right max-w-[180px]">
                  {salarie.adresse || '—'}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-slate-500">Lieu d'affectation :</span>
                <span className="font-semibold text-teal-800">
                  {salarie.lieuAffectation === 'Autre'
                    ? salarie.lieuAffectationAutre || 'Autre'
                    : salarie.lieuAffectation}
                </span>
              </div>
            </div>
          </div>

          {/* Historique des paiements versés */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Historique des Règlements Versés ({paiements.length})
              </h4>
              <button
                type="button"
                onClick={() => {
                  if (onOpenAddPaiement) {
                    onOpenAddPaiement(salarie.id);
                  } else {
                    setIsPaiementModalOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Nouveau Règlement
              </button>
            </div>

            {paiements.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                Aucun versement n'a encore été enregistré pour ce salarié.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Période / Mois</th>
                      <th className="py-2.5 px-3">Marché Rattaché</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Mode</th>
                      <th className="py-2.5 px-3">Réf / Chèque</th>
                      <th className="py-2.5 px-3 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paiements.map((p) => {
                      const marche = marchesSalaires.find((m) => m.id === p.marcheSalaireId);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {p.periode}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                            {marche ? marche.reference : p.marcheSalaireId}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 tabular-nums">
                            {formatDate(p.date)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                p.mode === 'Virement'
                                  ? 'bg-blue-100 text-blue-800'
                                  : p.mode === 'Chèque'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {p.mode}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                            {p.reference}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-700 font-mono">
                            {formatMontant(p.montant)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal d'ajout de paiement salarié si déclenché en interne */}
      {isPaiementModalOpen && (
        <PaiementSalarieFormModal
          isOpen={isPaiementModalOpen}
          onClose={() => setIsPaiementModalOpen(false)}
          defaultSalarieId={salarie.id}
        />
      )}
    </>
  );
};
