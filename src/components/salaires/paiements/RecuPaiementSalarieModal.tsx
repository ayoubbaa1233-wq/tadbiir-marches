import React, { useRef } from 'react';
import { Modal } from '../../common/Modal';
import { PaiementSalarieEnrichi } from '../../../types';
import { formatDate, formatMontant } from '../../../utils/formatters';
import { Printer, CheckCircle2, Building2, User } from 'lucide-react';

interface RecuPaiementSalarieModalProps {
  paiement: PaiementSalarieEnrichi | null;
  onClose: () => void;
}

export const RecuPaiementSalarieModal: React.FC<RecuPaiementSalarieModalProps> = ({
  paiement,
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!paiement) return null;

  const salarie = paiement.salarie;
  const marche = paiement.marcheSalaire;

  const handlePrint = () => {
    if (!receiptRef.current) return;
    const receiptElementHtml = receiptRef.current.innerHTML;

    // Récupérer toutes les feuilles de style de l'application (Tailwind & styles personnalisés)
    const headStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    const printDocumentHtml = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Reçu de Règlement - ${paiement.reference || paiement.id}</title>
    ${headStyles}
    <style>
      @page {
        size: A4 portrait;
        margin: 12mm 15mm;
      }
      *, *::before, *::after {
        box-sizing: border-box;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background: #ffffff !important;
        color: #0f172a !important;
        margin: 0 !important;
        padding: 24px !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .recu-container {
        width: 100%;
        max-width: 750px;
        margin: 0 auto;
        background: #ffffff;
      }
      button, .no-print {
        display: none !important;
      }
    </style>
  </head>
  <body>
    <div class="recu-container">
      ${receiptElementHtml}
    </div>
  </body>
</html>`;

    // Tentative d'ouverture de fenêtre dédiée
    let printWindow: Window | null = null;
    try {
      printWindow = window.open('', '_blank', 'width=800,height=900');
    } catch {
      printWindow = null;
    }

    if (printWindow && printWindow.document) {
      printWindow.document.open();
      printWindow.document.write(printDocumentHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        try {
          printWindow?.print();
          printWindow?.close();
        } catch (e) {
          console.error(e);
        }
      }, 250);
    } else {
      // Fallback via iframe éphémère si popup bloquée
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.setAttribute('aria-hidden', 'true');
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(printDocumentHtml);
        doc.close();
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.error(e);
          } finally {
            setTimeout(() => {
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
              }
            }, 1000);
          }
        }, 250);
      }
    }
  };

  return (
    <Modal
      isOpen={!!paiement}
      onClose={onClose}
      title="Reçu de Règlement de Salaire"
      subtitle={`Justificatif officiel d'ordonnancement — Réf : ${paiement.reference}`}
      maxWidth="2xl"
    >
      <div className="space-y-5 text-slate-800">
        {/* Cadre Reçu Imprimable */}
        <div
          ref={receiptRef}
          id="recu-paiement-salarie-sheet"
          className="p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-xs space-y-5"
        >
          {/* En-tête Officiel */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                Administration Publique · DAF
              </span>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight mt-0.5">
                Bordereau / Reçu de Paiement
              </h3>
              <p className="text-xs text-teal-700 font-semibold font-mono mt-0.5">
                Période de paie : {paiement.periode}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Règlement Effectué
              </span>
              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                ID Système : {paiement.id}
              </span>
            </div>
          </div>

          {/* Informations Salarié & Marché */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Bénéficiaire */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <User className="w-3 h-3 text-teal-600" />
                Salarié Bénéficiaire
              </span>
              <p className="text-sm font-bold text-slate-900">
                {salarie ? `${salarie.prenom} ${salarie.nom}` : paiement.salarieId}
              </p>
              <div className="space-y-0.5 text-slate-600">
                <p>
                  CIN : <span className="font-mono font-semibold text-slate-800">{salarie?.cin || '—'}</span>
                </p>
                <p>
                  Spécialité : <span className="font-medium text-slate-800">{salarie?.specialite || '—'}</span>
                </p>
                <p>
                  Lieu : <span className="font-medium text-teal-800">{salarie?.lieuAffectation || '—'}</span>
                </p>
                <p className="text-[11px] truncate">
                  RIB : <span className="font-mono text-slate-700">{salarie?.rib || 'Non renseigné'}</span>
                </p>
              </div>
            </div>

            {/* Marché et Imputation */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-teal-600" />
                Convention & Affectation
              </span>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {marche ? `Marché ${marche.reference}` : paiement.marcheSalaireId}
              </p>
              <p className="text-slate-600 text-[11px] line-clamp-2">
                {marche?.objet || 'Marché d’affectation de personnel'}
              </p>
              <div className="pt-1 mt-1 border-t border-slate-200 text-slate-600 space-y-0.5">
                <p>
                  Mode de versement :{' '}
                  <span className="font-bold text-slate-800">{paiement.mode}</span>
                </p>
                <p>
                  Date effective :{' '}
                  <span className="font-semibold text-slate-800 tabular-nums">
                    {formatDate(paiement.date)}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Détail Financier du Montant */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-900 block">
                Net Versé au Titre du Mois
              </span>
              <span className="text-[11px] text-emerald-700 font-mono">
                Réf. Transaction / Chèque : {paiement.reference}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-800 font-mono block">
                {formatMontant(paiement.montant)}
              </span>
              <span className="text-[10px] font-medium text-emerald-600 block">
                Arrêté net à payer
              </span>
            </div>
          </div>

          {paiement.observation && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Observation : </span>
              {paiement.observation}
            </div>
          )}

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs">
            <div className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                Pour l'Administration
              </span>
              <span className="text-slate-700 font-medium block mt-1">Visa & Cachet DAF</span>
              <div className="h-10 mt-2" />
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                Émargement du Bénéficiaire
              </span>
              <span className="text-slate-700 font-medium block mt-1">Pour acquit</span>
              <div className="h-10 mt-2" />
            </div>
          </div>
        </div>

        {/* Boutons d'Action (masqués à l'impression) */}
        <div className="flex items-center justify-between pt-2 no-print">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Imprimer le Reçu
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
};
