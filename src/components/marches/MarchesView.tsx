import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
  ExternalLink,
  Minus,
  Square,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Marche } from '../../types';
import { formatMontant, formatDate, formatPourcentage } from '../../utils/formatters';
import { MarcheDetailModal } from './MarcheDetailModal';
import { MarcheFormModal } from './MarcheFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Pagination } from '../common/Pagination';
import { exportToCsv } from '../../utils/exportUtils';

interface MarchesViewProps {
  onSelectMarcheFilter?: (marcheId: string) => void;
  onOpenAddFormation?: (marcheId: string) => void;
  onOpenAddDecompte?: (marcheId: string) => void;
}

export const MarchesView: React.FC<MarchesViewProps> = ({
  onSelectMarcheFilter,
  onOpenAddFormation,
  onOpenAddDecompte,
}) => {
  const { marches, deleteMarche, getMarcheSituation, hasPermission } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMarcheId, setSelectedMarcheId] = useState<string | null>(null);
  const [marcheToEdit, setMarcheToEdit] = useState<Marche | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [marcheToDelete, setMarcheToDelete] = useState<Marche | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Filtrage et recherche
  const filteredMarches = useMemo(() => {
    return marches.filter((m) => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      return (
        m.reference.toLowerCase().includes(term) ||
        m.id.toLowerCase().includes(term) ||
        m.objet.toLowerCase().includes(term) ||
        (m.observations && m.observations.toLowerCase().includes(term))
      );
    });
  }, [marches, searchTerm]);

  // Données paginées
  const paginatedMarches = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMarches.slice(start, start + pageSize);
  }, [filteredMarches, currentPage]);

  const handleExportCsv = () => {
    const headers = [
      'ID Marché',
      'Référence',
      'Objet',
      'Date début',
      'Date fin',
      'Montant Marché (DH)',
      'Total Décomptes Reçus (DH)',
      'Reste à Recevoir (DH)',
      'Total Prévu Intervenants (DH)',
      'Total Payé Intervenants (DH)',
      'Solde Prévisionnel (DH)',
      'Observations',
    ];

    const rows = marches.map((m) => {
      const sit = getMarcheSituation(m.id);
      return [
        m.id,
        m.reference,
        m.objet,
        formatDate(m.dateDebut),
        formatDate(m.dateFin),
        m.montant,
        sit?.totalDecomptesRecus || 0,
        sit?.montantRestantARecevoir || 0,
        sit?.montantTotalPrevuIntervenants || 0,
        sit?.totalPayeIntervenants || 0,
        sit?.soldePrevisionnel || 0,
        m.observations || '',
      ];
    });

    exportToCsv('liste_marches_formation', headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Barre d'outils et recherche */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par référence, objet, identifiant..."
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
            title="Exporter la liste au format Excel CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          {hasPermission('Gestionnaire') && (
            <button
              onClick={() => {
                setMarcheToEdit(null);
                setIsFormOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Marché</span>
            </button>
          )}
        </div>
      </div>

      {/* Tableau des Marchés dans un conteneur style logiciel de gestion */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        {/* Barre de titre de fenêtre Chrome */}
        <div className="h-9 px-4 bg-[#0C1E36] text-white flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold tracking-tight">
              Marchés de Formation · Registre des Conventions
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
                <th className="py-3 px-4">Marché / Référence</th>
                <th className="py-3 px-4">Objet de la formation</th>
                <th className="py-3 px-4">Période</th>
                <th className="py-3 px-4 text-right">Montant Marché</th>
                <th className="py-3 px-4 text-right">Décomptes Reçus</th>
                <th className="py-3 px-4 text-right">Reste à Recevoir</th>
                <th className="py-3 px-4 text-right">Payé Interv.</th>
                <th className="py-3 px-3 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedMarches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Briefcase className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Aucun marché trouvé pour cette recherche.
                  </td>
                </tr>
              ) : (
                paginatedMarches.map((m) => {
                  const sit = getMarcheSituation(m.id);
                  const isPaid = (sit?.tauxEncaissement || 0) >= 100;
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedMarcheId(m.id)}
                    >
                      {/* Réf & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono text-sm">
                            {m.reference}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {m.id}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {sit?.nombreFormations || 0} formation(s) · {sit?.nombreIntervenants || 0} interv.
                        </span>
                      </td>

                      {/* Objet */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-medium text-slate-900 line-clamp-2 leading-relaxed">
                          {m.objet}
                        </p>
                        {m.observations && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {m.observations}
                          </p>
                        )}
                      </td>

                      {/* Période */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap tabular-nums">
                        {formatDate(m.dateDebut)}
                        <span className="text-slate-400 mx-1">→</span>
                        {formatDate(m.dateFin)}
                      </td>

                      {/* Montant Marché */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums">
                        {formatMontant(m.montant)}
                      </td>

                      {/* Décomptes Reçus */}
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-700 tabular-nums">
                        {formatMontant(sit?.totalDecomptesRecus || 0)}
                        <span className="block text-[11px] text-emerald-600 font-normal">
                          {formatPourcentage(sit?.tauxEncaissement || 0)}
                        </span>
                      </td>

                      {/* Reste à Recevoir */}
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700 tabular-nums">
                        {formatMontant(sit?.montantRestantARecevoir || 0)}
                      </td>

                      {/* Payé Intervenants */}
                      <td className="py-3.5 px-4 text-right font-semibold text-blue-800 tabular-nums">
                        {formatMontant(sit?.totalPayeIntervenants || 0)}
                        <span className="block text-[11px] text-slate-400 font-normal">
                          sur {formatMontant(sit?.montantTotalPrevuIntervenants || 0)}
                        </span>
                      </td>

                      {/* Statut Badge */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isPaid ? 'PAYÉ' : 'EN COURS'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedMarcheId(m.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Consulter la fiche détaillée"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {hasPermission('Gestionnaire') && (
                            <button
                              onClick={() => {
                                setMarcheToEdit(m);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Modifier les informations"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {hasPermission('Administrateur') && (
                            <button
                              onClick={() => setMarcheToDelete(m)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Supprimer le marché"
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
          totalItems={filteredMarches.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Fiche Détaillée */}
      <MarcheDetailModal
        marcheId={selectedMarcheId}
        onClose={() => setSelectedMarcheId(null)}
        onOpenAddFormation={onOpenAddFormation}
        onOpenAddDecompte={onOpenAddDecompte}
      />

      {/* Modal Création / Édition */}
      <MarcheFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setMarcheToEdit(null);
        }}
        marcheToEdit={marcheToEdit}
      />

      {/* Dialogue de Confirmation de Suppression */}
      <ConfirmDialog
        isOpen={!!marcheToDelete}
        onClose={() => setMarcheToDelete(null)}
        onConfirm={() => {
          if (marcheToDelete) {
            deleteMarche(marcheToDelete.id);
          }
        }}
        title="Supprimer le marché"
        message={`Êtes-vous sûr de vouloir supprimer le marché "${marcheToDelete?.reference}" (${marcheToDelete?.id}) ? Cette action est irréversible.`}
        confirmLabel="Confirmer la suppression"
      />
    </div>
  );
};
