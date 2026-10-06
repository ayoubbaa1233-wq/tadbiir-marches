import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Printer,
  FileText,
  DollarSign,
  Users2,
  Calendar,
  Building2,
  Download,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMontant, formatDate, formatHeures, formatPourcentage } from '../../utils/formatters';
import { exportToCsv } from '../../utils/exportUtils';
import { NatureFormationBadge, EtatPaiementBadge } from '../common/Badge';

type RapportType =
  | 'etat_global'
  | 'fiche_marche'
  | 'fiche_intervenant'
  | 'recap_interventions'
  | 'liste_paiements'
  | 'liste_decomptes';

export const RapportsView: React.FC = () => {
  const {
    marches,
    formations,
    intervenants,
    interventionsEnrichies,
    decomptes,
    paiements,
    getMarcheSituation,
    getIntervenantSituation,
  } = useApp();

  const [activeRapport, setActiveRapport] = useState<RapportType>('etat_global');
  const [selectedMarcheId, setSelectedMarcheId] = useState<string>(marches[0]?.id || '');
  const [selectedIntervenantId, setSelectedIntervenantId] = useState<string>(intervenants[0]?.id || '');

  // Référence attachée à la feuille administrative pour impression isolée
  const reportSheetRef = useRef<HTMLDivElement>(null);

  // Gestionnaire d'impression directe du rapport officiel
  const handlePrintDocument = () => {
    const printArea = reportSheetRef.current;
    if (!printArea) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Édition Administrative - État Financier</title>
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              background: #ffffff;
              color: #0f172a;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 7px 10px; font-size: 11px; }
            th { background-color: #f1f5f9 !important; font-weight: 700; color: #1e293b; }
            * { box-sizing: border-box; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            .gap-2 { gap: 8px; }
            .gap-4 { gap: 16px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .uppercase { text-transform: uppercase; }
            .text-xs { font-size: 12px; }
            .text-sm { font-size: 14px; }
            .text-base { font-size: 16px; }
            .text-lg { font-size: 18px; }
            .border { border: 1px solid #cbd5e1; }
            .border-t { border-top: 1px solid #cbd5e1; }
            .border-b-2 { border-bottom: 2px solid #0f172a; }
            .rounded-lg { border-radius: 6px; }
            .p-3 { padding: 12px; }
            .p-4 { padding: 16px; }
            .pb-2 { padding-bottom: 8px; }
            .pb-5 { padding-bottom: 20px; }
            .mb-6 { margin-bottom: 24px; }
            .mt-12 { margin-top: 48px; }
            .pt-2 { padding-top: 8px; }
            .pt-6 { padding-top: 24px; }
            .bg-slate-50 { background-color: #f8fafc; }
            .bg-slate-100 { background-color: #f1f5f9; }
            .text-slate-500 { color: #64748b; }
            .text-slate-600 { color: #475569; }
            .text-slate-700 { color: #334155; }
            .text-slate-800 { color: #1e293b; }
            .text-slate-900 { color: #0f172a; }
            .text-emerald-700, .text-emerald-800 { color: #047857; }
            .text-blue-700, .text-blue-900 { color: #1d4ed8; }
            .text-rose-700 { color: #b91c1c; }
            .text-amber-800 { color: #92400e; }
          </style>
        </head>
        <body>
          ${printArea.innerHTML}
        </body>
      </html>
    `;

    try {
      const printWindow = window.open('', '_blank', 'width=900,height=1100');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
        return;
      }
    } catch {
      // Si window.open est bloqué par la sandbox iframe, fallback vers iframe invisible
    }

    // Fallback d'impression via iframe éphémère (fiable en contexte d'iframe restreinte)
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(printContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        }, 500);
      }, 250);
    }
  };

  // Données dynamiques selon le rapport actif
  const currentMarcheSituation = selectedMarcheId ? getMarcheSituation(selectedMarcheId) : undefined;
  const currentIntervenantSituation = selectedIntervenantId ? getIntervenantSituation(selectedIntervenantId) : undefined;

  // Fonctions d'export Excel dédiées par rapport
  const handleExportCurrent = () => {
    switch (activeRapport) {
      case 'etat_global': {
        const headers = [
          'ID Marché',
          'Référence',
          'Objet',
          'Montant Marché (DH)',
          'Décomptes Reçus (DH)',
          'Taux Encaissement',
          'Reste à Recevoir (DH)',
          'Total Prévu Intervenants (DH)',
          'Total Payé Intervenants (DH)',
          'Reste à Payer (DH)',
          'Solde Prévisionnel (DH)',
        ];
        const rows = marches.map((m) => {
          const s = getMarcheSituation(m.id);
          return [
            m.id,
            m.reference,
            m.objet,
            m.montant,
            s?.totalDecomptesRecus || 0,
            formatPourcentage(s?.tauxEncaissement || 0),
            s?.montantRestantARecevoir || 0,
            s?.montantTotalPrevuIntervenants || 0,
            s?.totalPayeIntervenants || 0,
            s?.resteAPayerIntervenants || 0,
            s?.soldePrevisionnel || 0,
          ];
        });
        exportToCsv('etat_financier_global_marches', headers, rows);
        break;
      }

      case 'fiche_marche': {
        if (!currentMarcheSituation) return;
        const m = currentMarcheSituation.marche;
        const fForms = formations.filter((f) => f.marcheId === m.id);
        const headers = ['Type', 'Réf / Intitulé', 'Détail 1', 'Détail 2', 'Montant / Volume'];
        const rows = [
          ['Marché', m.reference, m.objet, `${formatDate(m.dateDebut)} -> ${formatDate(m.dateFin)}`, m.montant],
          ['Financier', 'Décomptes Reçus', `${currentMarcheSituation.totalDecomptesRecus} DH`, 'Taux: ' + formatPourcentage(currentMarcheSituation.tauxEncaissement), ''],
          ['Financier', 'Reste à Recevoir', `${currentMarcheSituation.montantRestantARecevoir} DH`, '', ''],
          ['Financier', 'Total Prévu Intervenants', `${currentMarcheSituation.montantTotalPrevuIntervenants} DH`, '', ''],
          ['Financier', 'Total Payé Intervenants', `${currentMarcheSituation.totalPayeIntervenants} DH`, '', ''],
          ['Financier', 'Solde Prévisionnel', `${currentMarcheSituation.soldePrevisionnel} DH`, '', ''],
          ...fForms.map((f) => ['Formation', f.module, f.nature, f.filiere, '']),
        ];
        exportToCsv(`fiche_marche_${m.reference.replace('/', '_')}`, headers, rows);
        break;
      }

      case 'fiche_intervenant': {
        if (!currentIntervenantSituation) return;
        const i = currentIntervenantSituation.intervenant;
        const headers = ['Formation / Module', 'Marché', 'Volume (h)', 'Taux (DH/h)', 'Total Prévu (DH)', 'Payé (DH)', 'Reste (DH)'];
        const rows = currentIntervenantSituation.interventions.map((itv) => [
          itv.formation?.module || itv.formationId,
          itv.marche?.reference || '-',
          itv.masseHoraire,
          itv.tauxHoraire,
          itv.montantTotal,
          itv.totalPaye,
          itv.resteAPayer,
        ]);
        exportToCsv(`fiche_intervenant_${i.nom}_${i.prenom}`, headers, rows);
        break;
      }

      case 'recap_interventions': {
        const headers = ['ID', 'Formation', 'Marché', 'Intervenant', 'Masse H (h)', 'Taux H (DH)', 'Montant (DH)', 'Payé (DH)', 'Reste (DH)', 'Statut'];
        const rows = interventionsEnrichies.map((itv) => [
          itv.id,
          itv.formation?.module || '-',
          itv.marche?.reference || '-',
          itv.intervenant ? `${itv.intervenant.prenom} ${itv.intervenant.nom}` : '-',
          itv.masseHoraire,
          itv.tauxHoraire,
          itv.montantTotal,
          itv.totalPaye,
          itv.resteAPayer,
          itv.etat,
        ]);
        exportToCsv('recapitulatif_interventions', headers, rows);
        break;
      }

      case 'liste_paiements': {
        const headers = ['ID', 'Date', 'Intervenant', 'Formation', 'Mode', 'Référence', 'Montant (DH)'];
        const rows = paiements.map((p) => {
          const itv = interventionsEnrichies.find((i) => i.id === p.interventionId);
          return [
            p.id,
            formatDate(p.date),
            itv?.intervenant ? `${itv.intervenant.prenom} ${itv.intervenant.nom}` : '-',
            itv?.formation?.module || '-',
            p.mode,
            p.reference,
            p.montant,
          ];
        });
        exportToCsv('journal_paiements_intervenants', headers, rows);
        break;
      }

      case 'liste_decomptes': {
        const headers = ['ID', 'Numéro', 'Marché', 'Date Réception', 'Réf Virement', 'Montant Reçu (DH)', 'Observation'];
        const rows = decomptes.map((d) => {
          const m = marches.find((item) => item.id === d.marcheId);
          return [
            d.id,
            d.numero,
            m?.reference || d.marcheId,
            formatDate(d.date),
            d.referenceVirement,
            d.montantRecu,
            d.observation || '',
          ];
        });
        exportToCsv('journal_decomptes_recus', headers, rows);
        break;
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Barre de sélection du type de rapport et actions d'export */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              États Financiers & Éditions Administratives
            </h2>
            <p className="text-xs text-slate-500">
              Générez des rapports certifiés prêts pour l'impression ou l'exportation Excel.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCurrent}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Télécharger Excel (CSV)</span>
            </button>
            <button
              onClick={handlePrintDocument}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer le document</span>
            </button>
          </div>
        </div>

        {/* Boutons sélecteurs de modèles de rapports */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { key: 'etat_global', label: 'État Financier Global', icon: DollarSign },
            { key: 'fiche_marche', label: 'Fiche d\'un Marché', icon: Building2 },
            { key: 'fiche_intervenant', label: 'Fiche d\'un Intervenant', icon: Users2 },
            { key: 'recap_interventions', label: 'Récapitulatif Interventions', icon: FileText },
            { key: 'liste_paiements', label: 'Journal des Paiements', icon: Calendar },
            { key: 'liste_decomptes', label: 'Journal des Décomptes', icon: FileSpreadsheet },
          ].map((r) => {
            const Icon = r.icon;
            const isActive = activeRapport === r.key;
            return (
              <button
                key={r.key}
                onClick={() => setActiveRapport(r.key as RapportType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sélecteurs contextuels si rapport spécifique */}
        {activeRapport === 'fiche_marche' && (
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-700">Sélectionner le marché :</span>
            <select
              value={selectedMarcheId}
              onChange={(e) => setSelectedMarcheId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium"
            >
              {marches.map((m) => (
                <option key={m.id} value={m.id}>
                  Marché {m.reference} ({m.id}) — {m.objet.slice(0, 60)}...
                </option>
              ))}
            </select>
          </div>
        )}

        {activeRapport === 'fiche_intervenant' && (
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-700">Sélectionner l'intervenant :</span>
            <select
              value={selectedIntervenantId}
              onChange={(e) => setSelectedIntervenantId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium"
            >
              {intervenants.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nom} {i.prenom} ({i.specialite})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* FEUILLE DE RAPPORT OFFICIELLE (ZONE IMPRIMABLE PROPRE) */}
      <div
        id="printable-report"
        ref={reportSheetRef}
        className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-8 max-w-5xl mx-auto print:border-none print:shadow-none print:p-0"
      >
        {/* En-tête administratif officiel */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-700 flex items-center justify-center text-white print:border print:border-black">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-base font-bold uppercase tracking-tight text-slate-900">
                  Royaume du Maroc · Administration Publique
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Direction de la Formation Continue & Gestion des Marchés
                </p>
              </div>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="font-bold text-slate-800 block">Édition Administrative</span>
            <span className="text-slate-500 font-mono">Date : {formatDate(new Date().toISOString().slice(0, 10))}</span>
          </div>
        </div>

        {/* 1. ÉTAT FINANCIER GLOBAL DES MARCHÉS */}
        {activeRapport === 'etat_global' && (
          <div className="space-y-6">
            <div className="text-center pb-2">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                État Financier Consolidé des Marchés de Formation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Situation globale des engagements, recouvrements et paiements aux intervenants
              </p>
            </div>

            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Marché / Réf</th>
                  <th className="py-2.5 px-3">Objet</th>
                  <th className="py-2.5 px-3 text-right">Montant Marché</th>
                  <th className="py-2.5 px-3 text-right">Décomptes Reçus</th>
                  <th className="py-2.5 px-3 text-right">Reste à Recevoir</th>
                  <th className="py-2.5 px-3 text-right">Payé Interv.</th>
                  <th className="py-2.5 px-3 text-right">Solde Prév.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marches.map((m) => {
                  const s = getMarcheSituation(m.id);
                  return (
                    <tr key={m.id}>
                      <td className="py-2.5 px-3 font-bold font-mono text-slate-900">{m.reference}</td>
                      <td className="py-2.5 px-3 max-w-xs truncate text-slate-700">{m.objet}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900 tabular-nums">
                        {formatMontant(m.montant)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-700 font-semibold tabular-nums">
                        {formatMontant(s?.totalDecomptesRecus || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700 tabular-nums">
                        {formatMontant(s?.montantRestantARecevoir || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-blue-900 font-semibold tabular-nums">
                        {formatMontant(s?.totalPayeIntervenants || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {formatMontant(s?.soldePrevisionnel || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. FICHE DÉTAILLÉE D'UN MARCHÉ */}
        {activeRapport === 'fiche_marche' && currentMarcheSituation && (
          <div className="space-y-6">
            <div className="text-center pb-2">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                Fiche de Suivi Contractuel et Financier
              </h2>
              <p className="text-xs font-mono font-semibold text-blue-700 mt-0.5">
                Marché n° {currentMarcheSituation.marche.reference} ({currentMarcheSituation.marche.id})
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
              <p><span className="font-bold text-slate-700">Objet : </span>{currentMarcheSituation.marche.objet}</p>
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div><span className="font-semibold text-slate-600">Période : </span>{formatDate(currentMarcheSituation.marche.dateDebut)} → {formatDate(currentMarcheSituation.marche.dateFin)}</div>
                <div><span className="font-semibold text-slate-600">Montant Contractuel : </span><span className="font-bold text-slate-900">{formatMontant(currentMarcheSituation.marche.montant)}</span></div>
                <div><span className="font-semibold text-slate-600">Taux d'Encaissement : </span><span className="font-bold text-emerald-700">{formatPourcentage(currentMarcheSituation.tauxEncaissement)}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 border border-slate-200 rounded-lg space-y-1.5">
                <span className="font-bold text-slate-800 uppercase block mb-1">Recouvrement Marché</span>
                <div className="flex justify-between"><span>Décomptes reçus :</span><span className="font-bold text-emerald-700">{formatMontant(currentMarcheSituation.totalDecomptesRecus)}</span></div>
                <div className="flex justify-between"><span>Reste à recevoir :</span><span className="font-bold text-amber-800">{formatMontant(currentMarcheSituation.montantRestantARecevoir)}</span></div>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg space-y-1.5">
                <span className="font-bold text-slate-800 uppercase block mb-1">Dépenses Intervenants</span>
                <div className="flex justify-between"><span>Total honoraires prévus :</span><span className="font-bold text-slate-900">{formatMontant(currentMarcheSituation.montantTotalPrevuIntervenants)}</span></div>
                <div className="flex justify-between"><span>Total réglé aux intervenants :</span><span className="font-bold text-blue-900">{formatMontant(currentMarcheSituation.totalPayeIntervenants)}</span></div>
                <div className="flex justify-between"><span>Reste dû :</span><span className="font-bold text-rose-700">{formatMontant(currentMarcheSituation.resteAPayerIntervenants)}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* 3. FICHE FINANCIÈRE INDIVIDUELLE D'UN INTERVENANT */}
        {activeRapport === 'fiche_intervenant' && currentIntervenantSituation && (
          <div className="space-y-6">
            <div className="text-center pb-2">
              <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
                Fiche Individuelle d'Honoraires Intervenant
              </h2>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {currentIntervenantSituation.intervenant.prenom} {currentIntervenantSituation.intervenant.nom} · {currentIntervenantSituation.intervenant.specialite}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="p-3 border border-slate-200 rounded-lg"><span className="text-slate-500 block">Heures Totales</span><span className="font-bold text-slate-900 text-sm">{formatHeures(currentIntervenantSituation.masseHoraireTotale)}</span></div>
              <div className="p-3 border border-slate-200 rounded-lg"><span className="text-slate-500 block">Total Prévu</span><span className="font-bold text-slate-900 text-sm">{formatMontant(currentIntervenantSituation.montantTotalPrevu)}</span></div>
              <div className="p-3 border border-slate-200 rounded-lg"><span className="text-slate-500 block">Déjà Réglé</span><span className="font-bold text-emerald-700 text-sm">{formatMontant(currentIntervenantSituation.totalPaye)}</span></div>
              <div className="p-3 border border-slate-200 rounded-lg"><span className="text-slate-500 block">Reste à Payer</span><span className="font-bold text-rose-700 text-sm">{formatMontant(currentIntervenantSituation.resteAPayer)}</span></div>
            </div>

            <h4 className="text-xs font-bold uppercase text-slate-800 tracking-wider">Détail des modules assurés</h4>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Marché</th>
                  <th className="py-2 px-3">Formation</th>
                  <th className="py-2 px-3 text-right">Volume</th>
                  <th className="py-2 px-3 text-right">Taux / h</th>
                  <th className="py-2 px-3 text-right">Total Prévu</th>
                  <th className="py-2 px-3 text-right">Payé</th>
                  <th className="py-2 px-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentIntervenantSituation.interventions.map((itv) => (
                  <tr key={itv.id}>
                    <td className="py-2 px-3 font-mono">{itv.marche?.reference}</td>
                    <td className="py-2 px-3 font-medium text-slate-900">{itv.formation?.module}</td>
                    <td className="py-2 px-3 text-right tabular-nums">{formatHeures(itv.masseHoraire)}</td>
                    <td className="py-2 px-3 text-right tabular-nums font-mono">{formatMontant(itv.tauxHoraire)}/h</td>
                    <td className="py-2 px-3 text-right font-bold tabular-nums">{formatMontant(itv.montantTotal)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-emerald-700 tabular-nums">{formatMontant(itv.totalPaye)}</td>
                    <td className="py-2 px-3 text-right">{itv.etat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. RÉCAPITULATIF DES INTERVENTIONS */}
        {activeRapport === 'recap_interventions' && (
          <div className="space-y-4">
            <h2 className="text-center text-lg font-bold text-slate-900 uppercase tracking-tight">
              État Récapitulatif des Interventions et Engagements
            </h2>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2 px-2.5">ID</th>
                  <th className="py-2 px-2.5">Formation</th>
                  <th className="py-2 px-2.5">Intervenant</th>
                  <th className="py-2 px-2.5 text-right">Masse H.</th>
                  <th className="py-2 px-2.5 text-right">Taux H.</th>
                  <th className="py-2 px-2.5 text-right">Montant Total</th>
                  <th className="py-2 px-2.5 text-right">Payé</th>
                  <th className="py-2 px-2.5 text-right">Reste</th>
                  <th className="py-2 px-2.5 text-center">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interventionsEnrichies.map((itv) => (
                  <tr key={itv.id}>
                    <td className="py-2 px-2.5 font-mono text-slate-500">{itv.id}</td>
                    <td className="py-2 px-2.5 font-medium text-slate-900">{itv.formation?.module}</td>
                    <td className="py-2 px-2.5">{itv.intervenant?.nom} {itv.intervenant?.prenom}</td>
                    <td className="py-2 px-2.5 text-right tabular-nums">{formatHeures(itv.masseHoraire)}</td>
                    <td className="py-2 px-2.5 text-right font-mono tabular-nums">{formatMontant(itv.tauxHoraire)}</td>
                    <td className="py-2 px-2.5 text-right font-bold tabular-nums">{formatMontant(itv.montantTotal)}</td>
                    <td className="py-2 px-2.5 text-right text-emerald-700 font-semibold tabular-nums">{formatMontant(itv.totalPaye)}</td>
                    <td className="py-2 px-2.5 text-right text-rose-700 font-semibold tabular-nums">{formatMontant(itv.resteAPayer)}</td>
                    <td className="py-2 px-2.5 text-center">{itv.etat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. JOURNAL DES PAIEMENTS */}
        {activeRapport === 'liste_paiements' && (
          <div className="space-y-4">
            <h2 className="text-center text-lg font-bold text-slate-900 uppercase tracking-tight">
              Journal Chronologique des Paiements Intervenants
            </h2>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Réf / Reçu</th>
                  <th className="py-2 px-3">Intervenant</th>
                  <th className="py-2 px-3">Formation</th>
                  <th className="py-2 px-3">Mode</th>
                  <th className="py-2 px-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paiements.map((p) => {
                  const itv = interventionsEnrichies.find((i) => i.id === p.interventionId);
                  return (
                    <tr key={p.id}>
                      <td className="py-2 px-3 tabular-nums">{formatDate(p.date)}</td>
                      <td className="py-2 px-3 font-mono">{p.reference}</td>
                      <td className="py-2 px-3 font-semibold text-slate-900">{itv?.intervenant?.nom} {itv?.intervenant?.prenom}</td>
                      <td className="py-2 px-3 text-slate-700">{itv?.formation?.module}</td>
                      <td className="py-2 px-3 font-medium">{p.mode}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900 tabular-nums">{formatMontant(p.montant)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. JOURNAL DES DÉCOMPTES */}
        {activeRapport === 'liste_decomptes' && (
          <div className="space-y-4">
            <h2 className="text-center text-lg font-bold text-slate-900 uppercase tracking-tight">
              Journal des Décomptes Reçus des Entreprises
            </h2>
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Décompte N°</th>
                  <th className="py-2 px-3">Marché</th>
                  <th className="py-2 px-3">Date Réception</th>
                  <th className="py-2 px-3">Réf. Virement</th>
                  <th className="py-2 px-3">Observation</th>
                  <th className="py-2 px-3 text-right">Montant Encaissé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {decomptes.map((d) => {
                  const m = marches.find((item) => item.id === d.marcheId);
                  return (
                    <tr key={d.id}>
                      <td className="py-2 px-3 font-bold text-slate-900">Décompte {d.numero}</td>
                      <td className="py-2 px-3 font-mono text-slate-800">{m?.reference}</td>
                      <td className="py-2 px-3 tabular-nums">{formatDate(d.date)}</td>
                      <td className="py-2 px-3 font-mono">{d.referenceVirement}</td>
                      <td className="py-2 px-3 text-slate-500">{d.observation || '-'}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-800 tabular-nums">{formatMontant(d.montantRecu)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pied de page visa officiel */}
        <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-2 text-xs text-slate-700">
          <div>
            <span className="font-semibold block">L'Ordonnateur / Le Responsable Administratif</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Visa pour conformité et ordonnancement</span>
          </div>
          <div className="text-right">
            <span className="font-semibold block">Le Contrôleur Financier / Le Comptable Public</span>
            <span className="text-[11px] text-slate-400 mt-1 block">Signature et cachet officiel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
