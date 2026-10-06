import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Receipt,
  PiggyBank,
  Minus,
  Square,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Decompte } from '../../types';
import { formatMontant, formatDate } from '../../utils/formatters';
import { DecompteFormModal } from './DecompteFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Pagination } from '../common/Pagination';
import { exportToCsv } from '../../utils/exportUtils';

interface DecomptesViewProps {
  initialMarcheFilter?: string | null;
}

export const DecomptesView: React.FC<DecomptesViewProps> = ({
  initialMarcheFilter,
}) => {
  const { decomptes, marches, deleteDecompte, hasPermission } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarcheId, setSelectedMarcheId] = useState<string>(initialMarcheFilter || 'ALL');

  const [decompteToEdit, setDecompteToEdit] = useState<Decompte | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [decompteToDelete, setDecompteToDelete] = useState<Decompte | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtrage
  const filteredDecomptes = useMemo(() => {
    return decomptes.filter((d) => {
      if (selectedMarcheId !== 'ALL' && d.marcheId !== selectedMarcheId) {
        return false;
      }

      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;

      const marche = marches.find((m) => m.id === d.marcheId);
      const marcheRef = marche?.reference.toLowerCase() || '';

      return (
        d.id.toLowerCase().includes(term) ||
        d.referenceVirement.toLowerCase().includes(term) ||
        marcheRef.includes(term) ||
        `décompte ${d.numero}`.includes(term) ||
        (d.observation && d.observation.toLowerCase().includes(term))
      );
    });
  }, [decomptes, selectedMarcheId, searchTerm, marches]);

  const paginatedDecomptes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDecomptes.slice(start, start + pageSize);
  }, [filteredDecomptes, currentPage]);

  const totalFiltre = useMemo(() => {
    return filteredDecomptes.reduce((acc, d) => acc + d.montantRecu, 0);
  }, [filteredDecomptes]);

  const handleExportCsv = () => {
    const headers = [
      'ID Décompte',
      'Numéro',
      'Marché Réf',
      'Marché Objet',
      'Date Encaissement',
      'Montant Reçu (DH)',
      'Référence Virement',
      'Observation',
    ];

    const rows = decomptes.map((d) => {
      const marche = marches.find((m) => m.id === d.marcheId);
      return [
        d.id,
        d.numero,
        marche?.reference || d.marcheId,
        marche?.objet || '-',
        formatDate(d.date),
        d.montantRecu,
        d.referenceVirement,
        d.observation || '',
      ];
    });

    exportToCsv('liste_decomptes_entreprises', headers, rows);
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
              placeholder="Rechercher par référence virement, décompte, marché..."
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
                  setDecompteToEdit(null);
                  setIsFormOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Décompte</span>
              </button>
            )}
          </div>
        </div>

        {/* Ligne des filtres et total */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium whitespace-nowrap">Marché :</span>
            <select
              value={selectedMarcheId}
              onChange={(e) => {
                setSelectedMarcheId(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Tous les marchés ({marches.length})</option>
              {marches.map((m) => (
                <option key={m.id} value={m.id}>
                  Marché {m.reference} ({m.id})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-600 font-medium">
            Total des décomptes perçus :{' '}
            <span className="font-bold text-emerald-700 tabular-nums text-sm">
              {formatMontant(totalFiltre)}
            </span>
          </div>
        </div>
      </div>

      {/* Tableau des Décomptes sous conteneur logiciel */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        {/* Barre de titre de fenêtre Chrome */}
        <div className="h-9 px-4 bg-[#0C1E36] text-white flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold tracking-tight">
              Décomptes Reçus de l'Entreprise · Recouvrement
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
                <th className="py-3 px-4">Décompte N°</th>
                <th className="py-3 px-4">Marché Associé</th>
                <th className="py-3 px-4">Date de Réception</th>
                <th className="py-3 px-4">Réf. Virement / Trésorerie</th>
                <th className="py-3 px-4">Observation</th>
                <th className="py-3 px-4 text-right">Montant Reçu</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDecomptes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Aucun décompte trouvé pour ce filtre.
                  </td>
                </tr>
              ) : (
                paginatedDecomptes.map((d) => {
                  const marche = marches.find((m) => m.id === d.marcheId);
                  return (
                    <tr key={d.id} className="hover:bg-blue-50/30 transition-colors group">
                      {/* Numéro & ID */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block text-sm">
                          Décompte n° {d.numero}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {d.id}
                        </span>
                      </td>

                      {/* Marché */}
                      <td className="py-3 px-4 max-w-xs">
                        <span className="font-mono font-medium text-slate-800">
                          Marché {marche?.reference || d.marcheId}
                        </span>
                        <span className="text-[11px] text-slate-400 block line-clamp-1">
                          {marche?.objet}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap tabular-nums">
                        {formatDate(d.date)}
                      </td>

                      {/* Réf Virement */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {d.referenceVirement}
                      </td>

                      {/* Observation */}
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {d.observation || '-'}
                      </td>

                      {/* Montant Reçu */}
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 tabular-nums text-sm">
                        {formatMontant(d.montantRecu)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {hasPermission('Gestionnaire') && (
                            <button
                              onClick={() => {
                                setDecompteToEdit(d);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Modifier le décompte"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {hasPermission('Administrateur') && (
                            <button
                              onClick={() => setDecompteToDelete(d)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
        <Pagination
          currentPage={currentPage}
          totalItems={filteredDecomptes.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Formulaire Décompte */}
      <DecompteFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setDecompteToEdit(null);
        }}
        decompteToEdit={decompteToEdit}
      />

      {/* Dialogue de Confirmation */}
      <ConfirmDialog
        isOpen={!!decompteToDelete}
        onClose={() => setDecompteToDelete(null)}
        onConfirm={() => {
          if (decompteToDelete) {
            deleteDecompte(decompteToDelete.id);
          }
        }}
        title="Supprimer le décompte"
        message={`Êtes-vous sûr de vouloir supprimer le décompte n°${decompteToDelete?.numero} d'un montant de ${decompteToDelete?.montantRecu} DH ? Le solde à recevoir du marché sera réactualisé.`}
      />
    </div>
  );
};
