import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Calendar,
  X,
  Building2,
  CheckCircle2,
  Clock,
  Wallet,
  Users,
  ChevronLeft,
  ChevronRight,
  FileText,
  Printer,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { PaiementSalarie, PaiementSalarieEnrichi, ModePaiementSalaire } from '../../../types';
import { formatDate, formatMontant } from '../../../utils/formatters';
import { PaiementSalarieFormModal } from './PaiementSalarieFormModal';
import { RecuPaiementSalarieModal } from './RecuPaiementSalarieModal';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { Pagination } from '../../common/Pagination';
import { exportToCsv } from '../../../utils/exportUtils';

interface PaiementsSalariesViewProps {
  initialMarcheFilter?: string | null;
}

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

export const PaiementsSalariesView: React.FC<PaiementsSalariesViewProps> = ({
  initialMarcheFilter,
}) => {
  const {
    marchesSalaires,
    salaries,
    paiementsSalairesEnrichis,
    deletePaiementSalarie,
    hasPermission,
    salairesAlerteRetard,
  } = useApp();

  // Navigation par Mois & Année
  // Par défaut, s'ouvre sur le mois de référence actif (Septembre 2026)
  const [selectedMoisIndex, setSelectedMoisIndex] = useState<number>(8); // 8 = Septembre
  const [selectedAnnee, setSelectedAnnee] = useState<number>(2026);
  const [isAllMonthsMode, setIsAllMonthsMode] = useState<boolean>(false);

  // Filtres complémentaires
  const [selectedMarcheId, setSelectedMarcheId] = useState<string>(
    initialMarcheFilter || 'all'
  );
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [paiementToEdit, setPaiementToEdit] = useState<PaiementSalarie | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [preselectedSalarieId, setPreselectedSalarieId] = useState<string | undefined>(undefined);
  const [paiementToDelete, setPaiementToDelete] = useState<PaiementSalarie | null>(null);
  const [selectedPaiementForRecu, setSelectedPaiementForRecu] = useState<PaiementSalarieEnrichi | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Libellé de la période courante
  const currentPeriodeLabel = `${MOIS_LIST[selectedMoisIndex]} ${selectedAnnee}`;

  // Gestion de la navigation mois précédent / suivant
  const handlePrevMonth = () => {
    setIsAllMonthsMode(false);
    setCurrentPage(1);
    if (selectedMoisIndex === 0) {
      setSelectedMoisIndex(11);
      setSelectedAnnee((prev) => prev - 1);
    } else {
      setSelectedMoisIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    setIsAllMonthsMode(false);
    setCurrentPage(1);
    if (selectedMoisIndex === 11) {
      setSelectedMoisIndex(0);
      setSelectedAnnee((prev) => prev + 1);
    } else {
      setSelectedMoisIndex((prev) => prev + 1);
    }
  };

  // Bascule directe sur le mois échu en retard pour régler immédiatement les salariés
  const handleJumpToRetardMonth = (moisEchu: string) => {
    setIsAllMonthsMode(false);
    const normalizeStr = (str: string) =>
      str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase() : '';
    const parts = moisEchu.trim().split(' ');
    if (parts.length >= 2) {
      const mIdx = MOIS_LIST.findIndex((m) => normalizeStr(m) === normalizeStr(parts[0]));
      const y = parseInt(parts[1], 10);
      if (mIdx !== -1) setSelectedMoisIndex(mIdx);
      if (!isNaN(y)) setSelectedAnnee(y);
    }
    setCurrentPage(1);

    if (salairesAlerteRetard.salariesEnRetard.length > 0) {
      setPreselectedSalarieId(salairesAlerteRetard.salariesEnRetard[0].id);
      setIsFormOpen(true);
    }
  };

  // Liste des périodes disponibles dans les paiements pour sélection rapide
  const distinctPeriodesInDb = useMemo(() => {
    const set = new Set<string>();
    paiementsSalairesEnrichis.forEach((p) => {
      if (p.periode) set.add(p.periode.trim());
    });
    return Array.from(set);
  }, [paiementsSalairesEnrichis]);

  // Filtrage principal des règlements
  const filteredPaiements = useMemo(() => {
    let result = paiementsSalairesEnrichis;

    // Filtre Période (Mois / Année)
    if (!isAllMonthsMode) {
      result = result.filter(
        (p) => p.periode.trim().toLowerCase() === currentPeriodeLabel.toLowerCase()
      );
    }

    // Filtre Marché
    if (selectedMarcheId !== 'all') {
      result = result.filter((p) => p.marcheSalaireId === selectedMarcheId);
    }

    // Filtre Mode
    if (selectedMode !== 'all') {
      result = result.filter((p) => p.mode === selectedMode);
    }

    // Recherche libre
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter((p) => {
        const salarieNom = p.salarie ? `${p.salarie.prenom} ${p.salarie.nom}`.toLowerCase() : '';
        const cin = p.salarie?.cin.toLowerCase() || '';
        const ref = p.reference.toLowerCase();
        const id = p.id.toLowerCase();
        const per = p.periode.toLowerCase();
        const marcheRef = p.marcheSalaire?.reference.toLowerCase() || '';
        const lieu = p.salarie?.lieuAffectation.toLowerCase() || '';
        return (
          salarieNom.includes(term) ||
          cin.includes(term) ||
          ref.includes(term) ||
          id.includes(term) ||
          per.includes(term) ||
          marcheRef.includes(term) ||
          lieu.includes(term)
        );
      });
    }

    return result;
  }, [
    paiementsSalairesEnrichis,
    isAllMonthsMode,
    currentPeriodeLabel,
    selectedMarcheId,
    selectedMode,
    searchTerm,
  ]);

  const paginatedPaiements = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPaiements.slice(start, start + pageSize);
  }, [filteredPaiements, currentPage, pageSize]);

  // Salariés rattachés / actifs pour le contexte (selon marché sélectionné)
  const effectifEligible = useMemo(() => {
    if (selectedMarcheId === 'all') {
      return salaries;
    }
    // Salariés ayant déjà été payés sur ce marché ou tout l'effectif
    const salariesOnMarket = new Set(
      paiementsSalairesEnrichis
        .filter((p) => p.marcheSalaireId === selectedMarcheId)
        .map((p) => p.salarieId)
    );
    const filtered = salaries.filter((s) => salariesOnMarket.has(s.id));
    return filtered.length > 0 ? filtered : salaries;
  }, [salaries, selectedMarcheId, paiementsSalairesEnrichis]);

  // Salariés ayant déjà reçu leur salaire pour la période sélectionnée
  const salariesPayesCeMoisIds = useMemo(() => {
    const relevantPaiements = isAllMonthsMode
      ? paiementsSalairesEnrichis
      : paiementsSalairesEnrichis.filter(
          (p) => p.periode.trim().toLowerCase() === currentPeriodeLabel.toLowerCase()
        );
    return new Set(relevantPaiements.map((p) => p.salarieId));
  }, [paiementsSalairesEnrichis, isAllMonthsMode, currentPeriodeLabel]);

  // Salariés en attente de paiement pour ce mois
  const salariesEnAttente = useMemo(() => {
    if (isAllMonthsMode) return [];
    return effectifEligible.filter((s) => !salariesPayesCeMoisIds.has(s.id));
  }, [effectifEligible, salariesPayesCeMoisIds, isAllMonthsMode]);

  // ==================== CALCULS KPI DYNAMIQUES ====================
  // 1. Total décaissé pour la sélection
  const totalDecaisse = useMemo(() => {
    return filteredPaiements.reduce((acc, p) => acc + p.montant, 0);
  }, [filteredPaiements]);

  // 2. Nombre de salariés payés pour le mois sélectionné
  const nbSalariesPayes = useMemo(() => {
    const distinctIds = new Set(filteredPaiements.map((p) => p.salarieId));
    return distinctIds.size;
  }, [filteredPaiements]);

  const totalEffectifRef = effectifEligible.length;
  const tauxCouverturePaie =
    totalEffectifRef > 0 ? Math.round((nbSalariesPayes / totalEffectifRef) * 100) : 0;

  // 3. Masse salariale prévisionnelle
  const masseSalarialePrevisionnelle = useMemo(() => {
    return effectifEligible.reduce((acc, s) => acc + (s.salaireBase || 0), 0);
  }, [effectifEligible]);

  // 4. Reste à décaisser pour le mois
  const resteADecaisserMois = Math.max(0, masseSalarialePrevisionnelle - totalDecaisse);

  // ==================== RÈGLE STRICTE SEUIL D'ALERTE (JOUR >= 2 DU MOIS M+1) ====================
  // Date seuil de début d'alerte pour le mois sélectionné M : le 2 du mois suivant M+1
  // Ex: pour Septembre 2026 (selectedMoisIndex = 8, selectedAnnee = 2026) -> 02/10/2026 à 00:00:00
  const dateSeuilEcheance = useMemo(() => {
    return new Date(selectedAnnee, selectedMoisIndex + 1, 2, 0, 0, 0, 0);
  }, [selectedAnnee, selectedMoisIndex]);

  // Vérification dynamique si la date courante a atteint ou dépassé le 2 du mois suivant
  const isEcheanceDepassee = useMemo(() => {
    const now = new Date();
    return now.getTime() >= dateSeuilEcheance.getTime();
  }, [dateSeuilEcheance]);

  // Alerte de retard active STRICTEMENT si :
  // - Mode mois sélectionné spécifique (!isAllMonthsMode)
  // - Échéance du 2 du mois M+1 atteinte ou dépassée (isEcheanceDepassee === true)
  // - Il reste au moins un salarié non encore réglé pour ce mois (salariesEnAttente.length > 0)
  const isAlerteRetardActive = useMemo(() => {
    return !isAllMonthsMode && isEcheanceDepassee && salariesEnAttente.length > 0;
  }, [isAllMonthsMode, isEcheanceDepassee, salariesEnAttente.length]);

  const handleExportCsv = () => {
    const headers = [
      'ID Paiement',
      'Matricule Salarié',
      'Salarié Nom & Prénom',
      'CIN',
      'Lieu d’Affectation',
      'Marché Réf',
      'Période / Mois',
      'Date Règlement',
      'Mode de Règlement',
      'Référence Transaction',
      'Montant Versé (DH)',
      'Statut',
      'Observation',
    ];

    const rows = filteredPaiements.map((p) => [
      p.id,
      p.salarieId,
      p.salarie ? `${p.salarie.prenom} ${p.salarie.nom}` : '',
      p.salarie?.cin || '',
      p.salarie?.lieuAffectation || '',
      p.marcheSalaire?.reference || p.marcheSalaireId,
      p.periode,
      p.date,
      p.mode,
      p.reference,
      p.montant,
      'Payé',
      p.observation || '',
    ]);

    const prefix = isAllMonthsMode
      ? 'paiements_salaires_global'
      : `paiements_salaires_${currentPeriodeLabel.replace(/\s+/g, '_')}`;

    exportToCsv(prefix, headers, rows);
  };

  const handleConfirmDelete = () => {
    if (!paiementToDelete) return;
    deletePaiementSalarie(paiementToDelete.id);
    setPaiementToDelete(null);
  };

  const handleQuickPaySalarie = (salarieId: string) => {
    setPreselectedSalarieId(salarieId);
    setPaiementToEdit(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 0. Bandeau d'alerte orange contextuel - Uniquement dès le 2 du mois suivant M+1 et s'il reste des impayés */}
      {isAlerteRetardActive ? (
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
                  Règlement exigible depuis le 02/{String(selectedMoisIndex === 11 ? 1 : selectedMoisIndex + 2).padStart(2, '0')}/{selectedMoisIndex === 11 ? selectedAnnee + 1 : selectedAnnee}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-amber-950 mt-1 leading-snug">
                ⚠️ Règlement des salaires en attente : {salariesEnAttente.length} salarié(s) n'ont pas encore été réglés pour le mois de {currentPeriodeLabel}
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Salarié(s) concerné(s) :{' '}
                <span className="font-semibold text-amber-950">
                  {salariesEnAttente
                    .map((s) => `${s.prenom} ${s.nom} (${s.specialite})`)
                    .join(', ')}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (salariesEnAttente.length > 0) {
                  handleQuickPaySalarie(salariesEnAttente[0].id);
                }
              }}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Régler maintenant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : isAllMonthsMode && salairesAlerteRetard.isRetard ? (
        <div className="bg-amber-50/95 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2 py-0.5 rounded border border-amber-300">
                  Vue Globale · Salaires Échus en Retard
                </span>
                <span className="text-xs text-amber-800 font-medium">
                  Règlement exigible dès le 2 du mois échu
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-amber-950 mt-1 leading-snug">
                ⚠️ Règlement des salaires en attente : {salairesAlerteRetard.nbSalariesEnRetard} salarié(s) n'ont pas encore été réglés pour le mois de {salairesAlerteRetard.moisEchu}
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Salarié(s) concerné(s) :{' '}
                <span className="font-semibold text-amber-950">
                  {salairesAlerteRetard.salariesEnRetard
                    .map((s) => `${s.prenom} ${s.nom} (${s.specialite})`)
                    .join(', ')}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleJumpToRetardMonth(salairesAlerteRetard.moisEchu)}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Régler maintenant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : null}

      {/* 1. Barre Supérieure : Sélecteur & Navigation par Mois / Année */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Contrôles Mois & Année */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100/90 border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
              title="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Affichage & Sélecteur du Mois */}
            <div className="flex items-center gap-1.5 px-3">
              <Calendar className="w-4 h-4 text-teal-600" />
              <select
                value={selectedMoisIndex}
                onChange={(e) => {
                  setSelectedMoisIndex(parseInt(e.target.value, 10));
                  setIsAllMonthsMode(false);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-sm font-bold text-slate-800 cursor-pointer focus:outline-hidden py-1"
              >
                {MOIS_LIST.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={selectedAnnee}
                onChange={(e) => {
                  setSelectedAnnee(parseInt(e.target.value, 10));
                  setIsAllMonthsMode(false);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-sm font-bold text-slate-800 cursor-pointer focus:outline-hidden py-1 font-mono"
              >
                {[2025, 2026, 2027, 2028].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
              title="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bouton de bascule "Tous les mois" */}
          <button
            type="button"
            onClick={() => {
              setIsAllMonthsMode(!isAllMonthsMode);
              setCurrentPage(1);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isAllMonthsMode
                ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isAllMonthsMode ? '✓ Vue Globale (Tous les mois)' : 'Afficher tous les mois'}
          </button>

          {/* Indication visuelle de la période active */}
          {!isAllMonthsMode && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              Paie : {currentPeriodeLabel}
            </span>
          )}
        </div>

        {/* Boutons Nouveau Paiement & Export Excel */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel / CSV</span>
          </button>

          {hasPermission('Gestionnaire') && (
            <button
              type="button"
              onClick={() => {
                setPreselectedSalarieId(undefined);
                setPaiementToEdit(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nouveau Règlement
            </button>
          )}
        </div>
      </div>

      {/* 2. Cartes KPI Dynamiques Synchronisées avec le Mois Sélectionné */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Total Décaissé */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              {isAllMonthsMode ? 'Total Décaissé (Tous Mois)' : `Décaissé en ${MOIS_LIST[selectedMoisIndex]}`}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-teal-700 font-mono">
                {formatMontant(totalDecaisse)}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {filteredPaiements.length} règlement(s) comptabilisé(s)
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 : Salariés Payés vs Effectif */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Salariés Rémunérés
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-700 font-mono">
                {nbSalariesPayes}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                / {totalEffectifRef} salariés ({tauxCouverturePaie}%)
              </span>
            </div>
            <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, tauxCouverturePaie)}%` }}
              />
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 : Masse Salariale Prévisionnelle vs Réglée */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Masse Salariale Prévue
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {formatMontant(masseSalarialePrevisionnelle)}
              </span>
            </div>
            <span className="text-[11px] text-teal-700 font-medium block mt-0.5">
              Réglé : {formatMontant(totalDecaisse)}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 : Solde Restant / Retard */}
        {isAlerteRetardActive ? (
          // ÉTAT D'ALERTE ORANGE : Échéance dépassée (Jour >= 2 du mois suivant) ET reste à payer
          <div className="bg-white border-2 border-amber-400 rounded-xl p-4.5 shadow-xs flex items-center justify-between animate-in fade-in duration-200">
            <div>
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                SOLDE EN ATTENTE
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-amber-700">
                  {formatMontant(resteADecaisserMois)}
                </span>
              </div>
              <span className="text-[11px] text-amber-800 font-medium block mt-0.5">
                ⚠️ {salariesEnAttente.length} salarié(s) en retard
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        ) : resteADecaisserMois === 0 ? (
          // ÉTAT VALIDÉ NORMAL : 100% des salariés soldés
          <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Mois Entièrement Réglé
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-emerald-700">
                  0 DH
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">
                ✓ 100% des effectifs soldés
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        ) : (
          // ÉTAT DE GESTION NORMALE : Date antérieure au seuil (ex: 27/09/2026 pour Septembre) -> 0 DH d'impayé en retard
          <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Mois en Cours de Gestion
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-slate-700">
                  0 DH <span className="text-xs font-normal text-slate-400">impayé</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                Échéance au 02/{String(selectedMoisIndex === 11 ? 1 : selectedMoisIndex + 2).padStart(2, '0')} · Gestion normale
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
              <Calendar className="w-5 h-5 text-slate-500" />
            </div>
          </div>
        )}
      </div>

      {/* 4. Filtres de Recherche et Sélection de Marché */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Rechercher par salarié, CIN, référence transaction..."
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

          {/* Filtre par Marché */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
              Marché :
            </span>
            <select
              value={selectedMarcheId}
              onChange={(e) => {
                setSelectedMarcheId(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium text-slate-700 max-w-[220px] truncate"
            >
              <option value="all">Tous les marchés</option>
              {marchesSalaires.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.reference} — {m.objet.slice(0, 30)}...
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par Mode de Paiement */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
              Mode :
            </span>
            <select
              value={selectedMode}
              onChange={(e) => {
                setSelectedMode(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
            >
              <option value="all">Tous les modes</option>
              <option value="Virement">Virement</option>
              <option value="Chèque">Chèque</option>
              <option value="Espèces">Espèces</option>
            </select>
          </div>
        </div>

        {/* Période active / Compteur */}
        <div className="text-xs text-slate-500 font-medium">
          {filteredPaiements.length} règlement(s) affiché(s)
        </div>
      </div>

      {/* 5. Tableau Récapitulatif Mensuel avec Ligne de Totalisation */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Salarié (Nom, Prénom, CIN)</th>
                <th className="py-3 px-4">Marché Rattaché</th>
                <th className="py-3 px-4">Lieu d'Affectation</th>
                <th className="py-3 px-4">Période / Mois</th>
                <th className="py-3 px-4">Date Effective</th>
                <th className="py-3 px-4">Mode de Règlement</th>
                <th className="py-3 px-4">N° Transaction / Reçu</th>
                <th className="py-3 px-4 text-right">Montant Versé</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPaiements.length === 0 && (!salariesEnAttente || salariesEnAttente.length === 0) ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <CreditCard className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">
                        Aucun paiement enregistré pour cette sélection
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isAllMonthsMode
                          ? 'Modifiez vos critères de recherche ou enregistrez un versement.'
                          : `Aucun versement n'a encore été effectué pour le mois de ${currentPeriodeLabel}.`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {paginatedPaiements.map((paiement) => {
                    const salarie = paiement.salarie;
                    const marche = paiement.marcheSalaire;

                    return (
                      <tr
                        key={paiement.id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* Salarié */}
                        <td className="py-3 px-4">
                          {salarie ? (
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
                                {salarie.prenom.charAt(0)}
                                {salarie.nom.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {salarie.prenom} {salarie.nom}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono block">
                                  CIN : {salarie.cin} · {salarie.specialite}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="font-mono text-slate-400">
                              {paiement.salarieId}
                            </span>
                          )}
                        </td>

                        {/* Marché */}
                        <td className="py-3 px-4">
                          {marche ? (
                            <div>
                              <span className="font-mono font-bold text-slate-800 text-[11px] block">
                                {marche.reference}
                              </span>
                              <span
                                className="text-[10px] text-slate-500 truncate max-w-[170px] block"
                                title={marche.objet}
                              >
                                {marche.objet}
                              </span>
                            </div>
                          ) : (
                            <span className="font-mono text-slate-400">
                              {paiement.marcheSalaireId}
                            </span>
                          )}
                        </td>

                        {/* Lieu d'affectation */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {salarie?.lieuAffectation === 'Autre'
                              ? salarie?.lieuAffectationAutre || 'Autre'
                              : salarie?.lieuAffectation || '—'}
                          </span>
                        </td>

                        {/* Période / Mois */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">
                            {paiement.periode}
                          </span>
                        </td>

                        {/* Date effective de versement */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className="tabular-nums">{formatDate(paiement.date)}</span>
                          </div>
                        </td>

                        {/* Mode de règlement */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              paiement.mode === 'Virement'
                                ? 'bg-blue-100 text-blue-800'
                                : paiement.mode === 'Chèque'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {paiement.mode}
                          </span>
                        </td>

                        {/* N° Transaction / Reçu */}
                        <td className="py-3 px-4">
                          <span className="font-mono text-[11px] font-semibold text-slate-800 block">
                            {paiement.reference}
                          </span>
                          <span className="font-mono text-[9px] text-slate-400">
                            {paiement.id}
                          </span>
                        </td>

                        {/* Montant Versé */}
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-bold text-teal-700 text-sm block">
                            {formatMontant(paiement.montant)}
                          </span>
                        </td>

                        {/* Statut */}
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Payé
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* Bouton Reçu officiel / Justificatif */}
                            <button
                              type="button"
                              onClick={() => setSelectedPaiementForRecu(paiement)}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors cursor-pointer"
                              title="Consulter / Imprimer le reçu"
                            >
                              <FileText className="w-4 h-4 text-teal-700" />
                            </button>

                            {hasPermission('Gestionnaire') && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPaiementToEdit(paiement);
                                  setIsFormOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                title="Modifier le règlement"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            {hasPermission('Administrateur') && (
                              <button
                                type="button"
                                onClick={() => setPaiementToDelete(paiement)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                title="Supprimer le règlement"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* LIGNES DES SALARIÉS EN ATTENTE DE RÈGLEMENT */}
                  {!isAllMonthsMode &&
                    currentPage === 1 &&
                    salariesEnAttente.map((salarie) => {
                      const marcheDefaut =
                        marchesSalaires.find((m) => m.id === selectedMarcheId) ||
                        marchesSalaires[0];

                      return (
                        <tr
                          key={`en-attente-${salarie.id}`}
                          className={`transition-colors ${
                            isEcheanceDepassee
                              ? 'bg-amber-50/40 hover:bg-amber-50/80 border-l-4 border-l-amber-400'
                              : 'hover:bg-slate-50/80 border-l-4 border-l-slate-200'
                          }`}
                        >
                          {/* Salarié */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                                  isEcheanceDepassee
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {salarie.prenom.charAt(0)}
                                {salarie.nom.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {salarie.prenom} {salarie.nom}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono block">
                                  CIN : {salarie.cin} · {salarie.specialite}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Marché rattaché */}
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs text-slate-700">
                              {marcheDefaut ? marcheDefaut.reference : 'Non rattaché'}
                            </span>
                          </td>

                          {/* Lieu */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {salarie.lieuAffectation}
                            </span>
                          </td>

                          {/* Période */}
                          <td className="py-3 px-4 font-semibold text-slate-700">
                            {currentPeriodeLabel}
                          </td>

                          {/* Date effective */}
                          <td className="py-3 px-4">
                            {isEcheanceDepassee ? (
                              <span className="text-amber-700 italic font-medium flex items-center gap-1 text-[11px]">
                                <Clock className="w-3 h-3 text-amber-500" />
                                En retard
                              </span>
                            ) : (
                              <span className="text-slate-500 font-medium flex items-center gap-1 text-[11px]">
                                <Clock className="w-3 h-3 text-slate-400" />
                                À planifier
                              </span>
                            )}
                          </td>

                          {/* Mode */}
                          <td className="py-3 px-4 text-slate-400">—</td>

                          {/* N° Transaction */}
                          <td className="py-3 px-4 text-slate-400 font-mono text-[10px]">
                            Non émis
                          </td>

                          {/* Montant prévu */}
                          <td className="py-3 px-4 text-right">
                            <span
                              className={`font-mono font-bold text-sm block ${
                                isEcheanceDepassee ? 'text-amber-800' : 'text-slate-700'
                              }`}
                            >
                              {formatMontant(salarie.salaireBase || 0)}
                            </span>
                            <span
                              className={`text-[10px] ${
                                isEcheanceDepassee ? 'text-amber-700' : 'text-slate-400'
                              }`}
                            >
                              {isEcheanceDepassee ? 'en attente' : 'prévu'}
                            </span>
                          </td>

                          {/* Statut : Orange "En attente de règlement" si échéance atteinte, Neutre "En cours" si antérieur */}
                          <td className="py-3 px-4 text-center">
                            {isEcheanceDepassee ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                <Clock className="w-3 h-3 text-amber-600" />
                                En attente de règlement
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                <Clock className="w-3 h-3 text-slate-400" />
                                En cours
                              </span>
                            )}
                          </td>

                          {/* Action Régler */}
                          <td className="py-3 px-4 text-center">
                            {hasPermission('Gestionnaire') && (
                              <button
                                type="button"
                                onClick={() => handleQuickPaySalarie(salarie.id)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] shadow-2xs transition-colors cursor-pointer flex items-center gap-1 mx-auto ${
                                  isEcheanceDepassee
                                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                                    : 'bg-teal-600 hover:bg-teal-700 text-white font-medium'
                                }`}
                                title={
                                  isEcheanceDepassee
                                    ? 'Régler le salaire en retard de ce collaborateur'
                                    : 'Enregistrer le règlement de ce collaborateur'
                                }
                              >
                                <CreditCard className="w-3 h-3" />
                                <span>Régler</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </>
              )}
            </tbody>

            {/* LIGNE DE TOTALISATION EN BAS DU TABLEAU */}
            {filteredPaiements.length > 0 && (
              <tfoot className="bg-slate-100/95 border-t-2 border-slate-300 font-bold text-slate-900 text-xs">
                <tr>
                  <td colSpan={3} className="py-3.5 px-4 uppercase tracking-wider">
                    Total Déboursé ({isAllMonthsMode ? 'Vue Globale' : currentPeriodeLabel})
                  </td>
                  <td colSpan={4} className="py-3.5 px-4 text-slate-500 text-[11px] font-normal">
                    {filteredPaiements.length} règlement(s) · {nbSalariesPayes} salarié(s) bénéficiaire(s)
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-base text-teal-800 font-black">
                    {formatMontant(totalDecaisse)}
                  </td>
                  <td colSpan={2} className="py-3.5 px-4 text-center">
                    <span className="text-[11px] text-emerald-800 font-bold">
                      Soldé
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-slate-200 px-4 py-3">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredPaiements.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal Formulaire Paiement */}
      <PaiementSalarieFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setPaiementToEdit(null);
          setPreselectedSalarieId(undefined);
        }}
        paiementToEdit={paiementToEdit}
        defaultSalarieId={preselectedSalarieId}
        defaultMarcheId={selectedMarcheId !== 'all' ? selectedMarcheId : undefined}
        defaultPeriode={isAllMonthsMode ? 'Septembre 2026' : currentPeriodeLabel}
      />

      {/* Modal Reçu de Règlement */}
      {selectedPaiementForRecu && (
        <RecuPaiementSalarieModal
          paiement={selectedPaiementForRecu}
          onClose={() => setSelectedPaiementForRecu(null)}
        />
      )}

      {/* Dialogue de Confirmation de Suppression */}
      <ConfirmDialog
        isOpen={!!paiementToDelete}
        title="Supprimer le règlement salarié"
        message={`Êtes-vous sûr de vouloir supprimer le paiement de ${
          paiementToDelete ? formatMontant(paiementToDelete.montant) : ''
        } (${paiementToDelete?.periode}) versé au salarié ?\nCette action modifiera immédiatement la masse salariale décaissée.`}
        confirmLabel="Supprimer définitivement"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setPaiementToDelete(null)}
      />
    </div>
  );
};
