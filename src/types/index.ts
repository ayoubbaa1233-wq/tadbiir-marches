export type NatureFormation = 'Disciplinaire' | 'Complémentaire';
export type ModePaiement = 'Virement' | 'Espèces';
export type EtatPaiement = 'Non payé' | 'En cours' | 'Payé';
export type RoleUtilisateur = 'Administrateur' | 'Gestionnaire' | 'Consultation';

export interface Marche {
  id: string; // Ex: M001
  reference: string; // Ex: 01/2026
  objet: string; // Ex: Formation modules disciplinaires
  dateDebut: string; // YYYY-MM-DD
  dateFin: string; // YYYY-MM-DD
  montant: number; // En DH
  observations?: string;
  createdAt: string;
}

export interface Formation {
  id: string; // Ex: FOR-001
  marcheId: string; // Réf vers Marche
  nature: NatureFormation;
  module: string; // Ex: Mathématiques II
  filiere: string; // Ex: M1 Eau
  description?: string;
  createdAt: string;
}

export interface Intervenant {
  id: string; // Ex: INT-001
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  specialite: string;
  cin?: string;
  rib?: string;
  createdAt: string;
}

export interface SeanceIntervention {
  id: string; // Ex: SEA-001
  date: string; // YYYY-MM-DD
  heures: number; // > 0
  description?: string;
}

export interface Intervention {
  id: string; // Ex: ITV-001
  formationId: string; // Réf vers Formation
  intervenantId: string; // Réf vers Intervenant
  masseHoraire: number; // en heures > 0 (somme des séances)
  tauxHoraire: number; // en DH/h >= 0
  montantTotal: number; // Calculé = masseHoraire * tauxHoraire
  seances?: SeanceIntervention[];
  observations?: string;
  createdAt: string;
}

export interface Paiement {
  id: string; // Ex: PAY-001
  interventionId: string; // Réf vers Intervention
  date: string; // YYYY-MM-DD
  montant: number; // en DH > 0
  mode: ModePaiement;
  reference: string; // Ex: VIR-2026-102
  observation?: string;
  createdAt: string;
}

export interface Decompte {
  id: string; // Ex: DEC-001
  marcheId: string; // Réf vers Marche
  numero: number; // 1, 2, 3...
  date: string; // YYYY-MM-DD
  montantRecu: number; // en DH > 0
  referenceVirement: string; // Ex: VIR-ENT-8841
  observation?: string;
  createdAt: string;
}

export interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  role: RoleUtilisateur;
  avatarUrl?: string;
  fonction?: string;
  telephone?: string;
  entite?: string;
}

export interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
}

// Données calculées enrichies
export interface InterventionEnrichie extends Intervention {
  formation?: Formation;
  marche?: Marche;
  intervenant?: Intervenant;
  totalPaye: number;
  resteAPayer: number;
  etat: EtatPaiement;
  paiements: Paiement[];
}

export interface MarcheSituationFinanciere {
  marche: Marche;
  totalDecomptesRecus: number;
  montantRestantARecevoir: number;
  tauxEncaissement: number; // en %
  montantTotalPrevuIntervenants: number;
  totalPayeIntervenants: number;
  resteAPayerIntervenants: number;
  tauxPaiementIntervenants: number; // en %
  soldePrevisionnel: number; // Montant Marché - Total Prévu Intervenants
  soldeTresorerie: number; // Total Décomptes Reçus - Total Payé Intervenants
  nombreFormations: number;
  nombreIntervenants: number;
  masseHoraireTotale: number;
}

// ==================== GESTION DES SALAIRES ====================

export type AppActiveModule = 'formations' | 'salaires';

export type LieuAffectationSalarie =
  | 'Centre pédagogique'
  | 'Laboratoire'
  | 'Administration'
  | "Centre d'Excellence"
  | 'Autre';

export type ModePaiementSalaire = 'Virement' | 'Espèces' | 'Chèque';

export interface MarcheSalaire {
  id: string; // Ex: MS-001
  reference: string; // Ex: 01/SAL/2026
  objet: string; // Ex: Mise à disposition de personnel
  dateCommencement: string; // YYYY-MM-DD
  delaiMois: number; // Ex: 12
  montantContractuel: number; // En DH
  observations?: string;
  createdAt: string;
}

export interface Salarie {
  id: string; // Ex: SAL-001
  nom: string;
  prenom: string;
  cin: string;
  rib: string;
  specialite: string;
  telephone: string;
  email: string;
  adresse: string;
  lieuAffectation: LieuAffectationSalarie;
  lieuAffectationAutre?: string;
  salaireBase?: number; // En DH
  marcheSalaireId?: string; // ID Marché de rattachement
  createdAt: string;
}

export interface DecompteSalaire {
  id: string; // Ex: DEC-SAL-001
  marcheSalaireId: string;
  numero: number;
  date: string; // YYYY-MM-DD
  montantRecu: number; // En DH
  referenceVirement: string;
  observation?: string;
  createdAt: string;
}

export interface PaiementSalarie {
  id: string; // Ex: PAY-SAL-001
  salarieId: string;
  marcheSalaireId: string;
  periode: string; // Ex: Septembre 2026
  montant: number; // En DH
  date: string; // YYYY-MM-DD
  mode: ModePaiementSalaire;
  reference: string;
  observation?: string;
  createdAt: string;
}

export interface MarcheSalaireSituationFinanciere {
  marche: MarcheSalaire;
  totalDecomptesRecus: number;
  resteARecevoir: number;
  tauxEncaissement: number; // %
  totalSalairesVerses: number;
  soldeTresorerie: number; // Encaissé - Payé
  nombreSalariesAffectes: number;
  nombreDecomptes: number;
  nombrePaiements: number;
}

export interface SalarieEnrichi extends Salarie {
  totalSalairesRecus: number;
  nombrePaiements: number;
  dernierPaiementDate?: string;
  dernierePeriodePayee?: string;
  paiements: PaiementSalarie[];
}

export interface PaiementSalarieEnrichi extends PaiementSalarie {
  salarie?: Salarie;
  marcheSalaire?: MarcheSalaire;
}

export interface DecompteSalaireEnrichi extends DecompteSalaire {
  marcheSalaire?: MarcheSalaire;
}

export interface SalairesAlerteRetard {
  isRetard: boolean;
  moisEchu: string; // Ex: "Août 2026" ou "Septembre 2026"
  salariesEnRetard: Salarie[];
  nbSalariesEnRetard: number;
}

// ==================== POINTAGE & PRÉSENCE DES SALARIÉS ====================

export type StatutPointage =
  | 'PRESENT'
  | 'ABSENCE_AUTORISEE'
  | 'ABSENCE_NON_AUTORISEE'
  | 'CONGE';

export interface Pointage {
  id: string; // Ex: PTG-001
  salarie_id: string; // ID Salarié (SAL-001)
  date: string; // YYYY-MM-DD
  statut: StatutPointage;
  motif?: string;
  createdAt?: string;
}

export interface RecapitulatifPointageSalarie {
  salarie: Salarie;
  marcheSalaire?: MarcheSalaire;
  joursPresents: number;
  absencesAutorisees: number;
  absencesNonAutorisees: number;
  conges: number;
  totalJoursPointes: number;
  tauxAssiduite: number; // en %
}
