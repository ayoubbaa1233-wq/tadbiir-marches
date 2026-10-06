import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Users,
  Minus,
  Square,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Formation, NatureFormation } from '../../types';
import { formatDate } from '../../utils/formatters';
import { NatureFormationBadge } from '../common/Badge';
import { FormationFormModal } from './FormationFormModal';
import { FormationDetailModal } from './FormationDetailModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Pagination } from '../common/Pagination';
import { exportToCsv } from '../../utils/exportUtils';

interface FormationsViewProps {
  initialMarcheFilter?: string | null;
  onOpenAddIntervention?: (formationId: string) => void;
}

export const FormationsView: React.FC<FormationsViewProps> = ({
  initialMarcheFilter,
  onOpenAddIntervention,
}) => {
  const {
    formations,
    marches,
    interventionsEnrichies,
    deleteFormation,
    hasPermission,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarcheId, setSelectedMarcheId] = useState<string>(initialMarcheFilter || 'ALL');
  const [selectedNature, setSelectedNature] = useState<string>('ALL');
  const [selectedFiliere, setSelectedFiliere] = useState<string>('ALL');

  const [detailFormationId, setDetailFormationId] = useState<string | null>(null);
  const [formationToEdit, setFormationToEdit] = useState<Formation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState<Formation | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  // Liste unique des filières
  const uniqueFilieres = useMemo(() => {
    const set = new Set(formations.map((f) => f.filiere));
    return Array.from(set).sort();
  }, [formations]);

  // Filtrage
  const filteredFormations = useMemo(() => {
    return formations.filter((f) => {
      // Marché filter
      if (selectedMarcheId !== 'ALL' && f.marcheId !== selectedMarcheId) {
        return false;
      }
      // Nature filter
      if (selectedNature !== 'ALL' && f.nature !== selectedNature) {
        return false;
      }
      // Filière filter
      if (selectedFiliere !== 'ALL' && f.filiere !== selectedFiliere) {
        return false;
      }
      // Recherche textuelle
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      const marche = marches.find((m) => m.id === f.marcheId);
      return (
        f.module.toLowerCase().includes(term) ||
        f.id.toLowerCase().includes(term) ||
        f.filiere.toLowerCase().includes(term) ||
        (marche && marche.reference.toLowerCase().includes(term))
      );
    });
  }, [formations, selectedMarcheId, selectedNature, selectedFiliere, searchTerm, marches]);

  const paginatedFormations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFormations.slice(start, start + pageSize);
  }, [filteredFormations, currentPage]);

  const handleExportCsv = () => {
    const headers = [
      'ID Formation',
      'Marché Réf',
      'Intitulé Module',
      'Nature',
      'Filière',
      'Nombre Intervenants',
      'Description',
    ];

    const rows = formations.map((f) => {
      const marche = marches.find((m) => m.id === f.marcheId);
      const itvs = interventionsEnrichies.filter((i) => i.formationId === f.id);
      return [
        f.id,
        marche?.reference || f.marcheId,
        f.module,
        f.nature,
        f.filiere,
        itvs.length,
        f.description || '',
      ];
    });

    exportToCsv('liste_formations_modules', headers, rows);
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
              placeholder="Rechercher par intitulé de module, filière..."
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
                  setFormationToEdit(null);
                  setIsFormOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Formation</span>
              </button>
            )}
          </div>
        </div>

        {/* Ligne des filtres (Marché, Nature, Filière) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Filtre Marché */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium whitespace-nowrap">Marché :</span>
            <select
              value={selectedMarcheId}
              onChange={(e) => {
                setSelectedMarcheId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Tous les marchés ({marches.length})</option>
              {marches.map((m) => (
                <option key={m.id} value={m.id}>
                  Marché {m.reference} ({m.id})
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Nature */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium whitespace-nowrap">Nature :</span>
            <select
              value={selectedNature}
              onChange={(e) => {
                setSelectedNature(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Toutes les natures</option>
              <option value="Disciplinaire">Disciplinaire</option>
              <option value="Complémentaire">Complémentaire</option>
            </select>
          </div>

          {/* Filtre Filière */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium whitespace-nowrap">Filière :</span>
            <select
              value={selectedFiliere}
              onChange={(e) => {
                setSelectedFiliere(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Toutes les filières ({uniqueFilieres.length})</option>
              {uniqueFilieres.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des Formations sous conteneur logiciel */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        {/* Barre de titre de fenêtre Chrome */}
        <div className="h-9 px-4 bg-[#0C1E36] text-white flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold tracking-tight">
              Formations & Modules · Répertoire Pédagogique
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
                <th className="py-3 px-4">Module / Formation</th>
                <th className="py-3 px-4">Nature</th>
                <th className="py-3 px-4">Filière</th>
                <th className="py-3 px-4">Marché Associé</th>
                <th className="py-3 px-4 text-center">Intervenants</th>
                <th className="py-3 px-3 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedFormations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Aucune formation ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                paginatedFormations.map((f) => {
                  const marche = marches.find((m) => m.id === f.marcheId);
                  const itvs = interventionsEnrichies.filter((i) => i.formationId === f.id);
                  return (
                    <tr
                      key={f.id}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      onClick={() => setDetailFormationId(f.id)}
                    >
                      {/* Module & ID */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <span className="font-semibold text-slate-900 block leading-snug">
                          {f.module}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-normal">
                          {f.id}
                        </span>
                      </td>

                      {/* Nature */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <NatureFormationBadge nature={f.nature} />
                      </td>

                      {/* Filière */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {f.filiere}
                      </td>

                      {/* Marché */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-800 font-medium">
                          {marche?.reference || f.marcheId}
                        </span>
                        <span className="text-[11px] text-slate-400 block line-clamp-1">
                          {marche?.objet}
                        </span>
                      </td>

                      {/* Intervenants & Séances */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailFormationId(f.id);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-100/90 text-slate-700 hover:text-blue-800 font-semibold text-xs tabular-nums border border-slate-200/90 hover:border-blue-300 transition-all cursor-pointer shadow-2xs group-hover:bg-blue-50/80"
                          title="Consulter les intervenants et le calendrier des séances"
                        >
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            {itvs.length} {itvs.length > 1 ? 'intervenants' : 'intervenant'}
                          </span>
                        </button>
                      </td>

                      {/* Statut Badge */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                          PLANIFIÉ
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setDetailFormationId(f.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Détails de la formation"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {hasPermission('Gestionnaire') && (
                            <button
                              onClick={() => {
                                setFormationToEdit(f);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Modifier la formation"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {hasPermission('Administrateur') && (
                            <button
                              onClick={() => setFormationToDelete(f)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Supprimer la formation"
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
          totalItems={filteredFormations.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Détails Formation */}
      <FormationDetailModal
        formationId={detailFormationId}
        onClose={() => setDetailFormationId(null)}
        onOpenAddIntervention={onOpenAddIntervention}
      />

      {/* Modal Formulaire */}
      <FormationFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFormationToEdit(null);
        }}
        formationToEdit={formationToEdit}
      />

      {/* Dialogue de Confirmation */}
      <ConfirmDialog
        isOpen={!!formationToDelete}
        onClose={() => setFormationToDelete(null)}
        onConfirm={() => {
          if (formationToDelete) {
            deleteFormation(formationToDelete.id);
          }
        }}
        title="Supprimer la formation"
        message={`Êtes-vous sûr de vouloir supprimer la formation "${formationToDelete?.module}" (${formationToDelete?.id}) ?`}
      />
    </div>
  );
};
