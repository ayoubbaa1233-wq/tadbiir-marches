import React, { useState, useMemo } from 'react';
import {
  Users2,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Phone,
  Mail,
  Minus,
  Square,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Intervenant } from '../../types';
import { formatMontant, formatHeures } from '../../utils/formatters';
import { IntervenantDetailModal } from './IntervenantDetailModal';
import { IntervenantFormModal } from './IntervenantFormModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Pagination } from '../common/Pagination';
import { exportToCsv } from '../../utils/exportUtils';

export const IntervenantsView: React.FC = () => {
  const { intervenants, deleteIntervenant, getIntervenantSituation, hasPermission } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntervenantId, setSelectedIntervenantId] = useState<string | null>(null);
  const [intervenantToEdit, setIntervenantToEdit] = useState<Intervenant | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [intervenantToDelete, setIntervenantToDelete] = useState<Intervenant | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  // Filtrage
  const filteredIntervenants = useMemo(() => {
    return intervenants.filter((i) => {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return true;
      return (
        i.nom.toLowerCase().includes(term) ||
        i.prenom.toLowerCase().includes(term) ||
        i.id.toLowerCase().includes(term) ||
        i.specialite.toLowerCase().includes(term) ||
        i.email.toLowerCase().includes(term) ||
        i.telephone.toLowerCase().includes(term)
      );
    });
  }, [intervenants, searchTerm]);

  const paginatedIntervenants = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredIntervenants.slice(start, start + pageSize);
  }, [filteredIntervenants, currentPage]);

  const handleExportCsv = () => {
    const headers = [
      'ID Intervenant',
      'Nom',
      'Prénom',
      'Spécialité',
      'Téléphone',
      'Email',
      'CIN',
      'RIB',
      'Heures Cumulées (h)',
      'Total Prévu (DH)',
      'Total Déjà Payé (DH)',
      'Reste à Payer (DH)',
    ];

    const rows = intervenants.map((i) => {
      const sit = getIntervenantSituation(i.id);
      return [
        i.id,
        i.nom,
        i.prenom,
        i.specialite,
        i.telephone,
        i.email,
        i.cin || '',
        i.rib || '',
        sit?.masseHoraireTotale || 0,
        sit?.montantTotalPrevu || 0,
        sit?.totalPaye || 0,
        sit?.resteAPayer || 0,
      ];
    });

    exportToCsv('liste_intervenants_experts', headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Barre d'outils et recherche */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rechercher par nom, spécialité, téléphone..."
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
                setIntervenantToEdit(null);
                setIsFormOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel Intervenant</span>
            </button>
          )}
        </div>
      </div>

      {/* Tableau des Intervenants dans un conteneur logiciel */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden">
        {/* Barre de titre de fenêtre Chrome */}
        <div className="h-9 px-4 bg-[#0C1E36] text-white flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <Users2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold tracking-tight">
              Répertoire des Intervenants · Corps Pédagogique
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
                <th className="py-3 px-4">Intervenant / Nom</th>
                <th className="py-3 px-4">Spécialité</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Heures Cumulées</th>
                <th className="py-3 px-4 text-right">Montant Prévu</th>
                <th className="py-3 px-4 text-right">Total Payé</th>
                <th className="py-3 px-4 text-right">Reste à Payer</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedIntervenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Aucun intervenant trouvé.
                  </td>
                </tr>
              ) : (
                paginatedIntervenants.map((i) => {
                  const sit = getIntervenantSituation(i.id);
                  return (
                    <tr
                      key={i.id}
                      className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      onClick={() => setSelectedIntervenantId(i.id)}
                    >
                      {/* Nom & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                            {i.nom.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block leading-tight">
                              {i.prenom} {i.nom}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              {i.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Spécialité */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-medium text-slate-800 line-clamp-1">
                          {i.specialite}
                        </span>
                        {i.cin && (
                          <span className="text-[11px] font-mono text-slate-400 block">
                            CIN: {i.cin}
                          </span>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="tabular-nums">{i.telephone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{i.email || '-'}</span>
                        </div>
                      </td>

                      {/* Heures cumulées */}
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700 tabular-nums">
                        {formatHeures(sit?.masseHoraireTotale || 0)}
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {sit?.interventions.length || 0} module(s)
                        </span>
                      </td>

                      {/* Montant prévu */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 tabular-nums">
                        {formatMontant(sit?.montantTotalPrevu || 0)}
                      </td>

                      {/* Total payé */}
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-700 tabular-nums">
                        {formatMontant(sit?.totalPaye || 0)}
                      </td>

                      {/* Reste à payer */}
                      <td className="py-3.5 px-4 text-right font-semibold text-rose-700 tabular-nums">
                        {formatMontant(sit?.resteAPayer || 0)}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-center whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedIntervenantId(i.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Consulter la fiche individuelle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {hasPermission('Gestionnaire') && (
                            <button
                              onClick={() => {
                                setIntervenantToEdit(i);
                                setIsFormOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Modifier l'intervenant"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {hasPermission('Administrateur') && (
                            <button
                              onClick={() => setIntervenantToDelete(i)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Supprimer l'intervenant"
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
          totalItems={filteredIntervenants.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Modal Fiche Individuelle Intervenant */}
      <IntervenantDetailModal
        intervenantId={selectedIntervenantId}
        onClose={() => setSelectedIntervenantId(null)}
      />

      {/* Modal Formulaire Intervenant */}
      <IntervenantFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setIntervenantToEdit(null);
        }}
        intervenantToEdit={intervenantToEdit}
      />

      {/* Dialogue de Confirmation */}
      <ConfirmDialog
        isOpen={!!intervenantToDelete}
        onClose={() => setIntervenantToDelete(null)}
        onConfirm={() => {
          if (intervenantToDelete) {
            deleteIntervenant(intervenantToDelete.id);
          }
        }}
        title="Supprimer l'intervenant"
        message={`Êtes-vous sûr de vouloir supprimer l'intervenant "${intervenantToDelete?.prenom} ${intervenantToDelete?.nom}" (${intervenantToDelete?.id}) ?`}
      />
    </div>
  );
};
