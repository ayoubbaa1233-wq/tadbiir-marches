import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  BookOpen,
  Users2,
  Clock,
  Coins,
  Banknote,
  Hourglass,
  HelpCircle,
  CreditCard,
  Printer,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMontant, roundMonetaire } from '../../utils/formatters';
import { TabKey } from '../layout/Sidebar';
import { Modal } from '../common/Modal';

interface DashboardViewProps {
  onNavigate: (tab: TabKey, filterId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    marches,
    formations,
    intervenants,
    interventionsEnrichies,
    decomptes,
    paiements,
  } = useApp();

  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [guideTab, setGuideTab] = useState<'cycle' | 'kpis' | 'paiements'>('cycle');

  // 1. Calculs des 7 KPI en temps réel
  const kpis = useMemo(() => {
    const nombreMarchesActifs = marches.length;
    const nombreFormations = formations.length;
    const nombreIntervenants = intervenants.length;
    const masseHoraireTotale = interventionsEnrichies.reduce((sum, itv) => sum + itv.masseHoraire, 0);

    // Montant total prévu pour les honoraires intervenants ou total marchés
    const montantTotalHonoraires = roundMonetaire(interventionsEnrichies.reduce((sum, itv) => sum + itv.montantTotal, 0));
    const totalPaye = roundMonetaire(paiements.reduce((sum, p) => sum + p.montant, 0));
    const resteAPayer = roundMonetaire(Math.max(0, montantTotalHonoraires - totalPaye));

    const montantTotalMarches = roundMonetaire(marches.reduce((sum, m) => sum + m.montant, 0));
    const totalDecomptesRecus = roundMonetaire(decomptes.reduce((sum, d) => sum + d.montantRecu, 0));
    const resteARecevoir = roundMonetaire(Math.max(0, montantTotalMarches - totalDecomptesRecus));

    return {
      nombreMarchesActifs,
      nombreFormations,
      nombreIntervenants,
      masseHoraireTotale,
      montantTotalHonoraires,
      totalPaye,
      resteAPayer,
      montantTotalMarches,
      totalDecomptesRecus,
      resteARecevoir,
      pctPaye: montantTotalHonoraires > 0 ? Math.round((totalPaye / montantTotalHonoraires) * 100) : 0,
      pctReste: montantTotalHonoraires > 0 ? Math.round((resteAPayer / montantTotalHonoraires) * 100) : 0,
    };
  }, [marches, formations, intervenants, interventionsEnrichies, decomptes, paiements]);

  // 2. Données Donut 1 : Disciplinaires vs Complémentaires
  const natureBreakdown = useMemo(() => {
    let disciplinaire = 0;
    let complementaire = 0;
    formations.forEach((f) => {
      if (f.nature === 'Disciplinaire') disciplinaire++;
      else complementaire++;
    });
    const total = formations.length || 1;
    const pctDisc = Math.round((disciplinaire / total) * 100);
    const pctComp = 100 - pctDisc;
    return { disciplinaire, complementaire, pctDisc, pctComp, total: formations.length };
  }, [formations]);

  // 3. Données Bar Chart : Répartition des formations par filière
  const filieresBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    formations.forEach((f) => {
      const filiere = f.filiere || 'Génie Civil';
      counts[filiere] = (counts[filiere] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const maxVal = Math.max(...entries.map((e) => e[1]), 8);

    return {
      items: entries.slice(0, 5),
      maxVal,
    };
  }, [formations]);

  // 4. Données Timeline Activités récentes
  const recentActivities = useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      timeAgo: string;
      type: 'formation' | 'paiement' | 'marche' | 'intervenant';
      amount?: number;
    }> = [];

    // Ajouter le dernier paiement
    if (paiements.length > 0) {
      const p = paiements[paiements.length - 1];
      items.push({
        id: `p-${p.id}`,
        title: `Paiement enregistré - ${formatMontant(p.montant)}`,
        timeAgo: 'Il y a 4 heures',
        type: 'paiement',
        amount: p.montant,
      });
    }

    // Ajouter dernière formation modifiée
    if (formations.length > 0) {
      const f = formations[0];
      items.push({
        id: `f-${f.id}`,
        title: `Formation "${f.module}" mise à jour`,
        timeAgo: 'Il y a 2 heures',
        type: 'formation',
      });
    }

    // Ajouter dernier marché
    if (marches.length > 0) {
      const m = marches[marches.length - 1];
      items.push({
        id: `m-${m.id}`,
        title: `Nouveau marché ajouté - ${m.reference}`,
        timeAgo: 'Il y a 1 jour',
        type: 'marche',
      });
    }

    // Ajouter dernier intervenant
    if (intervenants.length > 0) {
      const i = intervenants[0];
      items.push({
        id: `i-${i.id}`,
        title: `Intervenant "${i.prenom} ${i.nom}" ajouté`,
        timeAgo: 'Il y a 2 jours',
        type: 'intervenant',
      });
    }

    return items;
  }, [paiements, formations, marches, intervenants]);

  return (
    <div className="space-y-6 pb-8">
      {/* En-tête de la page Formations avec sélecteur contextuel et bouton Guide */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 -mt-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Gestion des Formations
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Pilotage administratif, pédagogique et financier
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setGuideTab('cycle');
            setIsGuideModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all shadow-2xs cursor-pointer group"
          title="Consulter le guide et la documentation d'utilisation"
        >
          <HelpCircle className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          <span>Guide & Documentation</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. LIGNE DES 6 CARTES KPI SYNTHÉTIQUES                                    */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
        {/* KPI 1 : Marchés actifs */}
        <div className="group cursor-default bg-white rounded-xl p-3.5 border border-slate-200/90 border-t-4 border-t-slate-800 shadow-2xs flex items-center gap-3 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center shrink-0 transition-transform duration-200 ease-in-out group-hover:scale-105">
            <Briefcase className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 block truncate">
              Marchés actifs
            </span>
            <span className="text-xl font-black text-slate-900 leading-tight block tabular-nums">
              {kpis.nombreMarchesActifs}
            </span>
          </div>
        </div>

        {/* KPI 2 : Nombre de formations */}
        <div className="group cursor-default bg-white rounded-xl p-3.5 border border-slate-200/90 border-t-4 border-t-indigo-600 shadow-2xs flex items-center gap-3 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 transition-transform duration-200 ease-in-out group-hover:scale-105">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 block truncate">
              Nombre de formations
            </span>
            <span className="text-xl font-black text-slate-900 leading-tight block tabular-nums">
              {kpis.nombreFormations}
            </span>
          </div>
        </div>

        {/* KPI 3 : Nombre d'intervenants */}
        <div className="group cursor-default bg-white rounded-xl p-3.5 border border-slate-200/90 border-t-4 border-t-purple-600 shadow-2xs flex items-center gap-3 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70">
          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 transition-transform duration-200 ease-in-out group-hover:scale-105">
            <Users2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 block truncate">
              Nombre d'intervenants
            </span>
            <span className="text-xl font-black text-slate-900 leading-tight block tabular-nums">
              {kpis.nombreIntervenants}
            </span>
          </div>
        </div>

        {/* KPI 4 : Montant total */}
        <div className="group cursor-default bg-white rounded-xl p-3.5 border border-slate-200/90 border-t-4 border-t-cyan-600 shadow-2xs flex items-center gap-3 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70">
          <div className="w-10 h-10 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0 transition-transform duration-200 ease-in-out group-hover:scale-105">
            <Coins className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 block truncate">
              Montant total
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 leading-tight block tabular-nums whitespace-nowrap">
              {formatMontant(kpis.montantTotalHonoraires)}
            </span>
          </div>
        </div>

        {/* KPI 5 : Montant payé */}
        <div className="group cursor-default bg-white rounded-xl p-3.5 border border-slate-200/90 border-t-4 border-t-emerald-500 shadow-2xs flex items-center gap-3 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 transition-transform duration-200 ease-in-out group-hover:scale-105">
            <Banknote className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 block truncate">
              Montant payé
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-700 leading-tight block tabular-nums whitespace-nowrap">
              {formatMontant(kpis.totalPaye)}
            </span>
          </div>
        </div>

        {/* KPI 6 : Reste à payer */}
        <div className="group cursor-default bg-white rounded-xl p-3.5 border border-slate-200/90 border-t-4 border-t-rose-500 shadow-2xs flex items-center gap-3 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/70">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 transition-transform duration-200 ease-in-out group-hover:scale-105">
            <Hourglass className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-slate-500 block truncate">
              Reste à payer
            </span>
            <span className="text-base sm:text-lg font-black text-rose-700 leading-tight block tabular-nums whitespace-nowrap">
              {formatMontant(kpis.resteAPayer)}
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. LIGNE DES 3 GRAPHIQUES CENTRAUX (CONFORMES À L'IMAGE DE RÉFÉRENCE)     */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Graphique 1 (Gauche, ~32%) : Répartition des formations (Donut) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Répartition des formations
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Disciplinaires / Complémentaires
            </p>

            {/* Donut Chart SVG avec Total au centre */}
            <div className="relative flex items-center justify-center my-6">
              <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90">
                {/* Anneau Disciplinaire (Bleu Roi) */}
                <circle
                  cx="80"
                  cy="80"
                  r="56"
                  fill="transparent"
                  stroke="#1E40AF"
                  strokeWidth="24"
                  strokeDasharray={`${(natureBreakdown.pctDisc / 100) * 351.8} 351.8`}
                  className="transition-all duration-700"
                />
                {/* Anneau Complémentaire (Bleu Ciel) */}
                <circle
                  cx="80"
                  cy="80"
                  r="56"
                  fill="transparent"
                  stroke="#38BDF8"
                  strokeWidth="24"
                  strokeDasharray={`${(natureBreakdown.pctComp / 100) * 351.8} 351.8`}
                  strokeDashoffset={`-${(natureBreakdown.pctDisc / 100) * 351.8}`}
                  className="transition-all duration-700"
                />
              </svg>

              {/* Texte au centre du donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 leading-none">
                  {natureBreakdown.total}
                </span>
                <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                  formations
                </span>
              </div>
            </div>
          </div>

          {/* Légende détaillée */}
          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF]" />
                <span className="text-slate-700 font-medium">Disciplinaires</span>
              </div>
              <span className="font-bold text-slate-900 tabular-nums">
                {natureBreakdown.disciplinaire} ({natureBreakdown.pctDisc}%)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                <span className="text-slate-700 font-medium">Complémentaires</span>
              </div>
              <span className="font-bold text-slate-900 tabular-nums">
                {natureBreakdown.complementaire} ({natureBreakdown.pctComp}%)
              </span>
            </div>
          </div>
        </div>

        {/* Graphique 2 (Centre, ~48%) : Évolution des paiements (Courbes coordonnées) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Évolution des paiements
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#1E70E0]" />
                  Montant payé
                </span>
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Montant restant
                </span>
              </div>
            </div>

            {/* Line Chart SVG élégant avec axes et grille */}
            <div className="mt-4">
              <svg viewBox="0 0 380 180" className="w-full h-44 overflow-visible">
                {/* Lignes horizontales de repère et labels Y */}
                {[
                  { y: 20, label: '120 000' },
                  { y: 55, label: '90 000' },
                  { y: 90, label: '60 000' },
                  { y: 125, label: '30 000' },
                  { y: 160, label: '0' },
                ].map((g) => (
                  <g key={g.y}>
                    <line
                      x1="45"
                      y1={g.y}
                      x2="370"
                      y2={g.y}
                      stroke="#F1F5F9"
                      strokeWidth="1"
                    />
                    <text
                      x="40"
                      y={g.y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94A3B8"
                      className="font-mono"
                    >
                      {g.label}
                    </text>
                  </g>
                ))}

                {/* Dégradé sous la courbe bleue */}
                <defs>
                  <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E70E0" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#1E70E0" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Aire sous la courbe bleue */}
                <polygon
                  points="60,160 60,135 120,115 180,95 240,70 300,55 360,50 360,160"
                  fill="url(#paidGradient)"
                />

                {/* Courbe Montant Restant (Gris-ardoise) */}
                <polyline
                  points="60,130 120,110 180,105 240,100 300,112 360,105"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.8"
                />
                {[
                  [60, 130],
                  [120, 110],
                  [180, 105],
                  [240, 100],
                  [300, 112],
                  [360, 105],
                ].map(([cx, cy], idx) => (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r="3"
                    fill="#94A3B8"
                  />
                ))}

                {/* Courbe Montant Payé (Bleu Roi) */}
                <polyline
                  points="60,135 120,115 180,95 240,70 300,55 360,50"
                  fill="none"
                  stroke="#1E70E0"
                  strokeWidth="2.5"
                />
                {[
                  [60, 135],
                  [120, 115],
                  [180, 95],
                  [240, 70],
                  [300, 55],
                  [360, 50],
                ].map(([cx, cy], idx) => (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#1E70E0"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Labels de l'axe X (Mois) */}
                {[
                  { x: 60, m: 'Oct 2026' },
                  { x: 120, m: 'Nov 2026' },
                  { x: 180, m: 'Déc 2026' },
                  { x: 240, m: 'Jan 2027' },
                  { x: 300, m: 'Fév 2027' },
                  { x: 360, m: 'Mar 2027' },
                ].map((item) => (
                  <text
                    key={item.m}
                    x={item.x}
                    y="175"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#64748B"
                    className="font-medium"
                  >
                    {item.m}
                  </text>
                ))}
              </svg>
            </div>
          </div>

          <div className="pt-2 text-right">
            <span className="text-[11px] text-slate-400">
              Progression régulière des ordonnancements d'honoraires
            </span>
          </div>
        </div>

        {/* Graphique 3 (Droite, ~20%) : Montant payé vs restant (Donut de trésorerie) */}
        <div className="lg:col-span-3 bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Montant payé vs restant
            </h3>

            {/* Donut Chart SVG avec montant total au centre */}
            <div className="relative flex items-center justify-center my-6">
              <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90">
                {/* Arc Montant Payé (Bleu Roi) */}
                <circle
                  cx="80"
                  cy="80"
                  r="56"
                  fill="transparent"
                  stroke="#1E70E0"
                  strokeWidth="24"
                  strokeDasharray={`${(kpis.pctPaye / 100) * 351.8} 351.8`}
                  className="transition-all duration-700"
                />
                {/* Arc Reste à Payer (Gris clair) */}
                <circle
                  cx="80"
                  cy="80"
                  r="56"
                  fill="transparent"
                  stroke="#E2E8F0"
                  strokeWidth="24"
                  strokeDasharray={`${(kpis.pctReste / 100) * 351.8} 351.8`}
                  strokeDashoffset={`-${(kpis.pctPaye / 100) * 351.8}`}
                  className="transition-all duration-700"
                />
              </svg>

              {/* Montant total au centre */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <span className="text-xs font-black text-slate-900 leading-tight tabular-nums">
                  {formatMontant(kpis.montantTotalHonoraires)}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Total
                </span>
              </div>
            </div>
          </div>

          {/* Légende du ratio */}
          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            <div>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E70E0]" />
                <span>Montant payé</span>
              </div>
              <span className="text-xs font-bold text-slate-900 ml-4 tabular-nums block">
                {formatMontant(kpis.totalPaye)} ({kpis.pctPaye}%)
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>Reste à payer</span>
              </div>
              <span className="text-xs font-bold text-slate-700 ml-4 tabular-nums block">
                {formatMontant(kpis.resteAPayer)} ({kpis.pctReste}%)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. LIGNE DU BAS : RÉPARTITION PAR FILIÈRE ET DERNIÈRES ACTIVITÉS          */}
      {/* ========================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Colonnes par filière (Gauche, 8 colonnes) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">
              Répartition des formations par filière
            </h3>

            {/* Histogramme épuré */}
            <div className="h-44 flex items-end justify-around gap-4 px-2 pt-6 pb-2 border-b border-slate-200">
              {filieresBreakdown.items.map(([filiere, count], index) => {
                const heightPct = Math.round((count / filieresBreakdown.maxVal) * 100);
                // Dégradé de teintes bleues
                const barColors = [
                  'bg-[#103E7A]',
                  'bg-[#1E70E0]',
                  'bg-[#3B82F6]',
                  'bg-[#60A5FA]',
                  'bg-[#93C5FD]',
                ];
                return (
                  <div key={filiere} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 tabular-nums">
                      {count}
                    </span>
                    <div className="w-full max-w-[64px] bg-slate-100 rounded-t-sm h-32 flex items-end">
                      <div
                        className={`w-full rounded-t-sm ${barColors[index % barColors.length]} transition-all duration-500 group-hover:opacity-90`}
                        style={{ height: `${Math.max(15, heightPct)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-600 truncate max-w-[85px] text-center" title={filiere}>
                      {filiere}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-2 text-right">
            <button
              onClick={() => onNavigate('formations')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Consulter toutes les filières →
            </button>
          </div>
        </div>

        {/* Dernières activités (Droite, 4 colonnes) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">
              Dernières activités
            </h3>

            <div className="space-y-3.5">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      {act.type === 'formation' && <Clock className="w-3.5 h-3.5" />}
                      {act.type === 'paiement' && <Coins className="w-3.5 h-3.5 text-emerald-600" />}
                      {act.type === 'marche' && <Briefcase className="w-3.5 h-3.5 text-indigo-600" />}
                      {act.type === 'intervenant' && <Users2 className="w-3.5 h-3.5 text-sky-600" />}
                    </div>
                    <span className="font-medium text-slate-800 truncate" title={act.title}>
                      {act.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                    {act.timeAgo}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-right">
            <button
              onClick={() => onNavigate('rapports')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
            >
              <span>Voir toutes les activités</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modale de Documentation & Guide d'Utilisation */}
      <Modal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        title="Guide d'Utilisation — Gestion des Formations"
        subtitle="Processus opérationnel, indicateurs clés et gestion des règlements"
        maxWidth="3xl"
      >
        <div className="space-y-5 text-slate-700 text-xs">
          {/* Navigation par onglets */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setGuideTab('cycle')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                guideTab === 'cycle'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Cycle de gestion</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideTab('kpis')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                guideTab === 'kpis'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Coins className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Tableau de Bord & KPIs</span>
            </button>
            <button
              type="button"
              onClick={() => setGuideTab('paiements')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-2 ${
                guideTab === 'paiements'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Paiements & Reçus</span>
            </button>
          </div>

          {/* Section 1 : Vue d'ensemble & Cycle de gestion */}
          {guideTab === 'cycle' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-slate-700 leading-relaxed">
                <p className="font-medium">
                  Le module <strong>Gestion des Formations</strong> assure le pilotage intégral du cycle de vie des prestations pédagogiques, de la contractualisation du marché jusqu’au règlement final des honoraires des intervenants.
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Les 5 étapes du flux opérationnel
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center font-bold text-[11px] mb-2">
                        1
                      </div>
                      <p className="font-bold text-slate-900 text-xs mb-1">Marché</p>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Convention cadre signée avec le client, montant contractuel et dates d’exécution.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] mb-2">
                        2
                      </div>
                      <p className="font-bold text-slate-900 text-xs mb-1">Formation</p>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Module pédagogique rattaché au marché, filière et volume d’heures prescrit.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center font-bold text-[11px] mb-2">
                        3
                      </div>
                      <p className="font-bold text-slate-900 text-xs mb-1">Intervention</p>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Affectation du formateur avec taux horaire. Calcul auto du montant total (Heures × Taux).
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold text-[11px] mb-2">
                        4
                      </div>
                      <p className="font-bold text-slate-900 text-xs mb-1">Décompte Reçu</p>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Encaissement des factures et versements clients pour abonder la trésorerie.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[11px] mb-2">
                        5
                      </div>
                      <p className="font-bold text-slate-900 text-xs mb-1">Règlement</p>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        Ordonnancement des tranches d’honoraires et émission immédiate du reçu officiel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong>Cohérence financière garantie :</strong> Une intervention ne peut recevoir de paiement que jusqu'à concurrence de son montant prévu. Dès que le total des paiements atteint le montant prévu, l’intervention est automatiquement marquée comme <em>Soldée</em>.
                </p>
              </div>
            </div>
          )}

          {/* Section 2 : Tableau de Bord & Indicateurs */}
          {guideTab === 'kpis' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Signification des 6 cartes KPI
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 border-t-2 border-t-slate-800">
                    <span className="font-bold text-slate-900 block text-xs mb-0.5">1. Marchés actifs</span>
                    <p className="text-[11px] text-slate-500">Nombre total de marchés de formation en cours d'exécution dans le système.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 border-t-2 border-t-indigo-600">
                    <span className="font-bold text-slate-900 block text-xs mb-0.5">2. Nombre de formations</span>
                    <p className="text-[11px] text-slate-500">Total des modules pédagogiques programmés sur l’ensemble des marchés.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 border-t-2 border-t-purple-600">
                    <span className="font-bold text-slate-900 block text-xs mb-0.5">3. Nombre d'intervenants</span>
                    <p className="text-[11px] text-slate-500">Effectif des formateurs, experts et consultants enregistrés dans le répertoire.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 border-t-2 border-t-cyan-600">
                    <span className="font-bold text-slate-900 block text-xs mb-0.5">4. Montant total</span>
                    <p className="text-[11px] text-slate-500">Volume budgétaire total des honoraires prévus (somme de Masse horaire × Taux horaire).</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 border-t-2 border-t-emerald-500">
                    <span className="font-bold text-slate-900 block text-xs mb-0.5">5. Montant payé</span>
                    <p className="text-[11px] text-slate-500">Total cumulé des règlements déjà versés aux formateurs (virements et espèces).</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 border-t-2 border-t-rose-500">
                    <span className="font-bold text-slate-900 block text-xs mb-0.5">6. Reste à payer</span>
                    <p className="text-[11px] text-slate-500">Solde restant dû aux intervenants (Montant total prévu - Montant déjà réglé).</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Graphiques d'analyse financière
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">Répartition des formations</p>
                    <p className="text-slate-500">Graphique donut comparant les modules disciplinaires (cœur de métier) aux modules complémentaires.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">Évolution des paiements</p>
                    <p className="text-slate-500">Courbes chronologiques illustrant la cadence des décaissements et la résorption du solde dû.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-900 mb-1">Trésorerie & Reste dû</p>
                    <p className="text-slate-500">Proportion exacte entre les montants déjà décaissés et les engagements restants à honorer.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3 : Paiements & Reçus */}
          {guideTab === 'paiements' && (
            <div className="space-y-4 animate-in fade-in-50 duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Saisie des montants avec centimes</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Le formulaire de versement autorise la saisie fluide de montants décimaux précis. Vous pouvez employer indifféremment la virgule (,) ou le point (.) au clavier :
                  </p>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 font-mono">
                    <li>Exemple : <span className="font-bold text-slate-900 font-mono">150,50 DH</span> ou <span className="font-bold text-slate-900 font-mono">150.50 DH</span></li>
                    <li>Conversion immédiate sans perte de frappe ni troncature</li>
                  </ul>
                  <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[10px] text-emerald-800 font-medium">
                    ✓ Validation automatique : le versement ne peut jamais dépasser le reste dû de l'intervention.
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold">
                    <Printer className="w-4 h-4 text-indigo-600" />
                    <span>Reçus d'honoraires & Impressions</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Pour chaque paiement validé, un reçu officiel imprimable est immédiatement disponible depuis le journal des paiements :
                  </p>
                  <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4">
                    <li>Référence unique générée (ex : <span className="font-mono font-bold">VIR-PAI-2026-102</span>)</li>
                    <li>Mode de règlement : Virement bancaire ou Espèces</li>
                    <li>Format normalisé A4 prêt pour signature et archivage comptable</li>
                  </ul>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Conseil pratique :</strong> Avant d'enregistrer un paiement important, assurez-vous que le décompte correspondant du marché a bien été comptabilisé dans l'onglet <em>Décomptes</em> pour refléter une balance de trésorerie saine.
                </p>
              </div>
            </div>
          )}

          {/* Pied de la modale */}
          <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              Système de Gestion des Formations & Honoraires
            </span>
            <button
              type="button"
              onClick={() => setIsGuideModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
