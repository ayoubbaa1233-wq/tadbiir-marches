import React, { useState, useEffect } from 'react';
import { Modal } from '../../common/Modal';
import { Salarie, LieuAffectationSalarie } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { generateNextId } from '../../../utils/formatters';

interface SalarieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  salarieToEdit?: Salarie | null;
}

const LIEUX_OPTIONS: LieuAffectationSalarie[] = [
  'Centre pédagogique',
  'Laboratoire',
  'Administration',
  "Centre d'Excellence",
  'Autre',
];

export const SalarieFormModal: React.FC<SalarieFormModalProps> = ({
  isOpen,
  onClose,
  salarieToEdit,
}) => {
  const { salaries, addSalarie, updateSalarie } = useApp();

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [cin, setCin] = useState('');
  const [rib, setRib] = useState('');
  const [specialite, setSpecialite] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [adresse, setAdresse] = useState('');
  const [lieuAffectation, setLieuAffectation] = useState<LieuAffectationSalarie>('Laboratoire');
  const [lieuAffectationAutre, setLieuAffectationAutre] = useState('');
  const [salaireBase, setSalaireBase] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  const previewId = salarieToEdit
    ? salarieToEdit.id
    : generateNextId('SAL', salaries.map((s) => s.id));

  useEffect(() => {
    if (salarieToEdit) {
      setNom(salarieToEdit.nom);
      setPrenom(salarieToEdit.prenom);
      setCin(salarieToEdit.cin || '');
      setRib(salarieToEdit.rib || '');
      setSpecialite(salarieToEdit.specialite);
      setTelephone(salarieToEdit.telephone);
      setEmail(salarieToEdit.email);
      setAdresse(salarieToEdit.adresse);
      setLieuAffectation(salarieToEdit.lieuAffectation);
      setLieuAffectationAutre(salarieToEdit.lieuAffectationAutre || '');
      setSalaireBase(salarieToEdit.salaireBase || '');
    } else {
      setNom('');
      setPrenom('');
      setCin('');
      setRib('');
      setSpecialite('');
      setTelephone('');
      setEmail('');
      setAdresse('');
      setLieuAffectation('Laboratoire');
      setLieuAffectationAutre('');
      setSalaireBase('');
    }
    setError(null);
  }, [salarieToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nom.trim()) {
      setError('Le nom du salarié est obligatoire.');
      return;
    }
    if (!prenom.trim()) {
      setError('Le prénom du salarié est obligatoire.');
      return;
    }
    if (!cin.trim()) {
      setError('Le numéro de CIN est obligatoire.');
      return;
    }
    if (!specialite.trim()) {
      setError('La spécialité ou le poste occupé est obligatoire.');
      return;
    }
    if (!telephone.trim()) {
      setError('Le numéro de téléphone est obligatoire.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Une adresse email valide est obligatoire.');
      return;
    }
    if (!adresse.trim()) {
      setError('L\'adresse de résidence est obligatoire.');
      return;
    }
    if (lieuAffectation === 'Autre' && !lieuAffectationAutre.trim()) {
      setError('Veuillez préciser le lieu d\'affectation.');
      return;
    }

    try {
      if (salarieToEdit) {
        updateSalarie(salarieToEdit.id, {
          nom: nom.trim(),
          prenom: prenom.trim(),
          cin: cin.trim().toUpperCase(),
          rib: rib.trim(),
          specialite: specialite.trim(),
          telephone: telephone.trim(),
          email: email.trim().toLowerCase(),
          adresse: adresse.trim(),
          lieuAffectation,
          lieuAffectationAutre: lieuAffectation === 'Autre' ? lieuAffectationAutre.trim() : undefined,
          salaireBase: typeof salaireBase === 'number' && salaireBase > 0 ? salaireBase : undefined,
        });
      } else {
        addSalarie({
          nom: nom.trim(),
          prenom: prenom.trim(),
          cin: cin.trim().toUpperCase(),
          rib: rib.trim(),
          specialite: specialite.trim(),
          telephone: telephone.trim(),
          email: email.trim().toLowerCase(),
          adresse: adresse.trim(),
          lieuAffectation,
          lieuAffectationAutre: lieuAffectation === 'Autre' ? lieuAffectationAutre.trim() : undefined,
          salaireBase: typeof salaireBase === 'number' && salaireBase > 0 ? salaireBase : undefined,
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
      title={salarieToEdit ? `Modifier le salarié ${salarieToEdit.prenom} ${salarieToEdit.nom}` : 'Nouveau Salarié'}
      subtitle="Fiche individuelle du personnel salarié"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          {/* Identifiant Auto */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Matricule (Auto)
            </label>
            <input
              type="text"
              value={previewId}
              disabled
              className="w-full px-3 py-2 text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* CIN */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Numéro CIN <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: AB123456"
              value={cin}
              onChange={(e) => setCin(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-medium uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Nom */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nom de famille <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Bennani"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            />
          </div>

          {/* Prénom */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Prénom <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Youssef"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-medium"
            />
          </div>
        </div>

        {/* Spécialité / Fonction */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Spécialité / Poste occupé <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Technicien de Laboratoire, Chargé d'accueil, Coordinateur..."
            value={specialite}
            onChange={(e) => setSpecialite(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        {/* Lieu d'affectation : liste déroulante conditionnelle */}
        <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-xl space-y-3">
          <div>
            <label className="block text-xs font-semibold text-emerald-950 mb-1">
              Lieu d'affectation <span className="text-rose-500">*</span>
            </label>
            <select
              value={lieuAffectation}
              onChange={(e) => setLieuAffectation(e.target.value as LieuAffectationSalarie)}
              required
              className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer font-medium"
            >
              {LIEUX_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Champ conditionnel pour 'Autre' */}
          {lieuAffectation === 'Autre' && (
            <div className="pt-2 border-t border-emerald-200/50">
              <label className="block text-xs font-medium text-emerald-900 mb-1">
                Préciser le lieu d'affectation <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Annexe Bab Al Bahr, Pavillon Numérique, Atelier Technique..."
                value={lieuAffectationAutre}
                onChange={(e) => setLieuAffectationAutre(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-emerald-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Téléphone */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Téléphone <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="Ex: 0661-234567"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email professionnel <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="Ex: prenom.nom@salaries.gov.ma"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Adresse */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Adresse de résidence <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Ex: 14 Rue Oukaimeden, Agdal, Rabat"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* RIB Bancaire (24 chiffres) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              RIB Bancaire (24 chiffres)
            </label>
            <input
              type="text"
              placeholder="Ex: 011780000012345678901245"
              value={rib}
              maxLength={24}
              onChange={(e) => setRib(e.target.value.replace(/\s+/g, ''))}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
            />
          </div>

          {/* Salaire mensuel de référence */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Salaire mensuel indicatif (DH)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              placeholder="Ex: 6500"
              value={salaireBase}
              onChange={(e) =>
                setSalaireBase(e.target.value === '' ? '' : parseFloat(e.target.value))
              }
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            {salarieToEdit ? 'Enregistrer les modifications' : 'Ajouter le salarié'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
