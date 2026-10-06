import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Users,
  FileCheck2,
  CreditCard,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  ChevronRight,
  PieChart,
  HelpCircle,
  Info,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { formatMontant, formatDate, roundMonetaire } from '../../../utils/formatters';
import { Modal } from '../../common/Modal';

interface DashboardSalairesViewProps {
  onNavigate: (tab: string, filterId?: string) => void;
  onOpenAddMarche?: () => void;
  onOpenAddSalarie?: () => void;
  onOpenAddDecompte?: () => void;
  onOpenAddPaiement?: () => void;
}

const MOIS_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const MOIS_LONGS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const DashboardSalairesView: React.FC<DashboardSalairesViewProps> = ({
  onNavigate,
}) => {
  const {
    marchesSalaires,
    marchesSalairesSituations,
    salaries,
    decomptesSalairesEnrichis,
    paiementsSalairesEnrichis,
    salairesAlerteRetard,
  } = useApp();

  // États de survol interactif pour les graphiques
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);
  const [hoveredLieuKey, setHoveredLieuKey] = useState<string | null>(null);

  // État de la modale de documentation / guide
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [guideTab, setGuideTab] = useState<'architecture' | 'kpis' | 'decimales' | 'graphiques'>('architecture');

  // Chiffres globaux mémorisés pour éviter les re-calculs superflus
  const {
    totalContractuel,
    totalDecomptes,
    totalSalaires,
    soldeTresorerieGlobal,
    resteARecevoirGlobal,
    tauxEncaissement,
  } = useMemo(() => {
    const tc = roundMonetaire(marchesSalaires.reduce((acc, m) => acc + m.montantContractuel, 0));
    const td = roundMonetaire(marchesSalairesSituations.reduce((acc, s) => acc + s.totalDecomptesRecus, 0));
    const ts = roundMonetaire(marchesSalairesSituations.reduce((acc, s) => acc + s.totalSalairesVerses, 0));
    const solde = roundMonetaire(td - ts);
    const reste = roundMonetaire(Math.max(0, tc - td));
    const taux = tc > 0 ? (td / tc) * 100 : 0;
    return {
      totalContractuel: tc,
      totalDecomptes: td,
      totalSalaires: ts,
      soldeTresorerieGlobal: solde,
      resteARecevoirGlobal: reste,
      tauxEncaissement: taux,
    };
  }, [marchesSalaires, marchesSalairesSituations]);

  // 1. Données Évolution Financière Mensuelle (12 mois)
  const monthlyFinancialData = useMemo(() => {
    const year = 2026;

    const data = MOIS_LABELS.map((label, idx) => {
      const monthNum = idx + 1;
      const monthPrefix = `${year}-${String(monthNum).padStart(2, '0')}`;

      // Décomptes encaissés pour ce mois
      const decomptesDuMois = decomptesSalairesEnrichis.filter((d) =>
        d.date.startsWith(monthPrefix)
      );
      const montantDecomptes = decomptesDuMois.reduce((acc, d) => acc + d.montantRecu, 0);

      // Salaires versés pour ce mois
      const paiementsDuMois = paiementsSalairesEnrichis.filter((p) =>
        p.date.startsWith(monthPrefix) ||
        p.periode.toLowerCase().includes(MOIS_LONGS[idx].toLowerCase())
      );
      const montantSalaires = paiementsDuMois.reduce((acc, p) => acc + p.montant, 0);

      return {
        label,
        monthIndex: idx,
        fullName: `${MOIS_LONGS[idx]} ${year}`,
        montantDecomptes,
        montantSalaires,
        solde: montantDecomptes - montantSalaires,
      };
    });

    const maxVal = Math.max(
      ...data.map((d) => Math.max(d.montantDecomptes, d.montantSalaires)),
      120000
    );
    const maxY = Math.ceil(maxVal / 30000) * 30000;

    return { data, maxY };
  }, [decomptesSalairesEnrichis, paiementsSalairesEnrichis]);

  // 2. Données Donut : Répartition par Lieu d'Affectation
  const lieuxBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      Administration: 0,
      Laboratoire: 0,
      'Centre pédagogique': 0,
      "Centre d'Excellence": 0,
      Autre: 0,
    };
    salaries.forEach((s) => {
      if (counts[s.lieuAffectation] !== undefined) {
        counts[s.lieuAffectation]++;
      } else {
        counts['Autre']++;
      }
    });

    const total = salaries.length || 1;
    const config = [
      { key: 'Administration', label: 'Administration', color: '#0F766E', bgBadge: 'bg-teal-100 text-teal-800 border-teal-200', count: counts['Administration'] || 0 },
      { key: 'Laboratoire', label: 'Laboratoire', color: '#10B981', bgBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200', count: counts['Laboratoire'] || 0 },
      { key: 'Centre pédagogique', label: 'Centre pédagogique', color: '#0284C7', bgBadge: 'bg-sky-100 text-sky-800 border-sky-200', count: counts['Centre pédagogique'] || 0 },
      { key: "Centre d'Excellence", label: "Centre d'Excellence", color: '#6366F1', bgBadge: 'bg-indigo-100 text-indigo-800 border-indigo-200', count: counts["Centre d'Excellence"] || 0 },
      { key: 'Autre', label: 'Autres structures', color: '#F59E0B', bgBadge: 'bg-amber-100 text-amber-800 border-amber-200', count: counts['Autre'] || 0 },
    ];

    let accumulatedPct = 0;
    const items = config.map((cfg) => {
      const pct = Math.round((cfg.count / total) * 100);
      const startPct = accumulatedPct;
      accumulatedPct += pct;
      return {
        ...cfg,
        pct,
        startPct,
      };
    });

    return { total: salaries.length, items };
  }, [salaries]);

  // Derniers décomptes mémorisés
  const derniersDecomptes = useMemo(() => {
    return [...decomptesSalairesEnrichis]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [decomptesSalairesEnrichis]);

  // Derniers paiements mémorisés
  const derniersPaiements = useMemo(() => {
    return [...paiementsSalairesEnrichis]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [paiementsSalairesEnrichis]);

  return (
    <div className="space-y-6">
      {/* En-tête supérieur du Dashboard Salaires avec bouton Guide & Documentation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 -mt-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-teal-200/80 text-xs font-bold text-teal-900 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            Gestion des Salaires & Personnel
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Pilotage budgétaire, recouvrement des décomptes et rémunérations
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Widget Date */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{formatDate(new Date().toISOString().slice(0, 10))}</span>
          </div>

          {/* Bouton Guide & Documentation */}
          <button
            type="button"
            onClick={() => {
              setGuideTab('architecture');
              setIsGuideModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-teal-900 bg-white border border-teal-200 hover:bg-teal-50 hover:text-teal-950 hover:border-teal-300 transition-all shadow-2xs cursor-pointer group"
            title="Consulter la documentation et le guide opérationnel des salaires"
          >
            <HelpCircle className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
            <span>Documentation & Guide</span>
          </button>
        </div>
      </div>

      {/* 0. Bandeau d'alerte contextuel orange - Retard de règlement des salaires */}
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
              onClick={() => onNavigate('paiements-salaires')}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Régler maintenant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Cartes KPI Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Budget Contractuel */}
        <div className="group bg-white border border-slate-200/80 border-t-4 border-t-blue-600 rounded-2xl p-5 shadow-xs transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md hover:shadow-slate-200/60 hover:border-slate-300 cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Budget Contractuel Salaires
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100/80 transition-transform duration-200 group-hover:scale-105 shadow-2xs">
              <Briefcase className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-800 font-mono block tracking-tight">
              {formatMontant(totalContractuel)}
            </span>
            <span className="text-xs text-slate-500 font-medium mt-1 block">
              {marchesSalaires.length} marché(s) d'affectation
            </span>
          </div>
        </div>

        {/* KPI 2 : Total Décomptes Encaissés */}
        <div className="group bg-white border border-slate-200/80 border-t-4 border-t-emerald-500 rounded-2xl p-5 shadow-xs transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md hover:shadow-slate-200/60 hover:border-slate-300 cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Décomptes Reçus
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80 transition-transform duration-200 group-hover:scale-105 shadow-2xs">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-700 font-mono block tracking-tight">
              {formatMontant(totalDecomptes)}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold font-mono border border-emerald-200/80">
                {tauxEncaissement.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 font-medium">du montant global</span>
            </div>
          </div>
        </div>

        {/* KPI 3 : Salaires Versés */}
        <div className="group bg-white border border-slate-200/80 border-t-4 border-t-indigo-600 rounded-2xl p-5 shadow-xs transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md hover:shadow-slate-200/60 hover:border-slate-300 cursor-default">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Salaires Versés
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200/80 transition-transform duration-200 group-hover:scale-105 shadow-2xs">
              <Wallet className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-indigo-950 font-mono block tracking-tight">
              {formatMontant(totalSalaires)}
            </span>
            <span className="text-xs text-slate-500 font-medium mt-1 block">
              {paiementsSalairesEnrichis.length} règlements émis
            </span>
          </div>
        </div>

        {/* KPI 4 : Solde Trésorerie Salaires */}
        <div
          className={`group bg-white border border-slate-200/80 border-t-4 rounded-2xl p-5 shadow-xs transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md hover:shadow-slate-200/60 hover:border-slate-300 cursor-default ${
            soldeTresorerieGlobal >= 0 ? 'border-t-teal-600' : 'border-t-rose-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Solde de Trésorerie
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105 shadow-2xs ${
                soldeTresorerieGlobal >= 0
                  ? 'bg-teal-50 text-teal-700 border-teal-200/80'
                  : 'bg-rose-50 text-rose-600 border-rose-200/80'
              }`}
            >
              {soldeTresorerieGlobal >= 0 ? (
                <ArrowUpRight className="w-4.5 h-4.5" />
              ) : (
                <ArrowDownRight className="w-4.5 h-4.5" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl font-bold font-mono block tracking-tight ${
                soldeTresorerieGlobal >= 0 ? 'text-teal-800' : 'text-rose-600'
              }`}
            >
              {formatMontant(soldeTresorerieGlobal)}
            </span>
            <span className="text-xs text-slate-500 font-medium mt-1 block">
              Encaissé - Salaires versés
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LIGNE 1 - ANALYSE FINANCIÈRE & RÉPARTITION (GRAPHIQUES INTERACTIFS)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Graphique A (65% / 8 colonnes) : Évolution Financière Mensuelle */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Évolution Financière Mensuelle
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparatif flux décomptes encaissés vs masse des salaires versés (2026)
                </p>
              </div>

              {/* Légendes interactives */}
              <div className="flex items-center gap-4 text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-200" />
                  Décomptes reçus
                </span>
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-200" />
                  Salaires versés
                </span>
              </div>
            </div>

            {/* Zone Graphique SVG Responsive */}
            <div className="relative mt-4 pt-1">
              {/* Infobulle interactive flottante au survol */}
              {hoveredMonthIndex !== null && monthlyFinancialData.data[hoveredMonthIndex] && (
                <div
                  className="absolute z-20 pointer-events-none bg-slate-900/95 text-white rounded-xl px-3.5 py-2.5 shadow-xl text-xs backdrop-blur-xs border border-slate-700/60 transition-all duration-150 transform -translate-x-1/2 -top-2"
                  style={{
                    left: `${
                      60 + (hoveredMonthIndex / 11) * (100 - (60 / 640) * 100 - (25 / 640) * 100) * 6.4
                    }px`,
                  }}
                >
                  <p className="font-bold text-slate-200 pb-1 border-b border-slate-800 text-[11px]">
                    {monthlyFinancialData.data[hoveredMonthIndex].fullName}
                  </p>
                  <div className="space-y-1 mt-1.5 font-mono text-[11px]">
                    <div className="flex items-center justify-between gap-3 text-emerald-400">
                      <span>Décomptes :</span>
                      <span className="font-bold">
                        {formatMontant(monthlyFinancialData.data[hoveredMonthIndex].montantDecomptes)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-blue-400">
                      <span>Salaires :</span>
                      <span className="font-bold">
                        {formatMontant(monthlyFinancialData.data[hoveredMonthIndex].montantSalaires)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-800 text-slate-300">
                      <span>Solde net :</span>
                      <span
                        className={`font-bold ${
                          monthlyFinancialData.data[hoveredMonthIndex].solde >= 0
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {formatMontant(monthlyFinancialData.data[hoveredMonthIndex].solde)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <svg viewBox="0 0 640 210" className="w-full h-52 overflow-visible select-none">
                <defs>
                  {/* Dégradé Décomptes (Émeraude franc) */}
                  <linearGradient id="salairesDecomptesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Dégradé Salaires Versés (Bleu Roi / Indigo bien distinct) */}
                  <linearGradient id="salairesVersesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grille et graduations horizontales Y */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = 20 + pct * 150;
                  const val = Math.round(monthlyFinancialData.maxY * (1 - pct));
                  return (
                    <g key={idx}>
                      <line
                        x1="55"
                        y1={y}
                        x2="620"
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray={pct === 1 ? '0' : '4 4'}
                        strokeWidth="1"
                      />
                      <text
                        x="50"
                        y={y + 3.5}
                        textAnchor="end"
                        className="text-[10px] fill-slate-400 font-mono font-medium"
                      >
                        {val === 0 ? '0 DH' : `${(val / 1000).toFixed(0)}k`}
                      </text>
                    </g>
                  );
                })}

                {/* Axe vertical repère au survol */}
                {hoveredMonthIndex !== null && (
                  <line
                    x1={55 + (hoveredMonthIndex / 11) * 565}
                    y1="20"
                    x2={55 + (hoveredMonthIndex / 11) * 565}
                    y2="170"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* 1. Aire & Ligne des Décomptes (Émeraude franc) */}
                {(() => {
                  const points = monthlyFinancialData.data.map((d, i) => {
                    const x = 55 + (i / 11) * 565;
                    const y = 20 + (1 - d.montantDecomptes / monthlyFinancialData.maxY) * 150;
                    return { x, y };
                  });

                  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaPath = `${linePath} L ${55 + 565} 170 L 55 170 Z`;

                  return (
                    <g>
                      <path d={areaPath} fill="url(#salairesDecomptesGrad)" />
                      <path
                        d={linePath}
                        fill="none"
                        stroke="#059669"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {points.map((p, i) => (
                        <circle
                          key={i}
                          cx={p.x}
                          cy={p.y}
                          r={hoveredMonthIndex === i ? 5 : 3.5}
                          fill="#FFFFFF"
                          stroke="#059669"
                          strokeWidth="2.5"
                          className="transition-all duration-150 cursor-pointer"
                        />
                      ))}
                    </g>
                  );
                })()}

                {/* 2. Aire & Ligne des Salaires Versés (Bleu Roi / Indigo bien distinct) */}
                {(() => {
                  const points = monthlyFinancialData.data.map((d, i) => {
                    const x = 55 + (i / 11) * 565;
                    const y = 20 + (1 - d.montantSalaires / monthlyFinancialData.maxY) * 150;
                    return { x, y };
                  });

                  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaPath = `${linePath} L ${55 + 565} 170 L 55 170 Z`;

                  return (
                    <g>
                      <path d={areaPath} fill="url(#salairesVersesGrad)" />
                      <path
                        d={linePath}
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {points.map((p, i) => (
                        <circle
                          key={i}
                          cx={p.x}
                          cy={p.y}
                          r={hoveredMonthIndex === i ? 5 : 3.5}
                          fill="#FFFFFF"
                          stroke="#2563EB"
                          strokeWidth="2.5"
                          className="transition-all duration-150 cursor-pointer"
                        />
                      ))}
                    </g>
                  );
                })()}

                {/* Zones invisibles élargies pour faciliter le survol de chaque mois */}
                {monthlyFinancialData.data.map((d, i) => {
                  const x = 55 + (i / 11) * 565;
                  return (
                    <g key={i}>
                      <rect
                        x={x - 22}
                        y="15"
                        width="44"
                        height="185"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredMonthIndex(i)}
                        onMouseLeave={() => setHoveredMonthIndex(null)}
                      />
                      <text
                        x={x}
                        y="190"
                        textAnchor="middle"
                        className={`text-[11px] font-semibold transition-colors ${
                          hoveredMonthIndex === i ? 'fill-teal-700 font-bold' : 'fill-slate-500'
                        }`}
                      >
                        {d.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Exercice budgétaire en cours · Montants exprimés en Dirhams (DH)</span>
            <span className="font-semibold text-teal-800">
              Solde cumulé net : {formatMontant(soldeTresorerieGlobal)}
            </span>
          </div>
        </div>

        {/* Graphique B (35% / 4 colonnes) : Répartition par Lieu d'Affectation (Donut) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <PieChart className="w-4 h-4 text-teal-600" />
                Répartition par Lieu d'Affectation
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ventilation de l'effectif salarié actif sur site
              </p>
            </div>

            {/* Donut Chart SVG avec centre interactif */}
            <div className="relative flex items-center justify-center my-5">
              <svg viewBox="0 0 180 180" className="w-44 h-44 transform -rotate-90">
                {/* Anneau de fond gris */}
                <circle
                  cx="90"
                  cy="90"
                  r="62"
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth="24"
                />

                {/* Segments colorés des lieux d'affectation */}
                {lieuxBreakdown.items.map((item) => {
                  const circumference = 389.56; // 2 * PI * 62
                  const dashLength = (item.pct / 100) * circumference;
                  const offset = (item.startPct / 100) * circumference;
                  const isHovered = hoveredLieuKey === item.key;

                  return (
                    <circle
                      key={item.key}
                      cx="90"
                      cy="90"
                      r="62"
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={isHovered ? 28 : 24}
                      strokeDasharray={`${dashLength} ${circumference}`}
                      strokeDashoffset={`-${offset}`}
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredLieuKey(item.key)}
                      onMouseLeave={() => setHoveredLieuKey(null)}
                    />
                  );
                })}
              </svg>

              {/* Texte au centre du donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-3xl font-black text-slate-900 font-mono leading-none">
                  {lieuxBreakdown.total}
                </span>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
                  Salariés actifs
                </span>
              </div>
            </div>
          </div>

          {/* Légende détaillée avec effectif et pourcentage */}
          <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
            {lieuxBreakdown.items.map((item) => {
              const isHovered = hoveredLieuKey === item.key;
              return (
                <div
                  key={item.key}
                  onMouseEnter={() => setHoveredLieuKey(item.key)}
                  onMouseLeave={() => setHoveredLieuKey(null)}
                  className={`flex items-center justify-between p-1 rounded-lg transition-colors cursor-pointer ${
                    isHovered ? 'bg-slate-50 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-700 font-medium truncate max-w-[150px]">
                      {item.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-slate-900">{item.count}</span>
                    <span className="text-[11px] text-slate-400">({item.pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Synthèse d'Exécution par Marché de Salaires */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-teal-600" />
              État d'Exécution par Marché de Salaires
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Taux de recouvrement, effectif affecté et marges de trésorerie
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('marches-salaires')}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
          >
            Voir tous les marchés →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marchesSalairesSituations.map((sit) => {
            const m = sit.marche;
            return (
              <div
                key={m.id}
                className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-teal-300 transition-all cursor-pointer"
                onClick={() => onNavigate('marches-salaires', m.id)}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded border border-teal-200">
                      {m.reference}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 font-mono">
                      {sit.tauxEncaissement.toFixed(1)}%
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 mt-2 line-clamp-2 leading-snug">
                    {m.objet}
                  </h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-2 text-xs">
                  {/* Barre de progression */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, sit.tauxEncaissement)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Contractuel:</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {formatMontant(m.montantContractuel)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Encaissé:</span>
                    <span className="font-semibold text-emerald-700 font-mono">
                      {formatMontant(sit.totalDecomptesRecus)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Salaires versés:</span>
                    <span className="font-semibold text-teal-700 font-mono">
                      {formatMontant(sit.totalSalairesVerses)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1 border-t border-dashed border-slate-200 font-semibold">
                    <span className="text-slate-600">Trésorerie nette:</span>
                    <span
                      className={`font-mono ${
                        sit.soldeTresorerie >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {formatMontant(sit.soldeTresorerie)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Derniers Décomptes & Derniers Règlements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers Décomptes Reçus */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Derniers Décomptes Encaissés
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('decomptes-salaires')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
            >
              Tous les décomptes →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {derniersDecomptes.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Aucun décompte enregistré.
              </p>
            ) : (
              derniersDecomptes.map((d) => (
                <div
                  key={d.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {d.numero}
                    </span>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 block truncate">
                        {d.marcheSalaire ? `Marché ${d.marcheSalaire.reference}` : d.marcheSalaireId}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDate(d.date)} · {d.referenceVirement}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 shrink-0">
                    {formatMontant(d.montantRecu)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Derniers Salaires Versés */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-teal-600" />
              Derniers Règlements Versés
            </h3>
            <button
              type="button"
              onClick={() => onNavigate('paiements-salaires')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
            >
              Tous les paiements →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {derniersPaiements.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Aucun versement enregistré.
              </p>
            ) : (
              derniersPaiements.map((p) => (
                <div
                  key={p.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded bg-teal-100 text-teal-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                      {p.salarie ? p.salarie.nom.charAt(0) : 'S'}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 block truncate">
                        {p.salarie ? `${p.salarie.prenom} ${p.salarie.nom}` : p.salarieId}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {p.periode} · {p.mode} ({p.reference})
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-teal-700 shrink-0">
                    {formatMontant(p.montant)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modale de Documentation & Guide Opérationnel des Salaires */}
      <Modal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        title="Documentation — Guide Opérationnel des Salaires"
        subtitle="Architecture des marchés, indicateurs de trésorerie, règlements et analyses"
        maxWidth="3xl"
      >
        <div className="space-y-5 text-slate-700 text-xs">
          {/* Barre d'onglets de navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setGuideTab('architecture')}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                guideTab === 'architecture'
                  ? 'bg-white text-teal-800 shadow-xs border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">1. Architecture</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideTab('kpis')}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                guideTab === 'kpis'
                  ? 'bg-white text-teal-800 shadow-xs border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">2. Indicateurs</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideTab('decimales')}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                guideTab === 'decimales'
                  ? 'bg-white text-teal-800 shadow-xs border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">3. Règlements</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideTab('graphiques')}
              className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                guideTab === 'graphiques'
                  ? 'bg-white text-teal-800 shadow-xs border border-teal-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <PieChart className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">4. Graphiques</span>
            </button>
          </div>

          {/* Section 1 : Vue d'Ensemble & Architecture */}
          {guideTab === 'architecture' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="p-3.5 bg-teal-50/70 border border-teal-100 rounded-xl text-slate-700 leading-relaxed">
                <p className="font-medium">
                  Le module <strong>Gestion des Salaires & Personnel</strong> orchestre le suivi financier et administratif des marchés d’affectation des salariés, en synchronisant les encaissements reçus de l'organisme payeur avec les règlements de paie du personnel.
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Le cycle opérationnel en 4 étapes
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[11px] mb-2">
                        1
                      </div>
                      <p className="font-bold text-slate-900 text-xs mb-1">Marché Salaires</p>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Convention cadre d’affectation de personnel (référence, montant global TTC en DH, date de début, délai en mois).
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-[11px] mb-2">
                        2
                      </div>
                      <p className="font-bold text-slate-900 text-xs mb-1">Effectif des Salariés</p>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Répertoire du personnel (CIN, spécialité, site d’affectation, coordonnées bancaires RIB et salaire de base contractuel).
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] mb-2">
                        3
                      </div>
                      <p className="font-bold text-slate-900 text-xs mb-1">Décomptes Encaissés</p>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Acomptes et factures réglés par le client sur le marché (avis de virement, date, montant avec centimes) abondant la trésorerie.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] mb-2">
                        4
                      </div>
                      <p className="font-bold text-slate-900 text-xs mb-1">Règlements de Salaires</p>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Ordonnancement des paies mensuelles (virement, espèces ou chèque), contrôle anti-doublon et émission du reçu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>Flux de trésorerie maîtrisé :</strong> La trésorerie nette disponible pour honorer les salaires repose sur les décomptes perçus. Le tableau de bord calcule en permanence le solde net entre les encaissements du marché et les salaires versés.
                </p>
              </div>
            </div>
          )}

          {/* Section 2 : Indicateurs Clés & Trésorerie */}
          {guideTab === 'kpis' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Les 4 cartes KPI du tableau de bord
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 border-t-4 border-t-blue-600 space-y-1">
                    <span className="font-bold text-slate-900 block text-xs">1. Budget Contractuel Salaires</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Enveloppe budgétaire globale contractuelle (TTC) de tous les marchés de salaires actifs enregistrés. Représente le plafond financier alloué pour la mise à disposition du personnel.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 border-t-4 border-t-emerald-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">2. Décomptes Reçus</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                        Taux de recouvrement
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Somme de tous les décomptes et acomptes effectivement encaissés des marchés. Le taux affiche la proportion recouvrée par rapport au budget global (<span className="font-mono">Décomptes / Budget × 100</span>).
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 border-t-4 border-t-indigo-600 space-y-1">
                    <span className="font-bold text-slate-900 block text-xs">3. Salaires Versés</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Montant cumulé des rémunérations nettes décaissées et versées au personnel salarié, tous mois et modes de paiement confondus.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 border-t-4 border-t-teal-500 space-y-1">
                    <span className="font-bold text-slate-900 block text-xs">4. Solde de Trésorerie Net</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Différence nette entre les encaissements et les décaissements (<span className="font-mono font-bold">Décomptes Reçus - Salaires Versés</span>). Un solde positif confirme que les liquidités encaissées couvrent la paie.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>Reste à Recevoir :</strong> Correspond au solde contractuel résiduel dû par le maître d’ouvrage (<span className="font-mono">Budget Global - Décomptes Reçus</span>). Il indique le potentiel de trésorerie encore à recouvrer.
                </p>
              </div>
            </div>
          )}

          {/* Section 3 : Saisie des Décimales & Règlements */}
          {guideTab === 'decimales' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <CreditCard className="w-4 h-4 text-teal-600" />
                    <span>Saisie fluide des centimes</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Les 3 formulaires du module Salaires (Marchés, Décomptes et Règlements) prennent en charge les montants précis au centime près :
                  </p>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 font-mono">
                    <li>Exemples valides : <span className="font-bold text-slate-900">6500,45 DH</span> ou <span className="font-bold text-slate-900">250.78 DH</span></li>
                    <li>Saisie universelle : la virgule (,) est convertie automatiquement en point (.) sans interrompre la frappe</li>
                  </ul>
                  <div className="mt-2 p-2 bg-teal-50 rounded-lg border border-teal-200 text-[10px] text-teal-900 font-medium">
                    ✓ Précision arithmétique conservée dans les calculs de décomptes et de trésorerie nette.
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Sécurité anti-doublon & Reçus</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Afin d'éviter tout double versement accidentel, des garde-fous stricts sont intégrés :
                  </p>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
                    <li><strong>Contrôle anti-doublon :</strong> blocage en temps réel si un paiement existe déjà pour un salarié sur le même mois et marché.</li>
                    <li><strong>Bordereau / Reçu imprimable :</strong> génération instantanée d’un reçu officiel A4 avec référence unique (<span className="font-mono font-bold">VIR-SAL-...</span>).</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Alerte automatique d’échéance :</strong> Dès le 2 du mois, le système active automatiquement un bandeau d’avertissement si des salariés n'ont pas encore perçu leur salaire pour le mois échu, facilitant les relances.
                </p>
              </div>
            </div>
          )}

          {/* Section 4 : Graphiques & Ventilation */}
          {guideTab === 'graphiques' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <TrendingUp className="w-4 h-4 text-teal-600" />
                    <span>Évolution de la Trésorerie Mensuelle</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Graphique comparatif sur 12 mois visualisant les flux financiers :
                  </p>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
                    <li><strong className="text-emerald-700">Barres émeraudes :</strong> Décomptes encaissés au cours du mois.</li>
                    <li><strong className="text-indigo-700">Barres indigo :</strong> Salaires versés au personnel pour le mois.</li>
                    <li><strong className="text-slate-800">Courbe de solde :</strong> Trajectoire du solde net mensuel (survol interactif au mois par mois).</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <PieChart className="w-4 h-4 text-indigo-600" />
                    <span>Répartition par Site d'Affectation</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Diagramme segmenté ventilant l'ensemble de l'effectif selon leurs lieux de travail :
                  </p>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
                    <li>Chantiers de construction, Laboratoires de contrôle, Centres pédagogiques, Centres d'excellence...</li>
                    <li>Visualisation instantanée de la proportion (%) et du nombre exact d'agents affectés.</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-[11px] text-teal-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Interactivité complète :</strong> Vous pouvez survoler chaque barre mensuelle ou segment de site pour afficher les montants exacts et inspecter la santé financière globale.
                </p>
              </div>
            </div>
          )}

          {/* Pied de la modale */}
          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Système d'Information Administratif & Financier — Gestion des Salaires
            </span>
            <button
              type="button"
              onClick={() => setIsGuideModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
