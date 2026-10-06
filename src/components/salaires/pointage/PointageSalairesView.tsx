import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Palmtree,
  Users,
  Search,
  Filter,
  FileSpreadsheet,
  Building2,
  CalendarCheck2,
  Info,
  CalendarDays,
  UserCheck,
} from 'lucide-react';
import { StatutPointage, Pointage, LieuAffectationSalarie } from '../../../types';
import { exportToCsv } from '../../../utils/exportUtils';
import { formatDate } from '../../../utils/formatters';

const LIEUX_OPTIONS: (LieuAffectationSalarie | 'all')[] = [
  'all',
  'Centre pédagogique',
  'Laboratoire',
  'Administration',
  "Centre d'Excellence",
  'Autre',
];

const MOIS_NOMS = [
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

export const PointageSalairesView: React.FC = () => {
  const {
    salaries,
    marchesSalaires,
    pointages,
    setPointage,
    setMultiplePointages,
    addToast,
    hasPermission,
  } = useApp();

  // Mode de visualisation : 'jour' | 'mensuel'
  const [viewMode, setViewMode] = useState<'jour' | 'mensuel'>('jour');

  // Date sélectionnée pour le pointage journalier (par défaut aujourd'hui YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  // Filtres pour le pointage
  const [selectedMarche, setSelectedMarche] = useState<string>('all');
  const [selectedLieu, setSelectedLieu] = useState<LieuAffectationSalarie | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Mois sélectionné pour la vue mensuelle récapitulative
  const [selectedMoisIndex, setSelectedMoisIndex] = useState<number>(() => {
    return new Date().getMonth(); // 0-11 (8 = Septembre)
  });
  const [selectedAnnee, setSelectedAnnee] = useState<number>(() => {
    return new Date().getFullYear();
  });

  // Feedback visuel d'enregistrement instantané
  const [savedRowIds, setSavedRowIds] = useState<Set<string>>(new Set());

  // Navigation par jour
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  // Navigation par mois (pour la vue récapitulative)
  const handlePrevMonth = () => {
    if (selectedMoisIndex === 0) {
      setSelectedMoisIndex(11);
      setSelectedAnnee((prev) => prev - 1);
    } else {
      setSelectedMoisIndex((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMoisIndex === 11) {
      setSelectedMoisIndex(0);
      setSelectedAnnee((prev) => prev + 1);
    } else {
      setSelectedMoisIndex((prev) => prev + 1);
    }
  };

  // Dictionnaire des marchés pour affichage rapide
  const marchesMap = useMemo(() => {
    return new Map(marchesSalaires.map((m) => [m.id, m]));
  }, [marchesSalaires]);

  // Pointages pour la date sélectionnée
  const pointagesDuJourMap = useMemo(() => {
    const map = new Map<string, Pointage>();
    pointages.forEach((p) => {
      if (p.date === selectedDate) {
        map.set(p.salarie_id, p);
      }
    });
    return map;
  }, [pointages, selectedDate]);

  // Filtrage des salariés
  const filteredSalaries = useMemo(() => {
    return salaries.filter((s) => {
      // Filtre marché
      if (selectedMarche !== 'all') {
        const salarieMarcheId = s.marcheSalaireId;
        if (salarieMarcheId !== selectedMarche) return false;
      }

      // Filtre lieu d'affectation
      if (selectedLieu !== 'all') {
        if (s.lieuAffectation !== selectedLieu) return false;
      }

      // Recherche texte
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchNom = s.nom.toLowerCase().includes(q);
        const matchPrenom = s.prenom.toLowerCase().includes(q);
        const matchCin = s.cin?.toLowerCase().includes(q);
        const matchSpecialite = s.specialite.toLowerCase().includes(q);
        const matchId = s.id.toLowerCase().includes(q);
        if (!matchNom && !matchPrenom && !matchCin && !matchSpecialite && !matchId) {
          return false;
        }
      }

      return true;
    });
  }, [salaries, selectedMarche, selectedLieu, searchTerm]);

  // Indicateurs KPI du jour pour l'effectif affiché
  const kpisDuJour = useMemo(() => {
    const totalEffectif = filteredSalaries.length;
    let presents = 0;
    let absencesAutorisees = 0;
    let absencesNonAutorisees = 0;
    let conges = 0;
    let nonPointes = 0;

    filteredSalaries.forEach((s) => {
      const ptg = pointagesDuJourMap.get(s.id);
      if (!ptg) {
        nonPointes += 1;
      } else if (ptg.statut === 'PRESENT') {
        presents += 1;
      } else if (ptg.statut === 'ABSENCE_AUTORISEE') {
        absencesAutorisees += 1;
      } else if (ptg.statut === 'ABSENCE_NON_AUTORISEE') {
        absencesNonAutorisees += 1;
      } else if (ptg.statut === 'CONGE') {
        conges += 1;
      }
    });

    const tauxPresence = totalEffectif > 0 ? Math.round((presents / totalEffectif) * 100) : 0;

    return {
      totalEffectif,
      presents,
      absencesAutorisees,
      absencesNonAutorisees,
      conges,
      nonPointes,
      tauxPresence,
    };
  }, [filteredSalaries, pointagesDuJourMap]);

  // Action rapide : "Tous Présents" pour les salariés filtrés
  const handleTousPresents = () => {
    if (!hasPermission('Gestionnaire')) {
      addToast({
        type: 'warning',
        message: 'Action non autorisée',
        description: 'Vous n\'avez pas les habilitations nécessaires pour modifier le pointage.',
      });
      return;
    }

    if (filteredSalaries.length === 0) return;

    const listToUpdate = filteredSalaries.map((s) => ({
      salarie_id: s.id,
      date: selectedDate,
      statut: 'PRESENT' as StatutPointage,
      motif: undefined,
    }));

    setMultiplePointages(listToUpdate);

    // Mettre en surbrillance temporaire
    const newSaved = new Set(filteredSalaries.map((s) => s.id));
    setSavedRowIds(newSaved);
    setTimeout(() => setSavedRowIds(new Set()), 2000);

    addToast({
      type: 'success',
      message: 'Pointage collectif effectué',
      description: `${filteredSalaries.length} salarié(s) marqués comme "Présent" le ${formatDate(selectedDate)}.`,
    });
  };

  // Modification immédiate d'un pointage individuel
  const handleStatutChange = (salarieId: string, newStatut: StatutPointage) => {
    if (!hasPermission('Gestionnaire')) {
      addToast({
        type: 'warning',
        message: 'Action non autorisée',
        description: 'Profil en consultation uniquement.',
      });
      return;
    }

    const currentPtg = pointagesDuJourMap.get(salarieId);
    setPointage({
      salarie_id: salarieId,
      date: selectedDate,
      statut: newStatut,
      motif: newStatut === 'PRESENT' ? undefined : currentPtg?.motif,
    });

    setSavedRowIds((prev) => new Set(prev).add(salarieId));
    setTimeout(() => {
      setSavedRowIds((prev) => {
        const copy = new Set(prev);
        copy.delete(salarieId);
        return copy;
      });
    }, 1500);
  };

  // Modification du motif / justificatif
  const handleMotifChange = (salarieId: string, motif: string) => {
    if (!hasPermission('Gestionnaire')) return;

    const currentPtg = pointagesDuJourMap.get(salarieId);
    const statut = currentPtg?.statut || 'ABSENCE_AUTORISEE';

    setPointage({
      salarie_id: salarieId,
      date: selectedDate,
      statut,
      motif,
    });
  };

  // Calcul du récapitulatif mensuel par salarié
  const recapitulatifMensuel = useMemo(() => {
    // Clé de mois YYYY-MM
    const monthKey = `${selectedAnnee}-${String(selectedMoisIndex + 1).padStart(2, '0')}`;

    return filteredSalaries.map((s) => {
      const salariePointages = pointages.filter(
        (p) => p.salarie_id === s.id && p.date.startsWith(monthKey)
      );

      let joursPresents = 0;
      let absencesAutorisees = 0;
      let absencesNonAutorisees = 0;
      let conges = 0;

      salariePointages.forEach((p) => {
        if (p.statut === 'PRESENT') joursPresents += 1;
        else if (p.statut === 'ABSENCE_AUTORISEE') absencesAutorisees += 1;
        else if (p.statut === 'ABSENCE_NON_AUTORISEE') absencesNonAutorisees += 1;
        else if (p.statut === 'CONGE') conges += 1;
      });

      const totalJoursPointes = salariePointages.length;
      const tauxAssiduite =
        totalJoursPointes > 0 ? Math.round((joursPresents / totalJoursPointes) * 100) : 0;

      const marcheSalaire = s.marcheSalaireId ? marchesMap.get(s.marcheSalaireId) : undefined;

      return {
        salarie: s,
        marcheSalaire,
        joursPresents,
        absencesAutorisees,
        absencesNonAutorisees,
        conges,
        totalJoursPointes,
        tauxAssiduite,
      };
    });
  }, [filteredSalaries, pointages, selectedAnnee, selectedMoisIndex, marchesMap]);

  // Export CSV du pointage journalier
  const handleExportJournalierCsv = () => {
    const headers = [
      'Matricule',
      'Nom',
      'Prénom',
      'CIN',
      'Marché Rattaché',
      "Lieu d'Affectation",
      'Date',
      'Statut Présence',
      'Motif / Justificatif',
    ];

    const rows = filteredSalaries.map((s) => {
      const ptg = pointagesDuJourMap.get(s.id);
      const marcheRef = s.marcheSalaireId
        ? marchesMap.get(s.marcheSalaireId)?.reference || s.marcheSalaireId
        : 'Non affecté';

      return [
        s.id,
        s.nom,
        s.prenom,
        s.cin || '',
        marcheRef,
        s.lieuAffectation === 'Autre' ? s.lieuAffectationAutre || 'Autre' : s.lieuAffectation,
        selectedDate,
        ptg ? ptg.statut : 'NON_POINTE',
        ptg?.motif || '',
      ];
    });

    exportToCsv(`pointage_salaries_${selectedDate}`, headers, rows);
  };

  // Export CSV du récapitulatif mensuel
  const handleExportMensuelCsv = () => {
    const headers = [
      'Matricule',
      'Nom',
      'Prénom',
      'CIN',
      'Marché',
      "Lieu d'Affectation",
      'Mois',
      'Jours Présents',
      'Absences Autorisées',
      'Absences Non Autorisées',
      'En Congé',
      'Total Jours Pointés',
      "Taux d'Assiduité (%)",
    ];

    const moisLabel = `${MOIS_NOMS[selectedMoisIndex]} ${selectedAnnee}`;

    const rows = recapitulatifMensuel.map((item) => [
      item.salarie.id,
      item.salarie.nom,
      item.salarie.prenom,
      item.salarie.cin || '',
      item.marcheSalaire?.reference || '—',
      item.salarie.lieuAffectation === 'Autre'
        ? item.salarie.lieuAffectationAutre || 'Autre'
        : item.salarie.lieuAffectation,
      moisLabel,
      item.joursPresents,
      item.absencesAutorisees,
      item.absencesNonAutorisees,
      item.conges,
      item.totalJoursPointes,
      `${item.tauxAssiduite}%`,
    ]);

    exportToCsv(`recapitulatif_assiduite_${selectedAnnee}_${selectedMoisIndex + 1}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* 0. En-tête : Commutateur de Mode (Jour / Mensuel) & Titre de Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 shadow-2xs">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded border border-teal-200">
                Gestion des Salaires · Assiduité
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Suivi Quotidien & Pointage
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Pointage & Présence des Salariés
            </h2>
          </div>
        </div>

        {/* Boutons Segmentés : Jour / Récapitulatif Mensuel */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('jour')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'jour'
                ? 'bg-white text-teal-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Feuille du Jour</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mensuel')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'mensuel'
                ? 'bg-white text-teal-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Récapitulatif Mensuel</span>
          </button>
        </div>
      </div>

      {/* 1. Bandeau Info : Indépendance et neutralité vis-à-vis des salaires */}
      <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-3 sm:p-3.5 flex items-start gap-3 text-xs text-sky-900">
        <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Suivi d'assiduité indicatif :</span> Les pointages quotidiens
          (présences, absences autorisées, non autorisées et congés) permettent le suivi opérationnel
          des équipes sur site.{' '}
          <span className="font-semibold text-sky-950">
            Ils n'impactent ni ne déduisent automatiquement aucun montant dans le module des
            paiements de salaires.
          </span>
        </div>
      </div>

      {/* VUE 1 : FEUILLE DE POINTAGE DU JOUR */}
      {viewMode === 'jour' && (
        <>
          {/* Navigation Temporelle Journalière */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Commandes de date */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrevDay}
                  title="Jour précédent"
                  className="p-2 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer border-r border-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-3.5 py-1.5 bg-slate-50 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      if (e.target.value) setSelectedDate(e.target.value);
                    }}
                    className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleNextDay}
                  title="Jour suivant"
                  className="p-2 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer border-l border-slate-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Bouton Aujourd'hui */}
              <button
                type="button"
                onClick={handleSetToday}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200"
              >
                Aujourd'hui
              </button>

              <span className="text-xs font-bold text-slate-600 ml-1 hidden sm:inline">
                {formatDate(selectedDate)}
              </span>
            </div>

            {/* Action Collective Rapide : Tous Présents & Export */}
            <div className="flex items-center gap-2.5">
              {hasPermission('Gestionnaire') && (
                <button
                  type="button"
                  onClick={handleTousPresents}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  title="Marquer tous les salariés actuellement filtrés comme Présents pour cette date"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Tous Présents</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportJournalierCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Exporter CSV</span>
              </button>
            </div>
          </div>

          {/* Cartes KPI du Jour (Présents, Absences, Congés) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* KPI 1 : Effectif Total */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Effectif Attendu
                </span>
                <span className="text-2xl font-bold font-mono text-slate-800 mt-1 block">
                  {kpisDuJour.totalEffectif}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Salarié(s) filtré(s)
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                <Users className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 2 : Présents */}
            <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Présents
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-bold font-mono text-emerald-700">
                    {kpisDuJour.presents}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">
                    ({kpisDuJour.tauxPresence}%)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-600 block mt-0.5">
                  Assiduité validée
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 3 : Absences Autorisées */}
            <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                  Abs. Autorisée
                </span>
                <span className="text-2xl font-bold font-mono text-amber-700 mt-1 block">
                  {kpisDuJour.absencesAutorisees}
                </span>
                <span className="text-[10px] text-amber-700 block mt-0.5">
                  Justifiée / Mission
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 4 : Absences Non Autorisées */}
            <div className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider block">
                  Non Autorisée
                </span>
                <span className="text-2xl font-bold font-mono text-rose-700 mt-1 block">
                  {kpisDuJour.absencesNonAutorisees}
                </span>
                <span className="text-[10px] text-rose-600 block mt-0.5">
                  Absence non justifiée
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* KPI 5 : En Congé */}
            <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
              <div>
                <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
                  En Congé
                </span>
                <span className="text-2xl font-bold font-mono text-blue-700 mt-1 block">
                  {kpisDuJour.conges}
                </span>
                <span className="text-[10px] text-blue-600 block mt-0.5">
                  Congé réglementaire
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                <Palmtree className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filtres : Recherche, Marché et Lieu d'Affectation */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
              {/* Barre de recherche */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom, CIN, matricule..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white transition-all"
                />
              </div>

              {/* Filtre Marché */}
              <div className="w-full sm:w-auto flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedMarche}
                  onChange={(e) => setSelectedMarche(e.target.value)}
                  className="w-full sm:w-auto text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="all">Tous les Marchés (Salaires)</option>
                  {marchesSalaires.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.reference} ({m.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre Lieu */}
              <div className="w-full sm:w-auto flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={selectedLieu}
                  onChange={(e) => setSelectedLieu(e.target.value as LieuAffectationSalarie | 'all')}
                  className="w-full sm:w-auto text-xs py-1.5 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="all">Tous les Lieux d'Affectation</option>
                  {LIEUX_OPTIONS.filter((l) => l !== 'all').map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <span className="text-xs text-slate-500 self-end sm:self-center font-medium">
              {filteredSalaries.length} salarié(s) affiché(s)
            </span>
          </div>

          {/* Tableau de pointage journalier */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Salarié</th>
                    <th className="py-3 px-4">Marché Rattaché</th>
                    <th className="py-3 px-4">Lieu d'Affectation</th>
                    <th className="py-3 px-4 text-center">Statut du Jour ({formatDate(selectedDate)})</th>
                    <th className="py-3 px-4">Motif / Justificatif</th>
                    <th className="py-3 px-4 text-center">Enregistrement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSalaries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                        Aucun salarié ne correspond aux critères de filtre sélectionnés.
                      </td>
                    </tr>
                  ) : (
                    filteredSalaries.map((salarie) => {
                      const pointage = pointagesDuJourMap.get(salarie.id);
                      const currentStatut: StatutPointage = pointage?.statut || 'PRESENT';
                      const isSaved = savedRowIds.has(salarie.id);

                      const marche = salarie.marcheSalaireId
                        ? marchesMap.get(salarie.marcheSalaireId)
                        : null;

                      const isAbsenceOuConge =
                        currentStatut === 'ABSENCE_AUTORISEE' ||
                        currentStatut === 'ABSENCE_NON_AUTORISEE' ||
                        currentStatut === 'CONGE';

                      return (
                        <tr
                          key={salarie.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isSaved ? 'bg-teal-50/60' : ''
                          }`}
                        >
                          {/* Salarié */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 border border-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
                                {salarie.prenom.charAt(0)}
                                {salarie.nom.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {salarie.prenom} {salarie.nom}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                  <span className="font-mono text-slate-600 font-medium">
                                    CIN: {salarie.cin || '—'}
                                  </span>
                                  <span>·</span>
                                  <span className="truncate max-w-[140px] text-slate-500">
                                    {salarie.specialite}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Marché */}
                          <td className="py-3.5 px-4">
                            {marche ? (
                              <div>
                                <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 text-[11px]">
                                  {marche.reference}
                                </span>
                                <span className="text-[10px] text-slate-500 block truncate max-w-[170px]" title={marche.objet}>
                                  {marche.objet}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Non rattaché</span>
                            )}
                          </td>

                          {/* Lieu d'Affectation */}
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {salarie.lieuAffectation === 'Autre'
                                ? salarie.lieuAffectationAutre || 'Autre'
                                : salarie.lieuAffectation}
                            </span>
                          </td>

                          {/* Sélecteur de Statut Interactif (4 choix distincts) */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1 p-0.5 bg-slate-100/90 rounded-xl border border-slate-200 w-fit mx-auto shadow-2xs">
                              {/* Option 1 : Présent (Vert) */}
                              <button
                                type="button"
                                onClick={() => handleStatutChange(salarie.id, 'PRESENT')}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                                  currentStatut === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                                }`}
                                title="Présent sur site"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Présent</span>
                              </button>

                              {/* Option 2 : Absence autorisée (Orange / Ambre) */}
                              <button
                                type="button"
                                onClick={() => handleStatutChange(salarie.id, 'ABSENCE_AUTORISEE')}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                                  currentStatut === 'ABSENCE_AUTORISEE'
                                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                                    : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/50'
                                }`}
                                title="Absence autorisée (mission, certificat médical)"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>Abs. Autorisée</span>
                              </button>

                              {/* Option 3 : Absence non autorisée (Rouge) */}
                              <button
                                type="button"
                                onClick={() => handleStatutChange(salarie.id, 'ABSENCE_NON_AUTORISEE')}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                                  currentStatut === 'ABSENCE_NON_AUTORISEE'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50/50'
                                }`}
                                title="Absence non justifiée"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Non Autorisée</span>
                              </button>

                              {/* Option 4 : Congé (Bleu) */}
                              <button
                                type="button"
                                onClick={() => handleStatutChange(salarie.id, 'CONGE')}
                                className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                                  currentStatut === 'CONGE'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/50'
                                }`}
                                title="En congé réglementaire"
                              >
                                <Palmtree className="w-3.5 h-3.5" />
                                <span>Congé</span>
                              </button>
                            </div>
                          </td>

                          {/* Champ Motif / Justificatif */}
                          <td className="py-3.5 px-4">
                            <input
                              type="text"
                              value={pointage?.motif || ''}
                              disabled={!isAbsenceOuConge || !hasPermission('Gestionnaire')}
                              onChange={(e) => handleMotifChange(salarie.id, e.target.value)}
                              placeholder={
                                isAbsenceOuConge
                                  ? 'Préciser le motif ou justificatif...'
                                  : 'Non requis si présent'
                              }
                              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border transition-colors outline-none ${
                                isAbsenceOuConge
                                  ? 'bg-white border-amber-300 text-slate-800 placeholder-slate-400 focus:ring-1 focus:ring-amber-500 font-medium'
                                  : 'bg-slate-50 border-slate-200 text-slate-400 italic cursor-not-allowed'
                              }`}
                            />
                          </td>

                          {/* Actions / État d'enregistrement */}
                          <td className="py-3.5 px-4 text-center">
                            {isSaved ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 animate-in fade-in">
                                <CheckCheck className="w-3 h-3 text-teal-600" />
                                Enregistré
                              </span>
                            ) : pointage ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Synchronisé
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">
                                Par défaut
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VUE 2 : RÉCAPITULATIF MENSUEL PAR SALARIÉ */}
      {viewMode === 'mensuel' && (
        <div className="space-y-6">
          {/* Navigation Temporelle Mensuelle */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  title="Mois précédent"
                  className="p-2 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer border-r border-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-4 py-1.5 bg-slate-50 text-xs font-bold text-slate-800 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>
                    {MOIS_NOMS[selectedMoisIndex]} {selectedAnnee}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  title="Mois suivant"
                  className="p-2 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer border-l border-slate-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-slate-500 font-medium">
                Synthèse mensuelle d'assiduité
              </span>
            </div>

            {/* Bouton Export Récapitulatif */}
            <button
              type="button"
              onClick={handleExportMensuelCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors cursor-pointer self-start md:self-auto"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Exporter Synthèse Mensuelle (CSV)</span>
            </button>
          </div>

          {/* Tableau Récapitulatif Mensuel */}
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Bilan d'Assiduité — {MOIS_NOMS[selectedMoisIndex]} {selectedAnnee}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Cumul des jours pointés, présences réelles et taux d'assiduité par collaborateur
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                {recapitulatifMensuel.length} collaborateur(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Salarié</th>
                    <th className="py-3 px-4">Marché & Affectation</th>
                    <th className="py-3 px-4 text-center text-emerald-700">Jours Présents</th>
                    <th className="py-3 px-4 text-center text-amber-700">Abs. Autorisées</th>
                    <th className="py-3 px-4 text-center text-rose-700">Abs. Non Autorisées</th>
                    <th className="py-3 px-4 text-center text-blue-700">Congés</th>
                    <th className="py-3 px-4 text-center">Total Pointé</th>
                    <th className="py-3 px-4 text-center">Taux d'Assiduité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recapitulatifMensuel.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 italic">
                        Aucun pointage enregistré pour ce mois.
                      </td>
                    </tr>
                  ) : (
                    recapitulatifMensuel.map((item) => {
                      const s = item.salarie;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Salarié */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 border border-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
                                {s.prenom.charAt(0)}
                                {s.nom.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {s.prenom} {s.nom}
                                </span>
                                <span className="font-mono text-[11px] text-slate-500 block mt-0.5">
                                  {s.cin || s.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Marché & Affectation */}
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-mono font-bold text-slate-800 text-[11px] block">
                                {item.marcheSalaire ? item.marcheSalaire.reference : '—'}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                {s.lieuAffectation}
                              </span>
                            </div>
                          </td>

                          {/* Jours Présents */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {item.joursPresents} j
                            </span>
                          </td>

                          {/* Absences Autorisées */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-1 rounded-md ${
                                item.absencesAutorisees > 0
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'text-slate-400'
                              }`}
                            >
                              {item.absencesAutorisees} j
                            </span>
                          </td>

                          {/* Absences Non Autorisées */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-1 rounded-md ${
                                item.absencesNonAutorisees > 0
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'text-slate-400'
                              }`}
                            >
                              {item.absencesNonAutorisees} j
                            </span>
                          </td>

                          {/* Congés */}
                          <td className="py-3.5 px-4 text-center">
                            <span
                              className={`inline-flex items-center justify-center font-mono font-bold text-xs px-2.5 py-1 rounded-md ${
                                item.conges > 0
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'text-slate-400'
                              }`}
                            >
                              {item.conges} j
                            </span>
                          </td>

                          {/* Total Jours Pointés */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-mono font-bold text-slate-700 text-xs">
                              {item.totalJoursPointes} j
                            </span>
                          </td>

                          {/* Taux d'Assiduité avec jauge visuelle */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div
                                  className={`h-full rounded-full ${
                                    item.tauxAssiduite >= 90
                                      ? 'bg-emerald-500'
                                      : item.tauxAssiduite >= 75
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${item.tauxAssiduite}%` }}
                                />
                              </div>
                              <span
                                className={`font-mono font-bold text-xs ${
                                  item.tauxAssiduite >= 90
                                    ? 'text-emerald-700'
                                    : item.tauxAssiduite >= 75
                                    ? 'text-amber-700'
                                    : 'text-rose-700'
                                }`}
                              >
                                {item.tauxAssiduite}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
