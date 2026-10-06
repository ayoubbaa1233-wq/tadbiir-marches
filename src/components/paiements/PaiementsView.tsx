import React, { useState, useMemo, useRef } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Calendar,
  Building,
  Coins,
  Minus,
  Square,
  X,
  Printer,
  Receipt,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Paiement, ModePaiement, InterventionEnrichie } from '../../types';
import { formatMontant, formatDate } from '../../utils/formatters';
import { PaiementFormModal } from './PaiementFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Pagination } from '../common/Pagination';
import { exportToCsv } from '../../utils/exportUtils';

interface PaiementsViewProps {
  initialInterventionFilter?: string | null;
}

export const PaiementsView: React.FC<PaiementsViewProps> = ({
  initialInterventionFilter,
}) => {
  const {
    paiements,
    interventionsEnrichies,
    deletePaiement,
    hasPermission,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');
  const [selectedIntervenantId, setSelectedIntervenantId] = useState<string>('ALL');

  const [paiementToEdit, setPaiementToEdit] = useState<Paiement | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [paiementToDelete, setPaiementToDelete] = useState<Paiement | null>(null);
  const [selectedPaiementForReceipt, setSelectedPaiementForReceipt] = useState<Paiement | null>(null);

  const receiptRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtrage
  const filteredPaiements = useMemo(() => {
    return paiements.filter((p) => {
      if (initialInterventionFilter && p.interventionId !== initialInterventionFilter) {
        return false;
      }
      if (selectedMode !== 'ALL' && p.mode !== selectedMode) {
        return false;
      }

      const itv = interventionsEnrichies.find((i) => i.id === p.interventionId);
      if (selectedIntervenantId !== 'ALL' && itv?.intervenantId !== selectedIntervenantId) {
        return false;
      }

      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;

      const intNom = itv?.intervenant ? `${itv.intervenant.prenom} ${itv.intervenant.nom}`.toLowerCase() : '';
      const mod = itv?.formation?.module.toLowerCase() || '';

      return (
        p.id.toLowerCase().includes(term) ||
        p.reference.toLowerCase().includes(term) ||
        intNom.includes(term) ||
        mod.includes(term) ||
        (p.observation && p.observation.toLowerCase().includes(term))
      );
    });
  }, [paiements, interventionsEnrichies, initialInterventionFilter, selectedMode, selectedIntervenantId, searchTerm]);

  const paginatedPaiements = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPaiements.slice(start, start + pageSize);
  }, [filteredPaiements, currentPage]);

  // Totaux filtrés
  const totalFiltre = useMemo(() => {
    return filteredPaiements.reduce((acc, p) => acc + p.montant, 0);
  }, [filteredPaiements]);

  const handleExportCsv = () => {
    const headers = [
      'ID Paiement',
      'Date',
      'Intervenant',
      'Formation / Module',
      'Marché',
      'Montant (DH)',
      'Mode',
      'Référence',
      'Observation',
    ];

    const rows = paiements.map((p) => {
      const itv = interventionsEnrichies.find((i) => i.id === p.interventionId);
      return [
        p.id,
        formatDate(p.date),
        itv?.intervenant ? `${itv.intervenant.prenom} ${itv.intervenant.nom}` : p.interventionId,
        itv?.formation?.module || '-',
        itv?.marche?.reference || '-',
        p.montant,
        p.mode,
        p.reference,
        p.observation || '',
      ];
    });

    exportToCsv('liste_paiements_intervenants', headers, rows);
  };

  const receiptIntervention = useMemo(() => {
    if (!selectedPaiementForReceipt) return undefined;
    return interventionsEnrichies.find((i) => i.id === selectedPaiementForReceipt.interventionId);
  }, [selectedPaiementForReceipt, interventionsEnrichies]);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    // Récupérer les styles de l'application pour préserver l'alignement, les polices et couleurs Tailwind
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reçu de Règlement - ${selectedPaiementForReceipt?.reference || ''}</title>
          <meta charset="UTF-8">
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: #ffffff;
              color: #0f172a;
              margin: 0;
              padding: 0;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
          ${styles}
        </head>
        <body class="bg-white p-4">
          ${printContent.innerHTML}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=850,height=1000');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    } else {
      // Fallback via iframe éphémère si le navigateur bloque les fenêtres contextuelles
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(printHtml);
        doc.close();
        iframe.contentWindow?.focus();
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 250);
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Barre d'outils et filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par référence, intervenant, module..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            {hasPermission('Gestionnaire') && (
              <button
                onClick={() => {
                  setPaiementToEdit(null);
                  setIsFormOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Paiement</span>
              </button>
            )}
          </div>
        </div>

        {/* Ligne des filtres et total */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            {/* Filtre Mode */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Mode :</span>
              <select
                value={selectedMode}
                onChange={(e) => {
                  setSelectedMode(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">Tous les modes</option>
                <option value="Virement">Virement bancaire</option>
                <option value="Espèces">Espèces</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            Total des règlements affichés :{' '}
            <span className="font-bold text-slate-900 tabular-nums text-sm">
              {formatMontant(totalFiltre)}
            </span>
          </div>
        </div>
      </div>

      {/* Tableau des Paiements dans un conteneur logiciel */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        {/* Barre de titre de fenêtre Chrome */}
        <div className="h-9 px-4 bg-[#0C1E36] text-white flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold tracking-tight">
              Paiements des Intervenants · Journal des Règlements
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Minus className="w-3 h-3 hover:text-white cursor-pointer" />
            <Square className="w-2.5 h-2.5 hover:text-white cursor-pointer" />
            <X className="w-3 h-3 hover:text-rose-400 cursor-pointer" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Paiement / Réf</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Intervenant</th>
                <th className="py-3 px-4">Formation / Marché</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Observation</th>
                <th className="py-3 px-4 text-right">Montant Réglé</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedPaiements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Aucun paiement enregistré pour cette sélection.
                  </td>
                </tr>
              ) : (
                paginatedPaiements.map((p) => {
                  const itv = interventionsEnrichies.find((i) => i.id === p.interventionId);
                  return (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                      {/* Réf & ID */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-slate-900 block">
                          {p.reference}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {p.id}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap tabular-nums">
                        {formatDate(p.date)}
                      </td>

                      {/* Intervenant */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">
                          {itv?.intervenant ? `${itv.intervenant.prenom} ${itv.intervenant.nom}` : p.interventionId}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate">
                          {itv?.intervenant?.telephone}
                        </span>
                      </td>

                      {/* Formation / Marché */}
                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-medium text-slate-800 line-clamp-1">
                          {itv?.formation?.module || '-'}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Marché {itv?.marche?.reference || '-'}
                        </span>
                      </td>

                      {/* Mode */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium font-mono ${
                            p.mode === 'Virement'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/80'
                          }`}
                        >
                          {p.mode === 'Virement' ? <Building className="w-3 h-3" /> : <Coins className="w-3 h-3" />}
                          {p.mode}
                        </span>
                      </td>

                      {/* Observation */}
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {p.observation || '-'}
                      </td>

                      {/* Montant Réglé */}
                      <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                        {formatMontant(p.montant)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedPaiementForReceipt(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Aperçu & Impression du Reçu"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {hasPermission('Gestionnaire') && (
                            <button
                              onClick={() => {
                                setPaiementToEdit(p);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Modifier le paiement"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {hasPermission('Administrateur') && (
                            <button
                              onClick={() => setPaiementToDelete(p)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Supprimer le paiement"
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
        <Pagination
          currentPage={currentPage}
          totalItems={filteredPaiements.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Formulaire Paiement */}
      <PaiementFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setPaiementToEdit(null);
        }}
        paiementToEdit={paiementToEdit}
      />

      {/* Dialogue de Confirmation */}
      <ConfirmDialog
        isOpen={!!paiementToDelete}
        onClose={() => setPaiementToDelete(null)}
        onConfirm={() => {
          if (paiementToDelete) {
            deletePaiement(paiementToDelete.id);
          }
        }}
        title="Supprimer le paiement"
        message={`Êtes-vous sûr de vouloir supprimer le paiement de ${paiementToDelete?.montant} DH (${paiementToDelete?.id}) ? Le reste à payer de l'intervention sera recalculé.`}
      />

      {/* Modale Aperçu & Impression du Reçu de Règlement */}
      {selectedPaiementForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* En-tête de la modale */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    Reçu de Règlement d'Honoraires
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Réf :{' '}
                    <span className="font-mono font-semibold text-slate-700">
                      {selectedPaiementForReceipt.reference}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPaiementForReceipt(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corps du Reçu (Aperçu fidèle du document officiel) */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-100/60">
              <div ref={receiptRef} className="bg-white rounded-xl border border-slate-300 shadow-xs p-5 sm:p-6 space-y-4 text-slate-900">
                {/* En-tête officiel du document */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-slate-200 gap-3">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Royaume du Maroc · Établissement de Formation
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Direction Administrative & Financière — Pôle Gestion des Formations
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-[11px] text-slate-600 font-mono">
                      Réf : <span className="font-bold text-slate-900">{selectedPaiementForReceipt.reference}</span>
                      <br />
                      Date : <span className="font-bold text-slate-900">{formatDate(selectedPaiementForReceipt.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Bannière titre du reçu */}
                <div className="text-center py-2.5 px-4 bg-blue-50/70 border border-blue-100 rounded-lg">
                  <h4 className="text-sm font-black uppercase text-blue-900 tracking-wide">
                    Reçu de Règlement d'Honoraires
                  </h4>
                  <p className="text-[11px] text-slate-600 font-mono">
                    Réf : {selectedPaiementForReceipt.reference} (ID : {selectedPaiementForReceipt.id})
                  </p>
                </div>

                {/* 2 Blocs : Intervenant Bénéficiaire & Formation / Marché */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bloc 1 : Intervenant Bénéficiaire */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                    <div className="px-3.5 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        1. Intervenant Bénéficiaire
                      </span>
                    </div>
                    <div className="p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Nom complet :</span>
                        <span className="font-bold text-slate-900 text-right">
                          {receiptIntervention?.intervenant
                            ? `${receiptIntervention.intervenant.prenom} ${receiptIntervention.intervenant.nom}`
                            : selectedPaiementForReceipt.interventionId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">N° CIN :</span>
                        <span className="font-bold font-mono text-slate-800">
                          {receiptIntervention?.intervenant?.cin || 'Non renseigné'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Téléphone :</span>
                        <span className="font-semibold text-slate-800">
                          {receiptIntervention?.intervenant?.telephone || 'Non renseigné'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500 font-medium">RIB bancaire :</span>
                        <span
                          className="font-mono text-[11px] font-bold text-slate-800 text-right truncate max-w-[170px]"
                          title={receiptIntervention?.intervenant?.rib}
                        >
                          {receiptIntervention?.intervenant?.rib || 'Non renseigné'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bloc 2 : Formation & Marché */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                    <div className="px-3.5 py-2 bg-slate-100/80 border-b border-slate-200 flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        2. Formation & Marché
                      </span>
                    </div>
                    <div className="p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Module / Formation :</span>
                        <span
                          className="font-bold text-slate-900 text-right truncate max-w-[170px]"
                          title={receiptIntervention?.formation?.module}
                        >
                          {receiptIntervention?.formation?.module || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Marché rattaché :</span>
                        <span
                          className="font-mono font-semibold text-slate-800 text-right truncate max-w-[170px]"
                          title={receiptIntervention?.marche ? `${receiptIntervention.marche.reference} — ${receiptIntervention.marche.objet}` : undefined}
                        >
                          {receiptIntervention?.marche ? `${receiptIntervention.marche.reference}` : (receiptIntervention?.formation?.marcheId || '-')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-100">
                        <span className="text-slate-500 font-medium">Mode de versement :</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                            selectedPaiementForReceipt.mode === 'Virement'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {selectedPaiementForReceipt.mode === 'Virement' ? <Building className="w-3 h-3" /> : <Coins className="w-3 h-3" />}
                          {selectedPaiementForReceipt.mode}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500 font-medium">Date de règlement :</span>
                        <span className="font-semibold text-slate-800 tabular-nums">
                          {formatDate(selectedPaiementForReceipt.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bloc Montant mis en valeur */}
                <div className="bg-emerald-50/90 border-2 border-emerald-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                  <div>
                    <span className="text-xs font-black uppercase text-emerald-800 tracking-wider block">
                      Net Versé au Titre des Honoraires
                    </span>
                    <span className="text-[11px] text-emerald-700 font-medium">
                      Ordonnancement validé · Règlement par {selectedPaiementForReceipt.mode.toLowerCase()} bancaire
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700 tabular-nums font-mono">
                    {formatMontant(selectedPaiementForReceipt.montant)}
                  </div>
                </div>

                {/* Observation éventuelle */}
                {selectedPaiementForReceipt.observation && (
                  <div className="p-2.5 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-xs text-slate-600">
                    <span className="font-bold text-slate-700">Observation :</span> {selectedPaiementForReceipt.observation}
                  </div>
                )}

                {/* Zones d'émargement et signatures officielles en bas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="border border-slate-300 rounded-xl p-3 h-28 flex flex-col justify-between bg-slate-50/40">
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tight pb-1 border-b border-slate-200">
                      POUR L'ADMINISTRATION — Visa & Cachet DAF / Ordonnateur
                    </span>
                    <div className="flex-1 flex items-center justify-center text-[10px] text-slate-300 italic">
                      [ Emplacement Cachet & Signature ]
                    </div>
                    <span className="text-[9px] text-slate-400 text-right">
                      Date & visa autorisé
                    </span>
                  </div>

                  <div className="border border-slate-300 rounded-xl p-3 h-28 flex flex-col justify-between bg-slate-50/40">
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-tight pb-1 border-b border-slate-200">
                      ÉMARGEMENT DU BÉNÉFICIAIRE — Pour acquit
                    </span>
                    <div className="flex-1 flex items-center justify-center text-[10px] text-slate-300 italic">
                      [ Signature précédée de la mention « Pour acquit » ]
                    </div>
                    <span className="text-[9px] text-slate-400 text-right">
                      Lu et approuvé
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pied de la modale */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setSelectedPaiementForReceipt(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Fermer
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le Reçu</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
