import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Calendar,
  User,
  ChevronDown,
  Shield,
  FileDown,
  AlertCircle,
  Edit3,
  Mail,
  Phone,
  Building,
  Briefcase,
} from 'lucide-react';
import { TabKey } from './Sidebar';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { RoleUtilisateur, Utilisateur } from '../../types';

interface HeaderProps {
  activeTab: TabKey;
  onOpenMobileMenu: () => void;
  selectedMarcheRef?: string | null;
  onClearMarcheFilter?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  selectedMarcheRef,
  onClearMarcheFilter,
}) => {
  const {
    currentUser,
    users,
    setCurrentUser,
    exportDatabaseToJson,
    activeModule,
    salairesAlerteRetard,
    addToast,
  } = useApp();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fermeture automatique au clic en dehors du menu profil
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // État de la modale Profil Utilisateur
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [formNom, setFormNom] = useState('');
  const [formFonction, setFormFonction] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelephone, setFormTelephone] = useState('');
  const [formEntite, setFormEntite] = useState('');
  const [formRole, setFormRole] = useState<RoleUtilisateur>('Administrateur');

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleOpenProfileModal = () => {
    setFormNom(currentUser.nom || '');
    setFormFonction(currentUser.fonction || 'Administrateur Financier & Marchés');
    setFormEmail(currentUser.email || 'admin.marches@administration.gov.ma');
    setFormTelephone(currentUser.telephone || '+212 6 00 00 00 00');
    setFormEntite(currentUser.entite || 'Direction Administrative & Financière');
    setFormRole(currentUser.role || 'Administrateur');
    setIsUserMenuOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNom.trim()) return;

    const updatedUser: Utilisateur = {
      ...currentUser,
      nom: formNom.trim(),
      fonction: formFonction.trim() || undefined,
      email: formEmail.trim() || currentUser.email,
      telephone: formTelephone.trim() || undefined,
      entite: formEntite.trim() || undefined,
      role: formRole,
    };

    setCurrentUser(updatedUser);
    setIsProfileModalOpen(false);
    addToast({
      type: 'success',
      message: 'Profil mis à jour',
      description: 'Vos informations personnelles ont été enregistrées avec succès.',
    });
  };

  const getPageInfo = (tab: TabKey) => {
    switch (tab) {
      case 'dashboard':
        return {
          title: 'GESTION DES FORMATIONS',
          subtitle: 'Suivi des marchés, formations, intervenants, décomptes et paiements',
        };
      case 'marches':
        return {
          title: 'GESTION DES MARCHÉS',
          subtitle: 'Administration des conventions, montants contractuels et suivi d’exécution',
        };
      case 'formations':
        return {
          title: 'FORMATIONS & MODULES',
          subtitle: 'Suivi des volumes horaires, filières et affectations pédagogiques',
        };
      case 'intervenants':
        return {
          title: 'RÉPERTOIRE DES INTERVENANTS',
          subtitle: 'Dossiers administratifs, expertises, fiches financières et coordonnées',
        };
      case 'decomptes':
        return {
          title: 'DÉCOMPTES REÇUS DE L\'ENTREPRISE',
          subtitle: 'Enregistrement des versements d\'acomptes et suivi du recouvrement',
        };
      case 'paiements':
        return {
          title: 'PAIEMENTS DES INTERVENANTS',
          subtitle: 'Ordonnancement des honoraires, états de règlements et soldes dus',
        };
      case 'rapports':
        return {
          title: 'RAPPORTS & ÉTATS FINANCIERS',
          subtitle: 'Éditions administratives officielles, fiches synthétiques et exports Excel',
        };
      // Module Salaires
      case 'salaires-dashboard':
        return {
          title: 'GESTION DES SALAIRES — TABLEAU DE BORD',
          subtitle: 'Pilotage financier, recouvrement des décomptes et ordonnancement des rémunérations',
        };
      case 'marches-salaires':
        return {
          title: 'GESTION DES MARCHÉS',
          subtitle: 'Marchés d’affectation du personnel, montants contractuels et suivi d’exécution',
        };
      case 'salaries':
        return {
          title: 'EFFECTIF DES SALARIÉS',
          subtitle: 'Répertoire du personnel salarié, dossiers administratifs, RIB et lieux d’affectation',
        };
      case 'pointage-salaires':
        return {
          title: 'POINTAGE & PRÉSENCE DES SALARIÉS',
          subtitle: 'Suivi quotidien de l’assiduité, présences, absences autorisées et congés',
        };
      case 'decomptes-salaires':
        return {
          title: 'GESTION DES DÉCOMPTES',
          subtitle: 'Enregistrement des décomptes et virements reçus des marchés salaires',
        };
      case 'paiements-salaires':
        return {
          title: 'GESTION DES PAIEMENTS',
          subtitle: 'Suivi et saisie des rémunérations et salaires versés au personnel',
        };
      default:
        return {
          title: activeModule === 'salaires' ? 'GESTION DES SALAIRES' : 'GESTION DES MARCHÉS DE FORMATION',
          subtitle: 'Système d\'information administratif et financier',
        };
    }
  };

  const pageInfo = getPageInfo(activeTab);
  const todayFormatted = formatDate(new Date().toISOString().slice(0, 10));

  return (
    <div className="bg-[#0C1E36] text-white select-none">
      {/* En-tête Principal de l'Application (Titre en gras + Widgets Date & Profil) */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#162D4E]">
        {/* Titre et Sous-titre */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#162D4E] transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-sans">
                {pageInfo.title}
              </h1>

              {selectedMarcheRef && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600/40 text-blue-200 font-mono text-xs border border-blue-400/30">
                  Filtre: Marché {selectedMarcheRef}
                  {onClearMarcheFilter && (
                    <button
                      onClick={onClearMarcheFilter}
                      className="hover:text-white ml-1 font-bold text-xs"
                      title="Effacer le filtre"
                    >
                      ×
                    </button>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-0.5">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Widgets droite : Alerte Retard, Date & Profil Utilisateur */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Badge Alerte Retard Salaires dans le bandeau supérieur */}
          {activeModule === 'salaires' && salairesAlerteRetard.isRetard && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold shadow-xs"
              title={`${salairesAlerteRetard.nbSalariesEnRetard} salarié(s) non réglé(s) pour ${salairesAlerteRetard.moisEchu}`}
            >
              <AlertCircle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
              <span className="hidden md:inline">
                ⚠️ Échéance : {salairesAlerteRetard.nbSalariesEnRetard} en retard ({salairesAlerteRetard.moisEchu})
              </span>
              <span className="md:hidden font-mono font-bold text-amber-400">
                {salairesAlerteRetard.nbSalariesEnRetard}
              </span>
            </div>
          )}

          {/* Widget Date (Aujourd'hui) */}
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#11243E] border border-[#1C365C] text-slate-200">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="text-left leading-tight">
              <span className="block text-[10px] text-slate-400 font-medium">Aujourd'hui</span>
              <span className="text-xs font-bold text-white tracking-tight">{todayFormatted}</span>
            </div>
          </div>

          {/* Widget Profil Utilisateur avec Dropdown de bascule rapide */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#11243E] hover:bg-[#162D4E] border border-[#1C365C] transition-colors cursor-pointer"
              title="Consulter et modifier votre profil utilisateur"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight hidden xs:block">
                <span className="block text-xs font-bold text-white tracking-tight truncate max-w-[130px]">
                  {currentUser.nom}
                </span>
                <span className="text-[10px] text-blue-300 font-medium truncate block max-w-[130px]">
                  {currentUser.fonction || currentUser.role}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menu Déroulant Profil & Habilitations */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white text-slate-800 shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                {/* Carte profil & Bouton d'édition */}
                <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60 rounded-t-xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                      {getInitials(currentUser.nom)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.nom}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{currentUser.email}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 mt-0.5">
                        <Shield className="w-2.5 h-2.5" />
                        {currentUser.role}
                      </span>
                    </div>
                  </div>

                  {/* Bouton pour ouvrir la modale Profil */}
                  <button
                    type="button"
                    onClick={handleOpenProfileModal}
                    className="w-full mt-2.5 py-1.5 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Consulter & Modifier mon profil</span>
                  </button>
                </div>

                <div className="py-1">
                  <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Changer d'utilisateur de test
                  </div>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        currentUser.id === u.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{u.nom}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{u.role}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-1 border-t border-slate-100 px-2">
                  <button
                    onClick={() => {
                      exportDatabaseToJson();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sauvegarder la base (JSON)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modale "Profil Utilisateur" */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Profil Utilisateur"
        subtitle="Consultez et mettez à jour vos informations administratives et de contact"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          {/* Avatar & Identité visuelle */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0 border-2 border-white ring-2 ring-blue-100">
              {getInitials(formNom || currentUser.nom)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-sm truncate">
                  {formNom || currentUser.nom}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                  {formRole}
                </span>
              </div>
              <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                {formFonction || currentUser.fonction || 'Administrateur Financier & Marchés'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                {formEmail || currentUser.email}
              </p>
            </div>
          </div>

          {/* Champs du formulaire */}
          <div className="space-y-3.5">
            {/* Nom complet */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom complet <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Responsable DAF"
                  value={formNom}
                  onChange={(e) => setFormNom(e.target.value)}
                  className="w-full px-3 py-2 pl-9 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Intitulé du poste / Fonction */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intitulé du poste / Fonction
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: Administrateur Financier & Marchés"
                  value={formFonction}
                  onChange={(e) => setFormFonction(e.target.value)}
                  className="w-full px-3 py-2 pl-9 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* E-mail professionnel */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail professionnel <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Ex: admin.marches@administration.gov.ma"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 pl-9 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Numéro de téléphone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="Ex: +212 6 00 00 00 00"
                    value={formTelephone}
                    onChange={(e) => setFormTelephone(e.target.value)}
                    className="w-full px-3 py-2 pl-9 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Rôle / Habilitation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rôle & Habilitation
                </label>
                <div className="relative">
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as RoleUtilisateur)}
                    className="w-full px-3 py-2 pl-9 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                  >
                    <option value="Administrateur">Administrateur</option>
                    <option value="Gestionnaire">Gestionnaire</option>
                    <option value="Consultation">Consultation</option>
                  </select>
                  <Shield className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Entité / Direction de rattachement */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Entité / Direction de rattachement
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: Direction Administrative & Financière"
                  value={formEntite}
                  onChange={(e) => setFormEntite(e.target.value)}
                  className="w-full px-3 py-2 pl-9 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <Building className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
            </div>
          </div>

          {/* Pied de modale */}
          <div className="pt-4 border-t border-slate-200/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Enregistrer les modifications</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
