import React, { useState, useMemo } from 'react';
import {
  CalendarCheck2,
  Plus,
  Search,
  Edit2,
  Trash2,
  FileSpreadsheet,
  CreditCard,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Intervention, EtatPaiement } from '../../types';
import { formatMontant, formatHeures } from '../../utils/formatters';
import { EtatPaiementBadge } from '../common/Badge';
import { InterventionFormModal } from './InterventionFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Pagination } from '../common/Pagination';
import { exportToCsv } from '../../utils/exportUtils';

interface InterventionsViewProps {
  onOpenAddPaiement?: (interventionId: string) => void;
}

export const InterventionsView: React.FC<InterventionsViewProps> = ({
  onOpenAddPaiement,
}) => {
  const {
    interventionsEnrichies,
    formations,
    intervenants,
    marches,
    deleteIntervention,
    hasPermission,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormationId, setSelectedFormationId] = useState<string>('ALL');
  const [selectedIntervenantId, setSelectedIntervenantId] = useState<string>('ALL');
  const [selectedEtat, setSelectedEtat] = useState<string>('ALL');

  const [interventionToEdit, setInterventionToEdit] = useState<Intervention | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [interventionToDelete, setInterventionToDelete] = useState<Intervention | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtrage
  const filteredInterventions = useMemo(() => {
    return interventionsEnrichies.filter((itv) => {
      if (selectedFormationId !== 'ALL' && itv.formationId !== selectedFormationId) {
        return false;
      }
      if (selectedIntervenantId !== 'ALL' && itv.intervenantId !== selectedIntervenantId) {
        return false;
      }
      if (selectedEtat !== 'ALL' && itv.etat !== selectedEtat) {
        return false;
      }

      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;

      const mod = itv.formation?.module.toLowerCase() || '';
      const intNom = itv.intervenant ? `${itv.intervenant.prenom} ${itv.intervenant.nom}`.toLowerCase() : '';
      const marcheRef = itv.marche?.reference.toLowerCase() || '';

      return (
        itv.id.toLowerCase().includes(term) ||
        mod.includes(term) ||
        intNom.includes(term) ||
        marcheRef.includes(term)
      );
    });
  }, [interventionsEnrichies, selectedFormationId, selectedIntervenantId, selectedEtat, searchTerm]);

  const paginatedInterventions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInterventions.slice(start, start + pageSize);
  }, [filteredInterventions, currentPage]);

  const handleExportCsv = () => {
    const headers = [
      'ID Intervention',
      'Marché',
      'Module / Formation',
      'Intervenant',
      'Masse Horaire (h)',
      'Taux Horaire (DH/h)',
      'Montant Total (DH)',
      'Total Payé (DH)',
      'Reste à Payer (DH)',
      'État Paiement',
      'Nombre Paiements',
    ];

    const rows = interventionsEnrichies.map((itv) => [
      itv.id,
      itv.marche?.reference || '-',
      itv.formation?.module || itv.formationId,
      itv.intervenant ? `${itv.intervenant.prenom} ${itv.intervenant.nom}` : itv.intervenantId,
      itv.masseHoraire,
      itv.tauxHoraire,
      itv.montantTotal,
      itv.totalPaye,
      itv.resteAPayer,
      itv.etat,
      itv.paiements.length,
    ]);

    exportToCsv('liste_interventions_affectations', headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Barre d'outils et filtres multiples */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par intervenant, module, marché..."
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
                  setInterventionToEdit(null);
                  setIsFormOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Intervention</span>
              </button>
            )}
          </div>
        </div>

        {/* Ligne des filtres */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Filtre Formation */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium whitespace-nowrap">Formation :</span>
            <select
              value={selectedFormationId}
              onChange={(e) => {
                setSelectedFormationId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Toutes les formations ({formations.length})</option>
              {formations.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.module} ({f.id})
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Intervenant */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium whitespace-nowrap">Intervenant :</span>
            <select
              value={selectedIntervenantId}
              onChange={(e) => {
                setSelectedIntervenantId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Tous les intervenants ({intervenants.length})</option>
              {intervenants.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nom} {i.prenom}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre État */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium whitespace-nowrap">État paiement :</span>
            <select
              value={selectedEtat}
              onChange={(e) => {
                setSelectedEtat(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Tous les états</option>
              <option value="Non payé">Non payé</option>
              <option value="En cours">En cours</option>
              <option value="Payé">Payé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des Interventions */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Formation & Marché</th>
                <th className="py-3 px-4">Intervenant</th>
                <th className="py-3 px-4 text-right">Masse Horaire</th>
                <th className="py-3 px-4 text-right">Taux Horaire</th>
                <th className="py-3 px-4 text-right">Montant Total</th>
                <th className="py-3 px-4 text-right">Total Payé</th>
                <th className="py-3 px-4 text-right">Reste à Payer</th>
                <th className="py-3 px-4 text-center">État</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedInterventions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <CalendarCheck2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Aucune intervention ne correspond aux critères.
                  </td>
                </tr>
              ) : (
                paginatedInterventions.map((itv) => (
                  <tr key={itv.id} className="hover:bg-blue-50/30 transition-colors group">
                    {/* Formation & Marché */}
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-semibold text-slate-900 block leading-tight">
                        {itv.formation?.module || itv.formationId}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Marché {itv.marche?.reference || '-'} ({itv.id})
                      </span>
                    </td>

                    {/* Intervenant */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {itv.intervenant ? `${itv.intervenant.prenom} ${itv.intervenant.nom}` : itv.intervenantId}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[150px]">
                        {itv.intervenant?.specialite || '-'}
                      </span>
                    </td>

                    {/* Masse Horaire */}
                    <td className="py-3 px-4 text-right font-medium text-slate-800 tabular-nums">
                      {formatHeures(itv.masseHoraire)}
                    </td>

                    {/* Taux Horaire */}
                    <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                      {formatMontant(itv.tauxHoraire)}/h
                    </td>

                    {/* Montant Total */}
                    <td className="py-3 px-4 text-right font-bold text-slate-900 tabular-nums">
                      {formatMontant(itv.montantTotal)}
                    </td>

                    {/* Total Payé */}
                    <td className="py-3 px-4 text-right font-semibold text-emerald-700 tabular-nums">
                      {formatMontant(itv.totalPaye)}
                      {itv.paiements.length > 0 && (
                        <span className="block text-[11px] text-slate-400 font-normal">
                          ({itv.paiements.length} versement{itv.paiements.length > 1 ? 's' : ''})
                        </span>
                      )}
                    </td>

                    {/* Reste à Payer */}
                    <td className="py-3 px-4 text-right font-semibold text-rose-700 tabular-nums">
                      {formatMontant(itv.resteAPayer)}
                    </td>

                    {/* État */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <EtatPaiementBadge etat={itv.etat} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {hasPermission('Gestionnaire') && itv.resteAPayer > 0 && onOpenAddPaiement && (
                          <button
                            onClick={() => onOpenAddPaiement(itv.id)}
                            className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center gap-1"
                            title="Régler un paiement pour cette intervention"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Payer</span>
                          </button>
                        )}

                        {hasPermission('Gestionnaire') && (
                          <button
                            onClick={() => {
                              setInterventionToEdit(itv);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Modifier l'intervention"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {hasPermission('Administrateur') && (
                          <button
                            onClick={() => setInterventionToDelete(itv)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Supprimer l'intervention"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredInterventions.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Formulaire Intervention */}
      <InterventionFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setInterventionToEdit(null);
        }}
        interventionToEdit={interventionToEdit}
      />

      {/* Dialogue de Confirmation */}
      <ConfirmDialog
        isOpen={!!interventionToDelete}
        onClose={() => setInterventionToDelete(null)}
        onConfirm={() => {
          if (interventionToDelete) {
            deleteIntervention(interventionToDelete.id);
          }
        }}
        title="Supprimer l'intervention"
        message={`Êtes-vous sûr de vouloir supprimer l'intervention "${interventionToDelete?.id}" ?`}
      />
    </div>
  );
};
