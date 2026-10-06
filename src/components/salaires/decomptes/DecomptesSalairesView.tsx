import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  FileSpreadsheet,
  Calendar,
  X,
  TrendingUp,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { DecompteSalaire } from '../../../types';
import { formatDate, formatMontant } from '../../../utils/formatters';
import { DecompteSalaireFormModal } from './DecompteSalaireFormModal';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { Pagination } from '../../common/Pagination';
import { exportToCsv } from '../../../utils/exportUtils';

interface DecomptesSalairesViewProps {
  initialMarcheFilter?: string | null;
}

export const DecomptesSalairesView: React.FC<DecomptesSalairesViewProps> = ({
  initialMarcheFilter,
}) => {
  const {
    marchesSalaires,
    decomptesSalairesEnrichis,
    marchesSalairesSituations,
    deleteDecompteSalaire,
    hasPermission,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarcheId, setSelectedMarcheId] = useState<string>(
    initialMarcheFilter || 'all'
  );
  const [decompteToEdit, setDecompteToEdit] = useState<DecompteSalaire | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [decompteToDelete, setDecompteToDelete] = useState<DecompteSalaire | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtrage
  const filteredDecomptes = useMemo(() => {
    let result = decomptesSalairesEnrichis;

    if (selectedMarcheId !== 'all') {
      result = result.filter((d) => d.marcheSalaireId === selectedMarcheId);
    }

    const term = searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter(
        (d) =>
          d.referenceVirement.toLowerCase().includes(term) ||
          d.id.toLowerCase().includes(term) ||
          (d.observation && d.observation.toLowerCase().includes(term)) ||
          (d.marcheSalaire &&
            (d.marcheSalaire.reference.toLowerCase().includes(term) ||
              d.marcheSalaire.objet.toLowerCase().includes(term)))
      );
    }

    return result;
  }, [decomptesSalairesEnrichis, selectedMarcheId, searchTerm]);

  const paginatedDecomptes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDecomptes.slice(start, start + pageSize);
  }, [filteredDecomptes, currentPage, pageSize]);

  // Totaux globaux
  const totalEncaissé = decomptesSalairesEnrichis.reduce(
    (acc, d) => acc + d.montantRecu,
    0
  );
  const totalContractuel = marchesSalaires.reduce(
    (acc, m) => acc + m.montantContractuel,
    0
  );
  const resteARecevoirGlobal = Math.max(0, totalContractuel - totalEncaissé);
  const tauxEncaissementGlobal =
    totalContractuel > 0 ? (totalEncaissé / totalContractuel) * 100 : 0;

  const handleExportCsv = () => {
    const headers = [
      'ID Décompte',
      'N° Décompte',
      'Marché Réf',
      'Objet Marché',
      'Date Encaissement',
      'Montant Encaissé (DH)',
      'Référence Virement',
      'Observation',
    ];

    const rows = filteredDecomptes.map((d) => [
      d.id,
      `N° ${d.numero}`,
      d.marcheSalaire?.reference || d.marcheSalaireId,
      d.marcheSalaire?.objet || '',
      d.date,
      d.montantRecu,
      d.referenceVirement,
      d.observation || '',
    ]);

    exportToCsv(
      `decomptes_salaires_${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows
    );
  };

  const handleConfirmDelete = () => {
    if (!decompteToDelete) return;
    deleteDecompteSalaire(decompteToDelete.id);
    setDecompteToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Cartes KPI Synthétiques (Émeraude / Teal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Total Encaissé */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Décomptes Reçus
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-700 font-mono">
                {formatMontant(totalEncaissé)}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 : Nombre de Décomptes */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Nombre de Décomptes
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {decomptesSalairesEnrichis.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">opérations</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 : Reste à Recevoir */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Reste Global à Recevoir
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-700 font-mono">
                {formatMontant(resteARecevoirGlobal)}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 : Taux de Recouvrement */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Taux Moyen Recouvrement
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-teal-700 font-mono">
                {tauxEncaissementGlobal.toFixed(1)} %
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 2. Barre d'outils et Filtres */}
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
              placeholder="Rechercher par référence virement, marché, ID..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
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

          {/* Filtre par Marché de Salaires */}
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
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium text-slate-700 max-w-[260px] truncate"
            >
              <option value="all">Tous les marchés de salaires</option>
              {marchesSalaires.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.reference} — {m.objet.slice(0, 35)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Boutons d'Action */}
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
                setDecompteToEdit(null);
                setIsFormOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nouveau Décompte
            </button>
          )}
        </div>
      </div>

      {/* 3. Tableau des Décomptes Salaires */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">N° Décompte</th>
                <th className="py-3 px-4">Marché de Salaires Lié</th>
                <th className="py-3 px-4">Date de Règlement</th>
                <th className="py-3 px-4">Réf. Virement / Avis</th>
                <th className="py-3 px-4 text-right">Montant Encaissé</th>
                <th className="py-3 px-4">Observations</th>
                <th className="py-3 px-4 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDecomptes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <FileCheck2 className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">
                        Aucun décompte trouvé
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Modifiez vos critères ou enregistrez un premier décompte pour vos marchés.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedDecomptes.map((decompte) => {
                  const marche = decompte.marcheSalaire;
                  const sit = marche
                    ? marchesSalairesSituations.find((s) => s.marche.id === marche.id)
                    : null;

                  return (
                    <tr
                      key={decompte.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* N° Décompte */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                            {decompte.numero}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block">
                              Décompte N° {decompte.numero}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 block">
                              {decompte.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Marché Lié */}
                      <td className="py-3 px-4">
                        {marche ? (
                          <div>
                            <span className="font-mono font-bold text-slate-800 text-[11px] block">
                              Marché {marche.reference}
                            </span>
                            <span
                              className="text-slate-500 text-[11px] truncate max-w-[240px] block"
                              title={marche.objet}
                            >
                              {marche.objet}
                            </span>
                            {sit && (
                              <span className="text-[10px] text-emerald-700 font-medium">
                                Recouvert à {sit.tauxEncaissement.toFixed(0)}% (Reste: {formatMontant(sit.resteARecevoir)})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="font-mono text-slate-400">
                            {decompte.marcheSalaireId}
                          </span>
                        )}
                      </td>

                      {/* Date de règlement */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="tabular-nums">{formatDate(decompte.date)}</span>
                        </div>
                      </td>

                      {/* Référence virement */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-slate-800 text-[11px] block">
                          {decompte.referenceVirement}
                        </span>
                      </td>

                      {/* Montant Encaissé */}
                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-bold text-emerald-700 text-sm block">
                          {formatMontant(decompte.montantRecu)}
                        </span>
                      </td>

                      {/* Observations */}
                      <td className="py-3 px-4">
                        <span
                          className="text-slate-500 text-xs truncate max-w-[180px] block"
                          title={decompte.observation}
                        >
                          {decompte.observation || '—'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {hasPermission('Gestionnaire') && (
                            <button
                              type="button"
                              onClick={() => {
                                setDecompteToEdit(decompte);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                              title="Modifier le décompte"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {hasPermission('Administrateur') && (
                            <button
                              type="button"
                              onClick={() => setDecompteToDelete(decompte)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Supprimer le décompte"
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
            totalItems={filteredDecomptes.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal Formulaire Décompte */}
      <DecompteSalaireFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setDecompteToEdit(null);
        }}
        decompteToEdit={decompteToEdit}
        defaultMarcheId={selectedMarcheId !== 'all' ? selectedMarcheId : undefined}
      />

      {/* Dialogue de Confirmation de Suppression */}
      <ConfirmDialog
        isOpen={!!decompteToDelete}
        title="Supprimer le décompte"
        message={`Êtes-vous sûr de vouloir supprimer le Décompte N° ${decompteToDelete?.numero} (${decompteToDelete?.id}) d'un montant de ${decompteToDelete ? formatMontant(decompteToDelete.montantRecu) : ''} ?\nCette opération recalculera immédiatement le solde du marché.`}
        confirmLabel="Supprimer définitivement"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setDecompteToDelete(null)}
      />
    </div>
  );
};
