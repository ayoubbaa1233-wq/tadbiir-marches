import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Building2,
  FileSpreadsheet,
  Minus,
  Square,
  X,
  FileCheck2,
  CreditCard,
  Users,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MarcheSalaire } from '../../../types';
import { formatDate, formatMontant } from '../../../utils/formatters';
import { MarcheSalaireFormModal } from './MarcheSalaireFormModal';
import { MarcheSalaireDetailModal } from './MarcheSalaireDetailModal';
import { ConfirmDialog } from '../../common/ConfirmDialog';
import { Pagination } from '../../common/Pagination';
import { exportToCsv } from '../../../utils/exportUtils';

interface MarchesSalairesViewProps {
  onOpenAddDecompte?: (marcheId: string) => void;
  onOpenAddPaiement?: (marcheId: string) => void;
}

export const MarchesSalairesView: React.FC<MarchesSalairesViewProps> = ({
  onOpenAddDecompte,
  onOpenAddPaiement,
}) => {
  const {
    marchesSalaires,
    marchesSalairesSituations,
    deleteMarcheSalaire,
    hasPermission,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarcheDetailId, setSelectedMarcheDetailId] = useState<string | null>(null);
  const [marcheToEdit, setMarcheToEdit] = useState<MarcheSalaire | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [marcheToDelete, setMarcheToDelete] = useState<MarcheSalaire | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtrage
  const filteredMarches = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return marchesSalaires;
    return marchesSalaires.filter(
      (m) =>
        m.reference.toLowerCase().includes(term) ||
        m.objet.toLowerCase().includes(term) ||
        m.id.toLowerCase().includes(term)
    );
  }, [marchesSalaires, searchTerm]);

  const paginatedMarches = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMarches.slice(start, start + pageSize);
  }, [filteredMarches, currentPage, pageSize]);

  // Totaux globaux Salaires
  const totalContractuel = marchesSalaires.reduce((acc, m) => acc + m.montantContractuel, 0);
  const totalDecomptes = marchesSalairesSituations.reduce(
    (acc, s) => acc + s.totalDecomptesRecus,
    0
  );
  const resteGlobal = Math.max(0, totalContractuel - totalDecomptes);
  const totalSalaires = marchesSalairesSituations.reduce(
    (acc, s) => acc + s.totalSalairesVerses,
    0
  );

  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Référence Marché',
      'Objet du Marché',
      'Date Commencement',
      'Délai (Mois)',
      'Montant Contractuel (DH)',
      'Décomptes Reçus (DH)',
      'Reste à Recevoir (DH)',
      'Salaires Versés (DH)',
    ];

    const rows = marchesSalaires.map((m) => {
      const sit = marchesSalairesSituations.find((s) => s.marche.id === m.id);
      return [
        m.id,
        m.reference,
        m.objet,
        formatDate(m.dateCommencement),
        `${m.delaiMois} mois`,
        m.montantContractuel,
        sit?.totalDecomptesRecus || 0,
        sit?.resteARecevoir || 0,
        sit?.totalSalairesVerses || 0,
      ];
    });

    exportToCsv('marches_salaires', headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* 4 Cartes Synthétiques d'en-tête (Dominante Émeraude / Teal) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Marchés Salaires
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {marchesSalaires.length}
            </span>
            <span className="text-xs text-slate-500">conventions</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Personnel affecté et régie
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Budget Contractuel
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {formatMontant(totalContractuel)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Total des marchés engagés
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Décomptes Encaissés
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-emerald-800 font-mono tabular-nums">
              {formatMontant(totalDecomptes)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">
            {totalContractuel > 0
              ? `${((totalDecomptes / totalContractuel) * 100).toFixed(1)} % encaissés`
              : '0 %'}
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reste à Recevoir
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-amber-900 font-mono tabular-nums">
              {formatMontant(resteGlobal)}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Versements clients restants
          </p>
        </div>
      </div>

      {/* Barre d'actions & Recherche */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par référence, objet ou ID de marché..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-colors"
            />
          </div>

          {/* Boutons d'action */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Exporter CSV</span>
            </button>

            {hasPermission('Gestionnaire') && (
              <button
                type="button"
                onClick={() => {
                  setMarcheToEdit(null);
                  setIsFormOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau Marché (Salaires)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tableau logiciel des Marchés Salaires */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        {/* Barre de titre Chrome en vert émeraude foncé */}
        <div className="h-9 px-4 bg-[#082E2B] text-white flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold tracking-tight">
              Marchés de Salaires & Régies du Personnel
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
                <th className="py-3 px-4">Réf. Marché</th>
                <th className="py-3 px-4">Objet du Marché</th>
                <th className="py-3 px-4">Date Commencement</th>
                <th className="py-3 px-4">Délai / Période</th>
                <th className="py-3 px-4 text-right">Montant Contractuel</th>
                <th className="py-3 px-4 text-right">Total Décomptes</th>
                <th className="py-3 px-4 text-right">Reste à Recevoir</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMarches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Briefcase className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Aucun marché de salaires trouvé.
                  </td>
                </tr>
              ) : (
                paginatedMarches.map((m) => {
                  const sit = marchesSalairesSituations.find((s) => s.marche.id === m.id);
                  const totalDec = sit?.totalDecomptesRecus || 0;
                  const reste = sit?.resteARecevoir || 0;

                  return (
                    <tr
                      key={m.id}
                      onClick={() => setSelectedMarcheDetailId(m.id)}
                      className="hover:bg-emerald-50/40 transition-colors group cursor-pointer"
                    >
                      {/* Référence & ID */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block font-mono text-xs">
                          {m.reference}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {m.id}
                        </span>
                      </td>

                      {/* Objet */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-medium text-slate-800 line-clamp-2 leading-relaxed">
                          {m.objet}
                        </span>
                      </td>

                      {/* Date de commencement */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 tabular-nums">
                        {formatDate(m.dateCommencement)}
                      </td>

                      {/* Délai */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 font-medium">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]">
                          {m.delaiMois} mois
                        </span>
                      </td>

                      {/* Montant contractuel */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-slate-900 font-mono tabular-nums">
                        {formatMontant(m.montantContractuel)}
                      </td>

                      {/* Total décomptes */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-emerald-800 font-mono tabular-nums">
                        {formatMontant(totalDec)}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {sit?.nombreDecomptes || 0} acompte(s)
                        </span>
                      </td>

                      {/* Reste à recevoir */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono tabular-nums">
                        <span
                          className={`font-bold ${
                            reste > 0 ? 'text-amber-800' : 'text-emerald-700'
                          }`}
                        >
                          {formatMontant(reste)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedMarcheDetailId(m.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Consulter le détail du marché"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {hasPermission('Gestionnaire') && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setMarcheToEdit(m);
                                  setIsFormOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                                title="Modifier le marché"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setMarcheToDelete(m)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Supprimer le marché"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
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
        {filteredMarches.length > pageSize && (
          <div className="p-3 border-t border-slate-200">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredMarches.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Modal Création / Édition Marché Salaires */}
      {isFormOpen && (
        <MarcheSalaireFormModal
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setMarcheToEdit(null);
          }}
          marcheToEdit={marcheToEdit}
        />
      )}

      {/* Modal Consultation Détail Marché Salaires */}
      {selectedMarcheDetailId && (
        <MarcheSalaireDetailModal
          marcheId={selectedMarcheDetailId}
          onClose={() => setSelectedMarcheDetailId(null)}
          onOpenAddDecompte={onOpenAddDecompte}
          onOpenAddPaiement={onOpenAddPaiement}
        />
      )}

      {/* Boîte de dialogue de confirmation de suppression */}
      <ConfirmDialog
        isOpen={!!marcheToDelete}
        onClose={() => setMarcheToDelete(null)}
        onConfirm={() => {
          if (marcheToDelete) {
            deleteMarcheSalaire(marcheToDelete.id);
            setMarcheToDelete(null);
          }
        }}
        title="Supprimer le marché de salaires"
        message={`Êtes-vous sûr de vouloir supprimer définitivement le marché ${marcheToDelete?.reference} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
      />
    </div>
  );
};
