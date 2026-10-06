import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Marche,
  Formation,
  Intervenant,
  Intervention,
  Paiement,
  Decompte,
  Utilisateur,
  NotificationToast,
  InterventionEnrichie,
  MarcheSituationFinanciere,
  RoleUtilisateur,
  AppActiveModule,
  MarcheSalaire,
  Salarie,
  DecompteSalaire,
  PaiementSalarie,
  MarcheSalaireSituationFinanciere,
  SalarieEnrichi,
  PaiementSalarieEnrichi,
  DecompteSalaireEnrichi,
  SalairesAlerteRetard,
  Pointage,
  StatutPointage,
} from '../types';
import {
  SEED_MARCHES,
  SEED_FORMATIONS,
  SEED_INTERVENANTS,
  SEED_INTERVENTIONS,
  SEED_DECOMPTES,
  SEED_PAIEMENTS,
  SEED_UTILISATEURS,
  SEED_MARCHES_SALAIRES,
  SEED_SALARIES,
  SEED_DECOMPTES_SALAIRES,
  SEED_PAIEMENTS_SALAIRES,
  SEED_POINTAGES,
} from '../data/seedData';
import { generateNextId, roundMonetaire } from '../utils/formatters';

interface AppContextType {
  // Module Actif
  activeModule: AppActiveModule;
  setActiveModule: (module: AppActiveModule) => void;

  // Collections Formations
  marches: Marche[];
  formations: Formation[];
  intervenants: Intervenant[];
  interventions: Intervention[];
  decomptes: Decompte[];
  paiements: Paiement[];

  // Collections Salaires
  marchesSalaires: MarcheSalaire[];
  salaries: Salarie[];
  decomptesSalaires: DecompteSalaire[];
  paiementsSalaires: PaiementSalarie[];
  pointages: Pointage[];

  // Utilisateur & Toasts
  currentUser: Utilisateur;
  users: Utilisateur[];
  toasts: NotificationToast[];

  // CRUD Marchés Formations
  addMarche: (marche: Omit<Marche, 'id' | 'createdAt'>) => Marche;
  updateMarche: (id: string, marche: Partial<Omit<Marche, 'id' | 'createdAt'>>) => void;
  deleteMarche: (id: string) => { success: boolean; message?: string };

  // CRUD Formations
  addFormation: (formation: Omit<Formation, 'id' | 'createdAt'>) => Formation;
  updateFormation: (id: string, formation: Partial<Omit<Formation, 'id' | 'createdAt'>>) => void;
  deleteFormation: (id: string) => { success: boolean; message?: string };

  // CRUD Intervenants
  addIntervenant: (intervenant: Omit<Intervenant, 'id' | 'createdAt'>) => Intervenant;
  updateIntervenant: (id: string, intervenant: Partial<Omit<Intervenant, 'id' | 'createdAt'>>) => void;
  deleteIntervenant: (id: string) => { success: boolean; message?: string };

  // CRUD Interventions
  addIntervention: (intervention: Omit<Intervention, 'id' | 'montantTotal' | 'createdAt'>) => Intervention;
  updateIntervention: (id: string, intervention: Partial<Omit<Intervention, 'id' | 'montantTotal' | 'createdAt'>>) => void;
  deleteIntervention: (id: string) => { success: boolean; message?: string };

  // CRUD Décomptes Formations
  addDecompte: (decompte: Omit<Decompte, 'id' | 'createdAt'>) => Decompte;
  updateDecompte: (id: string, decompte: Partial<Omit<Decompte, 'id' | 'createdAt'>>) => void;
  deleteDecompte: (id: string) => { success: boolean; message?: string };

  // CRUD Paiements Formations
  addPaiement: (paiement: Omit<Paiement, 'id' | 'createdAt'>) => Paiement;
  updatePaiement: (id: string, paiement: Partial<Omit<Paiement, 'id' | 'createdAt'>>) => void;
  deletePaiement: (id: string) => { success: boolean; message?: string };

  // CRUD Marchés Salaires
  addMarcheSalaire: (marche: Omit<MarcheSalaire, 'id' | 'createdAt'>) => MarcheSalaire;
  updateMarcheSalaire: (id: string, marche: Partial<Omit<MarcheSalaire, 'id' | 'createdAt'>>) => void;
  deleteMarcheSalaire: (id: string) => { success: boolean; message?: string };

  // CRUD Salariés
  addSalarie: (salarie: Omit<Salarie, 'id' | 'createdAt'>) => Salarie;
  updateSalarie: (id: string, salarie: Partial<Omit<Salarie, 'id' | 'createdAt'>>) => void;
  deleteSalarie: (id: string) => { success: boolean; message?: string };

  // CRUD Décomptes Salaires
  addDecompteSalaire: (decompte: Omit<DecompteSalaire, 'id' | 'createdAt'>) => DecompteSalaire;
  updateDecompteSalaire: (id: string, decompte: Partial<Omit<DecompteSalaire, 'id' | 'createdAt'>>) => void;
  deleteDecompteSalaire: (id: string) => { success: boolean; message?: string };

  // CRUD Paiements Salariés
  addPaiementSalarie: (paiement: Omit<PaiementSalarie, 'id' | 'createdAt'>) => PaiementSalarie;
  updatePaiementSalarie: (id: string, paiement: Partial<Omit<PaiementSalarie, 'id' | 'createdAt'>>) => void;
  deletePaiementSalarie: (id: string) => { success: boolean; message?: string };

  // Pointage & Présence des Salariés
  setPointage: (pointage: Omit<Pointage, 'id' | 'createdAt'> & { id?: string }) => Pointage;
  setMultiplePointages: (pointagesList: Array<Omit<Pointage, 'id' | 'createdAt'> & { id?: string }>) => void;
  deletePointage: (id: string) => void;

  // Getters et calculs Formations
  interventionsEnrichies: InterventionEnrichie[];
  getInterventionEnrichieById: (id: string) => InterventionEnrichie | undefined;
  getMarcheSituation: (marcheId: string) => MarcheSituationFinanciere | undefined;
  getIntervenantSituation: (intervenantId: string) => {
    intervenant: Intervenant;
    masseHoraireTotale: number;
    montantTotalPrevu: number;
    totalPaye: number;
    resteAPayer: number;
    interventions: InterventionEnrichie[];
    formations: Formation[];
    marches: Marche[];
    paiements: Paiement[];
  } | undefined;

  // Getters et calculs Salaires
  marchesSalairesSituations: MarcheSalaireSituationFinanciere[];
  salariesEnrichis: SalarieEnrichi[];
  decomptesSalairesEnrichis: DecompteSalaireEnrichi[];
  paiementsSalairesEnrichis: PaiementSalarieEnrichi[];
  getMarcheSalaireSituation: (id: string) => MarcheSalaireSituationFinanciere | undefined;
  getSalarieSituation: (id: string) => SalarieEnrichi | undefined;
  salairesAlerteRetard: SalairesAlerteRetard;

  // Actions transversales
  setCurrentUser: (user: Utilisateur) => void;
  hasPermission: (requiredRole: RoleUtilisateur) => boolean;
  addToast: (toast: Omit<NotificationToast, 'id'>) => void;
  removeToast: (id: string) => void;
  resetToSeedData: () => void;
  exportDatabaseToJson: () => void;
  importDatabaseFromJson: (jsonString: string) => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACTIVE_MODULE: 'gmf_active_module_v1',
  MARCHES: 'gmf_marches_v1',
  FORMATIONS: 'gmf_formations_v1',
  INTERVENANTS: 'gmf_intervenants_v1',
  INTERVENTIONS: 'gmf_interventions_v1',
  DECOMPTES: 'gmf_decomptes_v1',
  PAIEMENTS: 'gmf_paiements_v1',
  CURRENT_USER: 'gmf_current_user_v1',
  MARCHES_SALAIRES: 'gmf_marches_salaires_v1',
  SALARIES: 'gmf_salaries_v1',
  DECOMPTES_SALAIRES: 'gmf_decomptes_salaires_v1',
  PAIEMENTS_SALAIRES: 'gmf_paiements_salaires_v1',
  POINTAGES: 'gmf_pointages_v1',
};

function loadStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<AppActiveModule>(() =>
    loadStorage(STORAGE_KEYS.ACTIVE_MODULE, 'formations')
  );
  const [marches, setMarches] = useState<Marche[]>(() => loadStorage(STORAGE_KEYS.MARCHES, SEED_MARCHES));
  const [formations, setFormations] = useState<Formation[]>(() => loadStorage(STORAGE_KEYS.FORMATIONS, SEED_FORMATIONS));
  const [intervenants, setIntervenants] = useState<Intervenant[]>(() => loadStorage(STORAGE_KEYS.INTERVENANTS, SEED_INTERVENANTS));
  const [interventions, setInterventions] = useState<Intervention[]>(() => {
    const stored = loadStorage<Intervention[]>(STORAGE_KEYS.INTERVENTIONS, SEED_INTERVENTIONS);
    const seedMap = new Map(SEED_INTERVENTIONS.map((i) => [i.id, i.seances]));
    return stored.map((itv) => {
      if (!itv.seances || itv.seances.length === 0) {
        const seedSeances = seedMap.get(itv.id);
        if (seedSeances && seedSeances.length > 0) {
          const sumHours = seedSeances.reduce((acc, s) => acc + (Number(s.heures) || 0), 0);
          return {
            ...itv,
            seances: seedSeances,
            masseHoraire: sumHours > 0 ? sumHours : itv.masseHoraire,
            montantTotal: (sumHours > 0 ? sumHours : itv.masseHoraire) * itv.tauxHoraire,
          };
        }
      }
      return itv;
    });
  });
  const [decomptes, setDecomptes] = useState<Decompte[]>(() => loadStorage(STORAGE_KEYS.DECOMPTES, SEED_DECOMPTES));
  const [paiements, setPaiements] = useState<Paiement[]>(() => loadStorage(STORAGE_KEYS.PAIEMENTS, SEED_PAIEMENTS));

  // États Salaires
  const [marchesSalaires, setMarchesSalaires] = useState<MarcheSalaire[]>(() =>
    loadStorage(STORAGE_KEYS.MARCHES_SALAIRES, SEED_MARCHES_SALAIRES)
  );
  const [salaries, setSalaries] = useState<Salarie[]>(() =>
    loadStorage(STORAGE_KEYS.SALARIES, SEED_SALARIES)
  );
  const [decomptesSalaires, setDecomptesSalaires] = useState<DecompteSalaire[]>(() =>
    loadStorage(STORAGE_KEYS.DECOMPTES_SALAIRES, SEED_DECOMPTES_SALAIRES)
  );
  const [paiementsSalaires, setPaiementsSalaires] = useState<PaiementSalarie[]>(() =>
    loadStorage(STORAGE_KEYS.PAIEMENTS_SALAIRES, SEED_PAIEMENTS_SALAIRES)
  );
  const [pointages, setPointages] = useState<Pointage[]>(() =>
    loadStorage(STORAGE_KEYS.POINTAGES, SEED_POINTAGES)
  );
  const [users] = useState<Utilisateur[]>(SEED_UTILISATEURS);
  const [currentUser, setCurrentUser] = useState<Utilisateur>(() => loadStorage(STORAGE_KEYS.CURRENT_USER, SEED_UTILISATEURS[0]));
  const [toasts, setToasts] = useState<NotificationToast[]>([]);

  // Synchronisation avec localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MARCHES, JSON.stringify(marches));
  }, [marches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FORMATIONS, JSON.stringify(formations));
  }, [formations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INTERVENANTS, JSON.stringify(intervenants));
  }, [intervenants]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INTERVENTIONS, JSON.stringify(interventions));
  }, [interventions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DECOMPTES, JSON.stringify(decomptes));
  }, [decomptes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAIEMENTS, JSON.stringify(paiements));
  }, [paiements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_MODULE, JSON.stringify(activeModule));
  }, [activeModule]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MARCHES_SALAIRES, JSON.stringify(marchesSalaires));
  }, [marchesSalaires]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALARIES, JSON.stringify(salaries));
  }, [salaries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DECOMPTES_SALAIRES, JSON.stringify(decomptesSalaires));
  }, [decomptesSalaires]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAIEMENTS_SALAIRES, JSON.stringify(paiementsSalaires));
  }, [paiementsSalaires]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POINTAGES, JSON.stringify(pointages));
  }, [pointages]);

  // Toasts
  const addToast = (toast: Omit<NotificationToast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Droits d'accès
  const hasPermission = (requiredRole: RoleUtilisateur): boolean => {
    if (currentUser.role === 'Administrateur') return true;
    if (currentUser.role === 'Gestionnaire') {
      return requiredRole !== 'Administrateur';
    }
    // Consultation
    return requiredRole === 'Consultation';
  };

  // Calcul des interventions enrichies avec statuts réels
  const interventionsEnrichies = useMemo<InterventionEnrichie[]>(() => {
    const formationsMap = new Map(formations.map((f) => [f.id, f]));
    const marchesMap = new Map(marches.map((m) => [m.id, m]));
    const intervenantsMap = new Map(intervenants.map((i) => [i.id, i]));

    return interventions.map((itv) => {
      const formation = formationsMap.get(itv.formationId);
      const marche = formation ? marchesMap.get(formation.marcheId) : undefined;
      const intervenant = intervenantsMap.get(itv.intervenantId);
      
      const itvPaiements = paiements.filter((p) => p.interventionId === itv.id);
      const totalPaye = roundMonetaire(itvPaiements.reduce((sum, p) => sum + p.montant, 0));
      const resteAPayer = roundMonetaire(Math.max(0, itv.montantTotal - totalPaye));

      let etat: 'Non payé' | 'En cours' | 'Payé' = 'Non payé';
      if (totalPaye >= itv.montantTotal && itv.montantTotal > 0) {
        etat = 'Payé';
      } else if (totalPaye > 0) {
        etat = 'En cours';
      }

      return {
        ...itv,
        formation,
        marche,
        intervenant,
        totalPaye,
        resteAPayer,
        etat,
        paiements: itvPaiements,
      };
    });
  }, [interventions, formations, marches, intervenants, paiements]);

  const getInterventionEnrichieById = (id: string) => {
    return interventionsEnrichies.find((itv) => itv.id === id);
  };

  // Situation financière d'un marché
  const getMarcheSituation = (marcheId: string): MarcheSituationFinanciere | undefined => {
    const marche = marches.find((m) => m.id === marcheId);
    if (!marche) return undefined;

    const marcheDecomptes = decomptes.filter((d) => d.marcheId === marcheId);
    const totalDecomptesRecus = roundMonetaire(marcheDecomptes.reduce((acc, d) => acc + d.montantRecu, 0));
    const montantRestantARecevoir = roundMonetaire(Math.max(0, marche.montant - totalDecomptesRecus));
    const tauxEncaissement = marche.montant > 0 ? (totalDecomptesRecus / marche.montant) * 100 : 0;

    const marcheFormations = formations.filter((f) => f.marcheId === marcheId);
    const marcheFormationIds = new Set(marcheFormations.map((f) => f.id));

    const marcheInterventions = interventionsEnrichies.filter((itv) =>
      marcheFormationIds.has(itv.formationId)
    );

    const montantTotalPrevuIntervenants = roundMonetaire(
      marcheInterventions.reduce((acc, itv) => acc + itv.montantTotal, 0)
    );
    const totalPayeIntervenants = roundMonetaire(
      marcheInterventions.reduce((acc, itv) => acc + itv.totalPaye, 0)
    );
    const resteAPayerIntervenants = roundMonetaire(
      Math.max(0, montantTotalPrevuIntervenants - totalPayeIntervenants)
    );
    const tauxPaiementIntervenants =
      montantTotalPrevuIntervenants > 0
        ? (totalPayeIntervenants / montantTotalPrevuIntervenants) * 100
        : 0;

    const soldePrevisionnel = roundMonetaire(marche.montant - montantTotalPrevuIntervenants);
    const soldeTresorerie = roundMonetaire(totalDecomptesRecus - totalPayeIntervenants);

    const uniqueIntervenants = new Set(marcheInterventions.map((itv) => itv.intervenantId));
    const masseHoraireTotale = marcheInterventions.reduce((acc, itv) => acc + itv.masseHoraire, 0);

    return {
      marche,
      totalDecomptesRecus,
      montantRestantARecevoir,
      tauxEncaissement,
      montantTotalPrevuIntervenants,
      totalPayeIntervenants,
      resteAPayerIntervenants,
      tauxPaiementIntervenants,
      soldePrevisionnel,
      soldeTresorerie,
      nombreFormations: marcheFormations.length,
      nombreIntervenants: uniqueIntervenants.size,
      masseHoraireTotale,
    };
  };

  // Situation globale d'un intervenant
  const getIntervenantSituation = (intervenantId: string) => {
    const intervenant = intervenants.find((i) => i.id === intervenantId);
    if (!intervenant) return undefined;

    const intInterventions = interventionsEnrichies.filter((itv) => itv.intervenantId === intervenantId);
    const masseHoraireTotale = intInterventions.reduce((acc, itv) => acc + itv.masseHoraire, 0);
    const montantTotalPrevu = intInterventions.reduce((acc, itv) => acc + itv.montantTotal, 0);
    const totalPaye = intInterventions.reduce((acc, itv) => acc + itv.totalPaye, 0);
    const resteAPayer = Math.max(0, montantTotalPrevu - totalPaye);

    const formationIds = new Set(intInterventions.map((itv) => itv.formationId));
    const userFormations = formations.filter((f) => formationIds.has(f.id));

    const marcheIds = new Set(userFormations.map((f) => f.marcheId));
    const userMarches = marches.filter((m) => marcheIds.has(m.id));

    const userPaiements = intInterventions.flatMap((itv) => itv.paiements);

    return {
      intervenant,
      masseHoraireTotale,
      montantTotalPrevu,
      totalPaye,
      resteAPayer,
      interventions: intInterventions,
      formations: userFormations,
      marches: userMarches,
      paiements: userPaiements,
    };
  };

  // ==================== MARCHÉS ====================
  const addMarche = (marcheData: Omit<Marche, 'id' | 'createdAt'>): Marche => {
    const existingIds = marches.map((m) => m.id);
    const newId = generateNextId('M', existingIds);
    const newMarche: Marche = {
      ...marcheData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setMarches((prev) => [newMarche, ...prev]);
    addToast({
      type: 'success',
      message: 'Marché créé avec succès',
      description: `Marché ${newMarche.reference} (${newMarche.id}) enregistré.`,
    });
    return newMarche;
  };

  const updateMarche = (id: string, marcheData: Partial<Omit<Marche, 'id' | 'createdAt'>>) => {
    setMarches((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...marcheData } : m))
    );
    addToast({
      type: 'success',
      message: 'Marché mis à jour',
      description: `Les modifications du marché ${id} ont été enregistrées.`,
    });
  };

  const deleteMarche = (id: string): { success: boolean; message?: string } => {
    // Vérification de sécurité relationnelle
    const linkedFormations = formations.filter((f) => f.marcheId === id);
    const linkedDecomptes = decomptes.filter((d) => d.marcheId === id);

    if (linkedFormations.length > 0 || linkedDecomptes.length > 0) {
      const msg = `Impossible de supprimer ce marché : il contient encore ${linkedFormations.length} formation(s) et ${linkedDecomptes.length} décompte(s) associé(s). Veuillez d'abord supprimer ou réassigner ces éléments.`;
      addToast({
        type: 'error',
        message: 'Suppression impossible',
        description: msg,
      });
      return { success: false, message: msg };
    }

    setMarches((prev) => prev.filter((m) => m.id !== id));
    addToast({
      type: 'success',
      message: 'Marché supprimé',
      description: `Le marché ${id} a été retiré de la base.`,
    });
    return { success: true };
  };

  // ==================== FORMATIONS ====================
  const addFormation = (formationData: Omit<Formation, 'id' | 'createdAt'>): Formation => {
    if (!formationData.marcheId) {
      throw new Error('Un marché doit être obligatoirement sélectionné.');
    }
    const existingIds = formations.map((f) => f.id);
    const newId = generateNextId('FOR', existingIds);
    const newFormation: Formation = {
      ...formationData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setFormations((prev) => [newFormation, ...prev]);
    addToast({
      type: 'success',
      message: 'Formation créée avec succès',
      description: `Formation ${newFormation.module} (${newFormation.id}) ajoutée.`,
    });
    return newFormation;
  };

  const updateFormation = (id: string, formationData: Partial<Omit<Formation, 'id' | 'createdAt'>>) => {
    setFormations((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...formationData } : f))
    );
    addToast({
      type: 'success',
      message: 'Formation modifiée',
      description: `La formation ${id} a été mise à jour.`,
    });
  };

  const deleteFormation = (id: string): { success: boolean; message?: string } => {
    const linkedInterventions = interventions.filter((itv) => itv.formationId === id);
    if (linkedInterventions.length > 0) {
      const msg = `Impossible de supprimer cette formation : ${linkedInterventions.length} intervention(s) d'intervenant y sont rattachées.`;
      addToast({
        type: 'error',
        message: 'Suppression impossible',
        description: msg,
      });
      return { success: false, message: msg };
    }

    setFormations((prev) => prev.filter((f) => f.id !== id));
    addToast({
      type: 'success',
      message: 'Formation supprimée',
      description: `La formation ${id} a été supprimée.`,
    });
    return { success: true };
  };

  // ==================== INTERVENANTS ====================
  const addIntervenant = (intervenantData: Omit<Intervenant, 'id' | 'createdAt'>): Intervenant => {
    const existingIds = intervenants.map((i) => i.id);
    const newId = generateNextId('INT', existingIds);
    const newIntervenant: Intervenant = {
      ...intervenantData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setIntervenants((prev) => [newIntervenant, ...prev]);
    addToast({
      type: 'success',
      message: 'Intervenant enregistré',
      description: `${newIntervenant.prenom} ${newIntervenant.nom} (${newIntervenant.id}) ajouté.`,
    });
    return newIntervenant;
  };

  const updateIntervenant = (id: string, intervenantData: Partial<Omit<Intervenant, 'id' | 'createdAt'>>) => {
    setIntervenants((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...intervenantData } : i))
    );
    addToast({
      type: 'success',
      message: 'Intervenant mis à jour',
      description: `La fiche de l'intervenant ${id} a été modifiée.`,
    });
  };

  const deleteIntervenant = (id: string): { success: boolean; message?: string } => {
    const linkedInterventions = interventions.filter((itv) => itv.intervenantId === id);
    if (linkedInterventions.length > 0) {
      const msg = `Impossible de supprimer cet intervenant : il est mobilisé sur ${linkedInterventions.length} intervention(s).`;
      addToast({
        type: 'error',
        message: 'Suppression impossible',
        description: msg,
      });
      return { success: false, message: msg };
    }

    setIntervenants((prev) => prev.filter((i) => i.id !== id));
    addToast({
      type: 'success',
      message: 'Intervenant supprimé',
      description: `L'intervenant ${id} a été retiré de la base.`,
    });
    return { success: true };
  };

  // ==================== INTERVENTIONS ====================
  const addIntervention = (itvData: Omit<Intervention, 'id' | 'montantTotal' | 'createdAt'>): Intervention => {
    if (!itvData.formationId || !itvData.intervenantId) {
      throw new Error('La formation et l\'intervenant sont obligatoires.');
    }

    const seances = itvData.seances || [];
    const masseHoraire = seances.length > 0
      ? seances.reduce((acc, s) => acc + (Number(s.heures) || 0), 0)
      : itvData.masseHoraire;

    if (masseHoraire <= 0) {
      throw new Error('La masse horaire doit être strictement supérieure à zéro.');
    }
    if (itvData.tauxHoraire < 0) {
      throw new Error('Le taux horaire doit être supérieur ou égal à zéro.');
    }

    const montantTotal = masseHoraire * itvData.tauxHoraire;
    const existingIds = interventions.map((itv) => itv.id);
    const newId = generateNextId('ITV', existingIds);

    const newIntervention: Intervention = {
      ...itvData,
      seances,
      masseHoraire,
      id: newId,
      montantTotal,
      createdAt: new Date().toISOString(),
    };

    setInterventions((prev) => [newIntervention, ...prev]);
    addToast({
      type: 'success',
      message: 'Intervention créée',
      description: `Intervention ${newIntervention.id} enregistrée pour un montant calculé de ${montantTotal} DH.`,
    });
    return newIntervention;
  };

  const updateIntervention = (
    id: string,
    itvData: Partial<Omit<Intervention, 'id' | 'montantTotal' | 'createdAt'>>
  ) => {
    setInterventions((prev) =>
      prev.map((itv) => {
        if (itv.id !== id) return itv;
        const newSeances = itvData.seances !== undefined ? itvData.seances : itv.seances;
        let newMasse = itv.masseHoraire;
        if (newSeances && newSeances.length > 0) {
          newMasse = newSeances.reduce((acc, s) => acc + (Number(s.heures) || 0), 0);
        } else if (itvData.masseHoraire !== undefined) {
          newMasse = itvData.masseHoraire;
        }

        const newTaux = itvData.tauxHoraire !== undefined ? itvData.tauxHoraire : itv.tauxHoraire;
        const montantTotal = newMasse * newTaux;
        return {
          ...itv,
          ...itvData,
          seances: newSeances,
          masseHoraire: newMasse,
          tauxHoraire: newTaux,
          montantTotal,
        };
      })
    );
    addToast({
      type: 'success',
      message: 'Intervention mise à jour',
      description: `L'intervention ${id} a été recalculée et mise à jour.`,
    });
  };

  const deleteIntervention = (id: string): { success: boolean; message?: string } => {
    const linkedPaiements = paiements.filter((p) => p.interventionId === id);
    if (linkedPaiements.length > 0) {
      const msg = `Impossible de supprimer cette intervention : ${linkedPaiements.length} paiement(s) ont déjà été enregistrés pour celle-ci.`;
      addToast({
        type: 'error',
        message: 'Suppression impossible',
        description: msg,
      });
      return { success: false, message: msg };
    }

    setInterventions((prev) => prev.filter((itv) => itv.id !== id));
    addToast({
      type: 'success',
      message: 'Intervention supprimée',
      description: `L'intervention ${id} a été supprimée.`,
    });
    return { success: true };
  };

  // ==================== DÉCOMPTES ====================
  const addDecompte = (decompteData: Omit<Decompte, 'id' | 'createdAt'>): Decompte => {
    if (!decompteData.marcheId) {
      throw new Error('Le marché associé est obligatoire.');
    }
    if (decompteData.montantRecu <= 0) {
      throw new Error('Le montant du décompte doit être strictement supérieur à zéro.');
    }

    const existingIds = decomptes.map((d) => d.id);
    const newId = generateNextId('DEC', existingIds);

    const newDecompte: Decompte = {
      ...decompteData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setDecomptes((prev) => [newDecompte, ...prev]);
    addToast({
      type: 'success',
      message: 'Décompte enregistré',
      description: `Décompte n°${newDecompte.numero} de ${newDecompte.montantRecu} DH rattaché au marché.`,
    });
    return newDecompte;
  };

  const updateDecompte = (id: string, decompteData: Partial<Omit<Decompte, 'id' | 'createdAt'>>) => {
    setDecomptes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...decompteData } : d))
    );
    addToast({
      type: 'success',
      message: 'Décompte mis à jour',
      description: `Le décompte ${id} a été actualisé.`,
    });
  };

  const deleteDecompte = (id: string): { success: boolean; message?: string } => {
    setDecomptes((prev) => prev.filter((d) => d.id !== id));
    addToast({
      type: 'success',
      message: 'Décompte supprimé',
      description: `Le décompte ${id} a été retiré.`,
    });
    return { success: true };
  };

  // ==================== PAIEMENTS ====================
  const addPaiement = (paiementData: Omit<Paiement, 'id' | 'createdAt'>): Paiement => {
    if (!paiementData.interventionId) {
      throw new Error('L\'intervention doit être spécifiée.');
    }
    if (paiementData.montant <= 0) {
      throw new Error('Le montant du paiement doit être supérieur à zéro.');
    }

    const itv = interventionsEnrichies.find((i) => i.id === paiementData.interventionId);
    if (itv && paiementData.montant > itv.resteAPayer) {
      addToast({
        type: 'warning',
        message: 'Attention sur le montant',
        description: `Le paiement (${paiementData.montant} DH) dépasse le reste dû (${itv.resteAPayer} DH).`,
      });
    }

    const existingIds = paiements.map((p) => p.id);
    const newId = generateNextId('PAY', existingIds);

    const newPaiement: Paiement = {
      ...paiementData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setPaiements((prev) => [newPaiement, ...prev]);
    addToast({
      type: 'success',
      message: 'Paiement intervenant validé',
      description: `Règlement de ${newPaiement.montant} DH enregistré (${newPaiement.mode}).`,
    });
    return newPaiement;
  };

  const updatePaiement = (id: string, paiementData: Partial<Omit<Paiement, 'id' | 'createdAt'>>) => {
    setPaiements((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...paiementData } : p))
    );
    addToast({
      type: 'success',
      message: 'Paiement modifié',
      description: `Le paiement ${id} a été mis à jour.`,
    });
  };

  const deletePaiement = (id: string): { success: boolean; message?: string } => {
    setPaiements((prev) => prev.filter((p) => p.id !== id));
    addToast({
      type: 'success',
      message: 'Paiement supprimé',
      description: `Le règlement ${id} a été annulé.`,
    });
    return { success: true };
  };

  // ==================== CALCULS & SÉLECTEURS SALAIRES ====================
  const marchesSalairesSituations = useMemo<MarcheSalaireSituationFinanciere[]>(() => {
    return marchesSalaires.map((marche) => {
      const marchesDecomptes = decomptesSalaires.filter((d) => d.marcheSalaireId === marche.id);
      const totalDecomptesRecus = roundMonetaire(marchesDecomptes.reduce((acc, d) => acc + d.montantRecu, 0));
      const resteARecevoir = roundMonetaire(Math.max(0, marche.montantContractuel - totalDecomptesRecus));
      const tauxEncaissement =
        marche.montantContractuel > 0 ? (totalDecomptesRecus / marche.montantContractuel) * 100 : 0;

      const marchesPaiements = paiementsSalaires.filter((p) => p.marcheSalaireId === marche.id);
      const totalSalairesVerses = roundMonetaire(marchesPaiements.reduce((acc, p) => acc + p.montant, 0));
      const soldeTresorerie = roundMonetaire(totalDecomptesRecus - totalSalairesVerses);

      const distinctSalaries = new Set(marchesPaiements.map((p) => p.salarieId));

      return {
        marche,
        totalDecomptesRecus,
        resteARecevoir,
        tauxEncaissement,
        totalSalairesVerses,
        soldeTresorerie,
        nombreSalariesAffectes: distinctSalaries.size,
        nombreDecomptes: marchesDecomptes.length,
        nombrePaiements: marchesPaiements.length,
      };
    });
  }, [marchesSalaires, decomptesSalaires, paiementsSalaires]);

  const salariesEnrichis = useMemo<SalarieEnrichi[]>(() => {
    return salaries.map((s) => {
      const sPaiements = paiementsSalaires
        .filter((p) => p.salarieId === s.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const totalSalairesRecus = roundMonetaire(sPaiements.reduce((acc, p) => acc + p.montant, 0));
      const dernierPaiement = sPaiements[0];

      return {
        ...s,
        totalSalairesRecus,
        nombrePaiements: sPaiements.length,
        dernierPaiementDate: dernierPaiement?.date,
        dernierePeriodePayee: dernierPaiement?.periode,
        paiements: sPaiements,
      };
    });
  }, [salaries, paiementsSalaires]);

  const decomptesSalairesEnrichis = useMemo<DecompteSalaireEnrichi[]>(() => {
    const marchesMap = new Map(marchesSalaires.map((m) => [m.id, m]));
    return decomptesSalaires.map((d) => ({
      ...d,
      marcheSalaire: marchesMap.get(d.marcheSalaireId),
    }));
  }, [decomptesSalaires, marchesSalaires]);

  const paiementsSalairesEnrichis = useMemo<PaiementSalarieEnrichi[]>(() => {
    const salariesMap = new Map(salaries.map((s) => [s.id, s]));
    const marchesMap = new Map(marchesSalaires.map((m) => [m.id, m]));
    return paiementsSalaires.map((p) => ({
      ...p,
      salarie: salariesMap.get(p.salarieId),
      marcheSalaire: marchesMap.get(p.marcheSalaireId),
    }));
  }, [paiementsSalaires, salaries, marchesSalaires]);

  const getMarcheSalaireSituation = (id: string) => {
    return marchesSalairesSituations.find((s) => s.marche.id === id);
  };

  const getSalarieSituation = (id: string) => {
    return salariesEnrichis.find((s) => s.id === id);
  };

  // ==================== ALERTE RETARD RÈGLEMENT SALAIRES ====================
  // Déclenchée dès le 2 du mois si des salariés actifs n'ont pas encore été payés pour le mois échu
  const salairesAlerteRetard = useMemo<SalairesAlerteRetard>(() => {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();

    const MOIS_NOMS = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];

    // Vérifier si la date du jour a atteint ou dépassé le 2 du mois en cours
    if (currentDay < 2) {
      return {
        isRetard: false,
        moisEchu: '',
        salariesEnRetard: [],
        nbSalariesEnRetard: 0,
      };
    }

    const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const moisEchu = `${MOIS_NOMS[prevMonthIndex]} ${prevYear}`;

    const normalizeStr = (str: string) =>
      str
        ? str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .toLowerCase()
        : '';

    const moisEchuNorm = normalizeStr(moisEchu);

    // Récupérer les IDs des salariés ayant reçu un paiement pour ce mois échu
    const paidSalarieIds = new Set(
      paiementsSalaires
        .filter((p) => normalizeStr(p.periode) === moisEchuNorm)
        .map((p) => p.salarieId)
    );

    // Salariés qui n'ont pas été réglés pour ce mois échu
    const salariesEnRetard = salaries.filter((s) => !paidSalarieIds.has(s.id));

    return {
      isRetard: salariesEnRetard.length > 0,
      moisEchu,
      salariesEnRetard,
      nbSalariesEnRetard: salariesEnRetard.length,
    };
  }, [salaries, paiementsSalaires]);

  // ==================== CRUD MARCHÉS SALAIRES ====================
  const addMarcheSalaire = (marcheData: Omit<MarcheSalaire, 'id' | 'createdAt'>): MarcheSalaire => {
    if (!marcheData.reference?.trim()) {
      throw new Error('La référence du marché est obligatoire.');
    }
    if (!marcheData.montantContractuel || marcheData.montantContractuel <= 0) {
      throw new Error('Le montant contractuel doit être supérieur à zéro.');
    }

    const existingIds = marchesSalaires.map((m) => m.id);
    const newId = generateNextId('MS', existingIds);

    const newMarche: MarcheSalaire = {
      ...marcheData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setMarchesSalaires((prev) => [newMarche, ...prev]);
    addToast({
      type: 'success',
      message: 'Marché Salaires créé',
      description: `Marché ${newMarche.reference} (${newMarche.id}) enregistré.`,
    });
    return newMarche;
  };

  const updateMarcheSalaire = (
    id: string,
    marcheData: Partial<Omit<MarcheSalaire, 'id' | 'createdAt'>>
  ) => {
    setMarchesSalaires((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...marcheData } : m))
    );
    addToast({
      type: 'success',
      message: 'Marché Salaires modifié',
      description: `Le marché ${id} a été mis à jour.`,
    });
  };

  const deleteMarcheSalaire = (id: string): { success: boolean; message?: string } => {
    const linkedDecomptes = decomptesSalaires.filter((d) => d.marcheSalaireId === id);
    const linkedPaiements = paiementsSalaires.filter((p) => p.marcheSalaireId === id);

    if (linkedDecomptes.length > 0 || linkedPaiements.length > 0) {
      const msg = `Impossible de supprimer ce marché : ${linkedDecomptes.length} décompte(s) et ${linkedPaiements.length} paiement(s) y sont rattachés.`;
      addToast({
        type: 'error',
        message: 'Suppression impossible',
        description: msg,
      });
      return { success: false, message: msg };
    }

    setMarchesSalaires((prev) => prev.filter((m) => m.id !== id));
    addToast({
      type: 'success',
      message: 'Marché Salaires supprimé',
      description: `Le marché ${id} a été supprimé.`,
    });
    return { success: true };
  };

  // ==================== CRUD SALARIÉS ====================
  const addSalarie = (salarieData: Omit<Salarie, 'id' | 'createdAt'>): Salarie => {
    if (!salarieData.nom?.trim() || !salarieData.prenom?.trim()) {
      throw new Error('Le nom et prénom du salarié sont obligatoires.');
    }
    const existingIds = salaries.map((s) => s.id);
    const newId = generateNextId('SAL', existingIds);

    const newSalarie: Salarie = {
      ...salarieData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setSalaries((prev) => [newSalarie, ...prev]);
    addToast({
      type: 'success',
      message: 'Salarié enregistré',
      description: `${newSalarie.prenom} ${newSalarie.nom} (${newSalarie.id}) ajouté à l'effectif.`,
    });
    return newSalarie;
  };

  const updateSalarie = (
    id: string,
    salarieData: Partial<Omit<Salarie, 'id' | 'createdAt'>>
  ) => {
    setSalaries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...salarieData } : s))
    );
    addToast({
      type: 'success',
      message: 'Fiche salarié modifiée',
      description: `Les informations de ${id} ont été mises à jour.`,
    });
  };

  const deleteSalarie = (id: string): { success: boolean; message?: string } => {
    const linkedPaiements = paiementsSalaires.filter((p) => p.salarieId === id);
    if (linkedPaiements.length > 0) {
      const msg = `Impossible de supprimer ce salarié : ${linkedPaiements.length} paiement(s) de salaire ont déjà été enregistrés pour lui.`;
      addToast({
        type: 'error',
        message: 'Suppression impossible',
        description: msg,
      });
      return { success: false, message: msg };
    }

    setSalaries((prev) => prev.filter((s) => s.id !== id));
    addToast({
      type: 'success',
      message: 'Salarié supprimé',
      description: `Le salarié ${id} a été retiré de l'annuaire.`,
    });
    return { success: true };
  };

  // ==================== CRUD DÉCOMPTES SALAIRES ====================
  const addDecompteSalaire = (
    decompteData: Omit<DecompteSalaire, 'id' | 'createdAt'>
  ): DecompteSalaire => {
    if (!decompteData.marcheSalaireId) {
      throw new Error('Le marché de salaires associé est obligatoire.');
    }
    if (decompteData.montantRecu <= 0) {
      throw new Error('Le montant du décompte doit être strictement supérieur à zéro.');
    }

    const existingIds = decomptesSalaires.map((d) => d.id);
    const newId = generateNextId('DEC-SAL', existingIds);

    const newDecompte: DecompteSalaire = {
      ...decompteData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setDecomptesSalaires((prev) => [newDecompte, ...prev]);
    addToast({
      type: 'success',
      message: 'Décompte Salaires enregistré',
      description: `Décompte N°${newDecompte.numero} (${newDecompte.montantRecu} DH) enregistré.`,
    });
    return newDecompte;
  };

  const updateDecompteSalaire = (
    id: string,
    decompteData: Partial<Omit<DecompteSalaire, 'id' | 'createdAt'>>
  ) => {
    setDecomptesSalaires((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...decompteData } : d))
    );
    addToast({
      type: 'success',
      message: 'Décompte Salaires modifié',
      description: `Le décompte ${id} a été mis à jour.`,
    });
  };

  const deleteDecompteSalaire = (id: string): { success: boolean; message?: string } => {
    setDecomptesSalaires((prev) => prev.filter((d) => d.id !== id));
    addToast({
      type: 'success',
      message: 'Décompte Salaires supprimé',
      description: `Le décompte ${id} a été annulé.`,
    });
    return { success: true };
  };

  // ==================== CRUD PAIEMENTS SALAIRES ====================
  const addPaiementSalarie = (
    paiementData: Omit<PaiementSalarie, 'id' | 'createdAt'>
  ): PaiementSalarie => {
    if (!paiementData.salarieId) {
      throw new Error('Le salarié bénéficiaire est obligatoire.');
    }
    if (!paiementData.marcheSalaireId) {
      throw new Error('Le marché rattaché est obligatoire.');
    }
    if (paiementData.montant <= 0) {
      throw new Error('Le montant versé doit être supérieur à zéro.');
    }

    const existingIds = paiementsSalaires.map((p) => p.id);
    const newId = generateNextId('PAY-SAL', existingIds);

    const newPaiement: PaiementSalarie = {
      ...paiementData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    setPaiementsSalaires((prev) => [newPaiement, ...prev]);
    addToast({
      type: 'success',
      message: 'Paiement salaire validé',
      description: `Règlement de ${newPaiement.montant} DH pour ${newPaiement.periode} (${newPaiement.mode}).`,
    });
    return newPaiement;
  };

  const updatePaiementSalarie = (
    id: string,
    paiementData: Partial<Omit<PaiementSalarie, 'id' | 'createdAt'>>
  ) => {
    setPaiementsSalaires((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...paiementData } : p))
    );
    addToast({
      type: 'success',
      message: 'Paiement salaire modifié',
      description: `Le paiement ${id} a été mis à jour.`,
    });
  };

  const deletePaiementSalarie = (id: string): { success: boolean; message?: string } => {
    setPaiementsSalaires((prev) => prev.filter((p) => p.id !== id));
    addToast({
      type: 'success',
      message: 'Paiement salaire supprimé',
      description: `Le paiement ${id} a été annulé.`,
    });
    return { success: true };
  };

  // ==================== POINTAGE & PRÉSENCE DES SALARIÉS ====================
  const setPointage = (data: Omit<Pointage, 'id' | 'createdAt'> & { id?: string }): Pointage => {
    const existingIndex = pointages.findIndex(
      (p) => p.salarie_id === data.salarie_id && p.date === data.date
    );

    if (existingIndex >= 0) {
      const updated: Pointage = {
        ...pointages[existingIndex],
        ...data,
        id: pointages[existingIndex].id,
      };
      setPointages((prev) => {
        const copy = [...prev];
        copy[existingIndex] = updated;
        return copy;
      });
      return updated;
    } else {
      const newId =
        data.id || `PTG-${data.date.replace(/-/g, '')}-${Date.now().toString(36).substr(-4)}`;
      const newPointage: Pointage = {
        ...data,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      setPointages((prev) => [newPointage, ...prev]);
      return newPointage;
    }
  };

  const setMultiplePointages = (
    list: Array<Omit<Pointage, 'id' | 'createdAt'> & { id?: string }>
  ) => {
    setPointages((prev) => {
      const map = new Map<string, Pointage>();
      prev.forEach((p) => map.set(`${p.salarie_id}_${p.date}`, p));

      list.forEach((item) => {
        const key = `${item.salarie_id}_${item.date}`;
        const existing = map.get(key);
        if (existing) {
          map.set(key, { ...existing, ...item });
        } else {
          const newId =
            item.id ||
            `PTG-${item.date.replace(/-/g, '')}-${Math.random().toString(36).substr(2, 5)}`;
          map.set(key, {
            ...item,
            id: newId,
            createdAt: new Date().toISOString(),
          });
        }
      });

      return Array.from(map.values());
    });
  };

  const deletePointage = (id: string) => {
    setPointages((prev) => prev.filter((p) => p.id !== id));
  };

  // Réinitialisation aux données de démonstration
  const resetToSeedData = () => {
    setMarches(SEED_MARCHES);
    setFormations(SEED_FORMATIONS);
    setIntervenants(SEED_INTERVENANTS);
    setInterventions(SEED_INTERVENTIONS);
    setDecomptes(SEED_DECOMPTES);
    setPaiements(SEED_PAIEMENTS);

    setMarchesSalaires(SEED_MARCHES_SALAIRES);
    setSalaries(SEED_SALARIES);
    setDecomptesSalaires(SEED_DECOMPTES_SALAIRES);
    setPaiementsSalaires(SEED_PAIEMENTS_SALAIRES);
    setPointages(SEED_POINTAGES);

    addToast({
      type: 'info',
      message: 'Données réinitialisées',
      description: 'Les données des Formations, Salaires et Pointages ont été restaurées aux valeurs initiales.',
    });
  };

  // Export complet de la base
  const exportDatabaseToJson = () => {
    const data = {
      exportDate: new Date().toISOString(),
      version: '2.1',
      marches,
      formations,
      intervenants,
      interventions,
      decomptes,
      paiements,
      marchesSalaires,
      salaries,
      decomptesSalaires,
      paiementsSalaires,
      pointages,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_gestion_marches_salaires_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      message: 'Export terminé',
      description: 'Le fichier JSON de sauvegarde a été téléchargé.',
    });
  };

  // Importation
  const importDatabaseFromJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!Array.isArray(data.marches) || !Array.isArray(data.formations) || !Array.isArray(data.intervenants)) {
        return { success: false, message: 'Format de fichier de sauvegarde invalide.' };
      }
      setMarches(data.marches);
      setFormations(data.formations);
      setIntervenants(data.intervenants);
      setInterventions(data.interventions || []);
      setDecomptes(data.decomptes || []);
      setPaiements(data.paiements || []);

      if (Array.isArray(data.marchesSalaires)) setMarchesSalaires(data.marchesSalaires);
      if (Array.isArray(data.salaries)) setSalaries(data.salaries);
      if (Array.isArray(data.decomptesSalaires)) setDecomptesSalaires(data.decomptesSalaires);
      if (Array.isArray(data.paiementsSalaires)) setPaiementsSalaires(data.paiementsSalaires);
      if (Array.isArray(data.pointages)) setPointages(data.pointages);

      addToast({
        type: 'success',
        message: 'Import réussi',
        description: 'Toutes les données ont été restaurées avec succès.',
      });
      return { success: true, message: 'Base restaurée avec succès.' };
    } catch (e) {
      const err = e instanceof Error ? e.message : 'Erreur inconnue';
      return { success: false, message: `Échec de lecture du fichier : ${err}` };
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        marches,
        formations,
        intervenants,
        interventions,
        decomptes,
        paiements,
        marchesSalaires,
        salaries,
        decomptesSalaires,
        paiementsSalaires,
        pointages,
        currentUser,
        users,
        toasts,
        addMarche,
        updateMarche,
        deleteMarche,
        addFormation,
        updateFormation,
        deleteFormation,
        addIntervenant,
        updateIntervenant,
        deleteIntervenant,
        addIntervention,
        updateIntervention,
        deleteIntervention,
        addDecompte,
        updateDecompte,
        deleteDecompte,
        addPaiement,
        updatePaiement,
        deletePaiement,
        addMarcheSalaire,
        updateMarcheSalaire,
        deleteMarcheSalaire,
        addSalarie,
        updateSalarie,
        deleteSalarie,
        addDecompteSalaire,
        updateDecompteSalaire,
        deleteDecompteSalaire,
        addPaiementSalarie,
        updatePaiementSalarie,
        deletePaiementSalarie,
        setPointage,
        setMultiplePointages,
        deletePointage,
        interventionsEnrichies,
        getInterventionEnrichieById,
        getMarcheSituation,
        getIntervenantSituation,
        marchesSalairesSituations,
        salariesEnrichis,
        decomptesSalairesEnrichis,
        paiementsSalairesEnrichis,
        getMarcheSalaireSituation,
        getSalarieSituation,
        salairesAlerteRetard,
        setCurrentUser,
        hasPermission,
        addToast,
        removeToast,
        resetToSeedData,
        exportDatabaseToJson,
        importDatabaseFromJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé à l\'intérieur d\'un AppProvider');
  }
  return context;
}
