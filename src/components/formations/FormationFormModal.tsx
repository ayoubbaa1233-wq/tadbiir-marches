import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Formation, NatureFormation } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateNextId } from '../../utils/formatters';

interface FormationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formationToEdit?: Formation | null;
  defaultMarcheId?: string;
}

export const FormationFormModal: React.FC<FormationFormModalProps> = ({
  isOpen,
  onClose,
  formationToEdit,
  defaultMarcheId,
}) => {
  const { formations, marches, addFormation, updateFormation } = useApp();

  const [marcheId, setMarcheId] = useState('');
  const [nature, setNature] = useState<NatureFormation>('Disciplinaire');
  const [module, setModule] = useState('');
  const [filiere, setFiliere] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const previewId = formationToEdit
    ? formationToEdit.id
    : generateNextId('FOR', formations.map((f) => f.id));

  useEffect(() => {
    if (formationToEdit) {
      setMarcheId(formationToEdit.marcheId);
      setNature(formationToEdit.nature);
      setModule(formationToEdit.module);
      setFiliere(formationToEdit.filiere);
      setDescription(formationToEdit.description || '');
    } else {
      setMarcheId(defaultMarcheId || (marches.length > 0 ? marches[0].id : ''));
      setNature('Disciplinaire');
      setModule('');
      setFiliere('M1 Eau');
      setDescription('');
    }
    setError(null);
  }, [formationToEdit, defaultMarcheId, isOpen, marches]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!marcheId) {
      setError('Veuillez sélectionner un marché de rattachement.');
      return;
    }
    if (!module.trim()) {
      setError('L\'intitulé du module est obligatoire.');
      return;
    }
    if (!filiere.trim()) {
      setError('La filière est obligatoire.');
      return;
    }

    try {
      if (formationToEdit) {
        updateFormation(formationToEdit.id, {
          marcheId,
          nature,
          module: module.trim(),
          filiere: filiere.trim(),
          description: description.trim() || undefined,
        });
      } else {
        addFormation({
          marcheId,
          nature,
          module: module.trim(),
          filiere: filiere.trim(),
          description: description.trim() || undefined,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formationToEdit ? `Modifier la formation ${formationToEdit.id}` : 'Nouvelle Formation / Module'}
      subtitle="Rattachez cette formation à un marché et définissez ses caractéristiques"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          {/* ID Formation (Auto) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              ID Formation (Auto)
            </label>
            <input
              type="text"
              value={previewId}
              disabled
              className="w-full px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Nature de la formation */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nature de la Formation <span className="text-rose-500">*</span>
            </label>
            <select
              value={nature}
              onChange={(e) => setNature(e.target.value as NatureFormation)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium cursor-pointer"
            >
              <option value="Disciplinaire">Disciplinaire</option>
              <option value="Complémentaire">Complémentaire</option>
            </select>
          </div>
        </div>

        {/* Marché de rattachement */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Marché de rattachement <span className="text-rose-500">*</span>
          </label>
          <select
            value={marcheId}
            onChange={(e) => setMarcheId(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
          >
            <option value="">Sélectionnez un marché existant...</option>
            {marches.map((m) => (
              <option key={m.id} value={m.id}>
                Marché {m.reference} ({m.id}) - {m.objet.slice(0, 50)}...
              </option>
            ))}
          </select>
        </div>

        {/* Module */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Intitulé du Module <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Mathématiques II, Béton armé, SIG..."
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        {/* Filière */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Filière <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: M1 Eau, Génie Civil, Tronc Commun, Management..."
            value={filiere}
            onChange={(e) => setFiliere(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Description du contenu (Optionnel)
          </label>
          <textarea
            rows={2}
            placeholder="Objectifs pédagogiques, travaux pratiques, syllabus..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            {formationToEdit ? 'Enregistrer les modifications' : 'Créer la formation'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
