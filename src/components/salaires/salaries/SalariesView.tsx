import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Building2,
  Phone,
  Mail,
  FileSpreadsheet,
  MapPin,
  CreditCard,
  UserCheck,
  Briefcase,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Salarie, LieuAffectationSalarie } from '../../../types';
import { formatMontant } from '../../../utils/formatters';
import { SalarieFormModal } from './SalarieFormModal';
import { SalarieDetailModal } from './SalarieDetailModal';
import { PaiementSalarieFormModal } from '../paiements/PaiementSalarieFormModal';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { Pagination } from '../../common/Pagination';
import { exportToCsv } from '../../../utils/exportUtils';

const LIEU_BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Centre pédagogique': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  'Laboratoire': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  'Administration': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  "Centre d'Excellence": { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'Autre': { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
};

export const SalariesView: React.FC = () => {
  const {
    salaries,
    salariesEnrichis,
    deleteSalarie,
    hasPermission,
    salairesAlerteRetard,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLieu, setSelectedLieu] = useState<string>('all');
  const [selectedStatutPaie, setSelectedStatutPaie] = useState<'all' | 'retard' | 'a_jour'>('all');
  const [selectedSalarieDetailId, setSelectedSalarieDetailId] = useState<string | null>(null);
  const [salarieToEdit, setSalarieToEdit] = useState<Salarie | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [salarieToDelete, setSalarieToDelete] = useState<Salarie | null>(null);

  // Modal règlement direct de salaire
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [preselectedSalarieForPayment, setPreselectedSalarieForPayment] = useState<string | undefined>(undefined);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtrage
  const filteredSalaries = useMemo(() => {
    let result = salariesEnrichis;

    if (selectedLieu !== 'all') {
      result = result.filter((s) => s.lieuAffectation === selectedLieu);
    }

    // Filtrage par Statut Paie (Retard / À jour)
    if (selectedStatutPaie === 'retard') {
      const retardIds = new Set(salairesAlerteRetard.salariesEnRetard.map((s) => s.id));
      result = result.filter((s) => retardIds.has(s.id));
    } else if (selectedStatutPaie === 'a_jour') {
      const retardIds = new Set(salairesAlerteRetard.salariesEnRetard.map((s) => s.id));
      result = result.filter((s) => !retardIds.has(s.id));
    }

    const term = searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter(
        (s) =>
          s.nom.toLowerCase().includes(term) ||
          s.prenom.toLowerCase().includes(term) ||
          s.cin.toLowerCase().includes(term) ||
          s.specialite.toLowerCase().includes(term) ||
          s.id.toLowerCase().includes(term) ||
          (s.telephone && s.telephone.includes(term)) ||
          (s.email && s.email.toLowerCase().includes(term)) ||
          (s.rib && s.rib.includes(term))
      );
    }

    return result;
  }, [salariesEnrichis, selectedLieu, selectedStatutPaie, salairesAlerteRetard, searchTerm]);

  const paginatedSalaries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSalaries.slice(start, start + pageSize);
  }, [filteredSalaries, currentPage, pageSize]);

  // Action rapide : Régler un salarié en retard
  const handleReglerSalarie = (salarieId?: string) => {
    setPreselectedSalarieForPayment(salarieId);
    setIsPaymentModalOpen(true);
  };

  // Indicateurs synthétiques
  const totalSalaries = salaries.length;
  const totalSalairesVerses = salariesEnrichis.reduce(
    (acc, s) => acc + s.totalSalairesRecus,
    0
  );
  const totalMasseSalarialeBase = salaries.reduce(
    (acc, s) => acc + (s.salaireBase || 0),
    0
  );
  const salariesRémunérés = salariesEnrichis.filter((s) => s.nombrePaiements > 0).length;

  const handleExportCsv = () => {
    const headers = [
      'Matricule',
      'Nom',
      'Prénom',
      'CIN',
      'RIB Bancaire',
      'Spécialité / Poste',
      "Lieu d'Affectation",
      'Téléphone',
      'Email',
      'Adresse',
      'Salaire de Base (DH)',
      'Total Versé (DH)',
      'Nb Paiements',
    ];

    const rows = filteredSalaries.map((s) => [
      s.id,
      s.nom,
      s.prenom,
      s.cin,
      s.rib || '',
      s.specialite,
      s.lieuAffectation === 'Autre' ? s.lieuAffectationAutre || 'Autre' : s.lieuAffectation,
      s.telephone,
      s.email,
      s.adresse,
      s.salaireBase || 0,
      s.totalSalairesRecus,
      s.nombrePaiements,
    ]);

    exportToCsv(
      `effectif_salaries_${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows
    );
  };

  const handleConfirmDelete = () => {
    if (!salarieToDelete) return;
    deleteSalarie(salarieToDelete.id);
    setSalarieToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* 0. Bandeau d'alerte contextuel orange - Retard de règlement des salaires (échéance dès le 2 du mois échu) */}
      {salairesAlerteRetard.isRetard && (
        <div className="bg-amber-50/95 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded border border-amber-300">
                  Alerte Échéance Salaires
                </span>
                <span className="text-xs text-amber-800 font-medium">
                  Règlement exigible dès le 2 du mois échu
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-amber-950 mt-1 leading-snug">
                ⚠️ Règlement des salaires en attente : {salairesAlerteRetard.nbSalariesEnRetard} salarié(s) n'ont pas encore été réglés pour le mois de {salairesAlerteRetard.moisEchu}
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Salarié(s) en attente :{' '}
                <span className="font-semibold text-amber-950">
                  {salairesAlerteRetard.salariesEnRetard
                    .map((s) => `${s.prenom} ${s.nom}`)
                    .join(', ')}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleReglerSalarie(salairesAlerteRetard.salariesEnRetard[0]?.id)}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Régler maintenant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Cartes KPI Synthétiques (Teal / Émeraude) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Effectif Total */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Effectif Total Salariés
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {totalSalaries}
              </span>
              <span className="text-xs text-teal-600 font-medium">collaborateurs</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 : Salariés Rémunérés */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Salariés avec Règlements
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-700 font-mono">
                {salariesRémunérés}
              </span>
              <span className="text-xs text-slate-400">
                / {totalSalaries} actifs
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 : Masse Salariale Mensuelle de Référence */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Masse Salariale Base
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {formatMontant(totalMasseSalarialeBase)}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 : Cumul Total Versé */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Cumul Rémunérations Versées
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-teal-700 font-mono">
                {formatMontant(totalSalairesVerses)}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Barre d'outils (Recherche, Filtre par Lieu, Filtre Statut, Boutons d'Action) */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Champ recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher par nom, CIN, spécialité, tél, email..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtre par Lieu */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
              Lieu :
            </span>
            <select
              value={selectedLieu}
              onChange={(e) => {
                setSelectedLieu(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
            >
              <option value="all">Tous les lieux</option>
              <option value="Centre pédagogique">Centre pédagogique</option>
              <option value="Laboratoire">Laboratoire</option>
              <option value="Administration">Administration</option>
              <option value="Centre d'Excellence">Centre d'Excellence</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {/* Filtre par Statut Règlement */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
              Statut :
            </span>
            <select
              value={selectedStatutPaie}
              onChange={(e) => {
                setSelectedStatutPaie(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
            >
              <option value="all">Tous les statuts</option>
              <option value="retard">
                ⚠️ En attente ({salairesAlerteRetard.salariesEnRetard.length})
              </option>
              <option value="a_jour">À jour</option>
            </select>
          </div>
        </div>

        {/* Boutons Nouveau Salarié et Export CSV */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel / CSV</span>
          </button>

          {hasPermission('Gestionnaire') && (
            <button
              type="button"
              onClick={() => {
                setSalarieToEdit(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nouveau Salarié
            </button>
          )}
        </div>
      </div>

      {/* 3. Tableau des Salariés */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Salarié</th>
                <th className="py-3 px-4">CIN & RIB</th>
                <th className="py-3 px-4">Spécialité / Fonction</th>
                <th className="py-3 px-4">Lieu d'Affectation</th>
                <th className="py-3 px-4">Coordonnées</th>
                <th className="py-3 px-4 text-right">Salaire Base</th>
                <th className="py-3 px-4 text-right">Total Versé</th>
                <th className="py-3 px-4 text-center">Statut Paie</th>
                <th className="py-3 px-4 text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedSalaries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">
                        Aucun salarié trouvé
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Modifiez vos critères de recherche ou enregistrez un nouveau salarié.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedSalaries.map((salarie) => {
                  const badgeStyle =
                    LIEU_BADGE_STYLES[salarie.lieuAffectation] || LIEU_BADGE_STYLES['Autre'];
                  const lieuLibelle =
                    salarie.lieuAffectation === 'Autre'
                      ? salarie.lieuAffectationAutre || 'Autre'
                      : salarie.lieuAffectation;

                  const isEnRetard = salairesAlerteRetard.salariesEnRetard.some(
                    (s) => s.id === salarie.id
                  );

                  return (
                    <tr
                      key={salarie.id}
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        isEnRetard ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      {/* Salarié */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isEnRetard
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-teal-600/10 text-teal-700 border border-teal-600/20'
                            }`}
                          >
                            {salarie.prenom.charAt(0)}
                            {salarie.nom.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {salarie.prenom} {salarie.nom}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                              {salarie.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* CIN & RIB */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800 block text-[11px]">
                          {salarie.cin}
                        </span>
                        <span
                          className="font-mono text-[10px] text-slate-500 block truncate max-w-[130px]"
                          title={salarie.rib}
                        >
                          {salarie.rib || 'Non renseigné'}
                        </span>
                      </td>

                      {/* Spécialité */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 block">
                          {salarie.specialite}
                        </span>
                      </td>

                      {/* Lieu d'affectation */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          <Building2 className="w-3 h-3" />
                          {lieuLibelle}
                        </span>
                      </td>

                      {/* Coordonnées */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          {salarie.telephone && (
                            <span className="text-slate-700 flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {salarie.telephone}
                            </span>
                          )}
                          {salarie.email && (
                            <span
                              className="text-slate-500 flex items-center gap-1 truncate max-w-[150px]"
                              title={salarie.email}
                            >
                              <Mail className="w-3 h-3 text-slate-400" />
                              {salarie.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Salaire Base */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-semibold text-slate-800 block">
                          {salarie.salaireBase ? formatMontant(salarie.salaireBase) : '—'}
                        </span>
                      </td>

                      {/* Total Versé */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-bold text-teal-700 block">
                          {formatMontant(salarie.totalSalairesRecus)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {salarie.nombrePaiements} versement(s)
                        </span>
                      </td>

                      {/* Statut Paie avec mise en évidence orange */}
                      <td className="py-3 px-4 text-center">
                        {isEnRetard ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            En attente de règlement
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            À jour ({salairesAlerteRetard.moisEchu || 'Réglementé'})
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Bouton Régler rapide si en attente */}
                          {hasPermission('Gestionnaire') && isEnRetard && (
                            <button
                              type="button"
                              onClick={() => handleReglerSalarie(salarie.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-slate-950 font-bold text-[10px] bg-amber-400 hover:bg-amber-500 rounded-md shadow-2xs transition-colors cursor-pointer mr-1"
                              title={`Régler le salaire de ${salarie.prenom} ${salarie.nom} pour ${salairesAlerteRetard.moisEchu}`}
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Régler</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedSalarieDetailId(salarie.id)}
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors cursor-pointer"
                            title="Consulter la fiche salarié"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {hasPermission('Gestionnaire') && (
                            <button
                              type="button"
                              onClick={() => {
                                setSalarieToEdit(salarie);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                              title="Modifier les informations"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {hasPermission('Administrateur') && (
                            <button
                              type="button"
                              onClick={() => setSalarieToDelete(salarie)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Supprimer le salarié"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-slate-200 px-4 py-3">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredSalaries.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal Fiche Détail Salarié */}
      {selectedSalarieDetailId && (
        <SalarieDetailModal
          salarieId={selectedSalarieDetailId}
          onClose={() => setSelectedSalarieDetailId(null)}
        />
      )}

      {/* Modal Création / Édition Salarié */}
      <SalarieFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSalarieToEdit(null);
        }}
        salarieToEdit={salarieToEdit}
      />

      {/* Modal Règlement Rapide de Salaire */}
      <PaiementSalarieFormModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPreselectedSalarieForPayment(undefined);
        }}
        defaultSalarieId={preselectedSalarieForPayment}
        defaultPeriode={salairesAlerteRetard.moisEchu}
      />

      {/* Dialogue de Confirmation de Suppression */}
      <ConfirmDialog
        isOpen={!!salarieToDelete}
        title="Supprimer le salarié"
        message={`Êtes-vous sûr de vouloir supprimer le salarié ${salarieToDelete?.prenom} ${salarieToDelete?.nom} (${salarieToDelete?.id}) ?\nCette action est irréversible.`}
        confirmLabel="Supprimer définitivement"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setSalarieToDelete(null)}
      />
    </div>
  );
};
