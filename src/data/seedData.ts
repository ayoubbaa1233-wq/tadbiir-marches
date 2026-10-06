import {
  Marche,
  Formation,
  Intervenant,
  Intervention,
  Paiement,
  Decompte,
  Utilisateur,
  MarcheSalaire,
  Salarie,
  DecompteSalaire,
  PaiementSalarie,
  Pointage,
} from '../types';

export const SEED_UTILISATEURS: Utilisateur[] = [
  {
    id: 'USR-001',
    nom: 'Ayoub Hantouchi',
    email: 'ayoub.hantouchii@gmail.com',
    role: 'Administrateur',
  },
  {
    id: 'USR-002',
    nom: 'Karim Mansouri',
    email: 'k.mansouri@administration.gov.ma',
    role: 'Gestionnaire',
  },
  {
    id: 'USR-003',
    nom: 'Salma El Idrissi',
    email: 's.elidrissi@administration.gov.ma',
    role: 'Consultation',
  },
];

export const SEED_MARCHES: Marche[] = [
  {
    id: 'M001',
    reference: '01/2026',
    objet: 'Formation continue sur les modules disciplinaires et d\'ingénierie appliquée',
    dateDebut: '2026-10-01',
    dateFin: '2027-06-30',
    montant: 3500000,
    observations: 'Marché prioritaire - Pôle Ingénierie et Sciences de l\'Eau',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'M002',
    reference: '02/2026',
    objet: 'Renforcement des compétences en sciences de l\'eau, géotechnique et assainissement',
    dateDebut: '2026-10-15',
    dateFin: '2027-07-31',
    montant: 2800000,
    observations: 'Convention cadre avec les laboratoires nationaux de référence',
    createdAt: '2026-09-05T11:30:00Z',
  },
  {
    id: 'M003',
    reference: '03/2026',
    objet: 'Perfectionnement managérial, gouvernance publique et compétences transversales',
    dateDebut: '2026-11-01',
    dateFin: '2027-05-30',
    montant: 1950000,
    observations: 'Formations transversales destinées aux chefs de service et cadres dirigeants',
    createdAt: '2026-09-10T09:15:00Z',
  },
  {
    id: 'M004',
    reference: '04/2026',
    objet: 'Modules d\'informatique décisionnelle, SIG et technologies numériques avancées',
    dateDebut: '2026-11-15',
    dateFin: '2027-09-15',
    montant: 2200000,
    observations: 'Volet transformation digitale et modélisation spatiale',
    createdAt: '2026-09-12T14:00:00Z',
  },
  {
    id: 'M005',
    reference: '05/2026',
    objet: 'Programme de formation spécialisée en transition énergétique et efficacité des ressources',
    dateDebut: '2026-12-01',
    dateFin: '2027-08-30',
    montant: 1650000,
    observations: 'Accompagnement de la stratégie nationale de décarbonation',
    createdAt: '2026-09-15T08:45:00Z',
  },
];

export const SEED_INTERVENANTS: Intervenant[] = [
  {
    id: 'INT-001',
    nom: 'BENJELLOUN',
    prenom: 'Mohamed',
    telephone: '+212 6 61 24 58 90',
    email: 'm.benjelloun@ac-ingenierie.ma',
    specialite: 'Génie Civil & Béton Armé',
    cin: 'AB458921',
    rib: '011 780 0000123456789012 45',
    createdAt: '2026-09-02T08:00:00Z',
  },
  {
    id: 'INT-002',
    nom: 'EL AMMANI',
    prenom: 'Rachid',
    telephone: '+212 6 62 15 78 34',
    email: 'r.elammani@univ-sciences.ma',
    specialite: 'Mathématiques Appliquées & Modélisation',
    cin: 'BK339841',
    rib: '022 810 0000987654321098 77',
    createdAt: '2026-09-02T08:15:00Z',
  },
  {
    id: 'INT-003',
    nom: 'CHRAIBI',
    prenom: 'Fatima-Zahra',
    telephone: '+212 6 63 90 12 45',
    email: 'fz.chraibi@hydrolab.ma',
    specialite: 'Hydraulique Urbaine & Réseaux',
    cin: 'CD551204',
    rib: '007 790 0000456123789456 12',
    createdAt: '2026-09-02T08:30:00Z',
  },
  {
    id: 'INT-004',
    nom: 'TAZI',
    prenom: 'Hicham',
    telephone: '+212 6 64 33 89 01',
    email: 'h.tazi@data-expert.ma',
    specialite: 'Informatique Décisionnelle & Data Analytics',
    cin: 'EE109823',
    rib: '013 780 0000789456123012 34',
    createdAt: '2026-09-02T08:45:00Z',
  },
  {
    id: 'INT-005',
    nom: 'BERRADA',
    prenom: 'Kenza',
    telephone: '+212 6 65 77 65 23',
    email: 'k.berrada@consult-rh.ma',
    specialite: 'Management de Projets & Communication',
    cin: 'FL890123',
    rib: '182 810 0000654987321654 89',
    createdAt: '2026-09-02T09:00:00Z',
  },
  {
    id: 'INT-006',
    nom: 'IDRISSI',
    prenom: 'Youssef',
    telephone: '+212 6 66 44 12 78',
    email: 'y.idrissi@geomatique.ma',
    specialite: 'SIG & Cartographie Numérique',
    cin: 'GB671239',
    rib: '225 790 0000321654987123 55',
    createdAt: '2026-09-02T09:15:00Z',
  },
  {
    id: 'INT-007',
    nom: 'BOUKHLIFI',
    prenom: 'Sanaa',
    telephone: '+212 6 67 88 90 12',
    email: 's.boukhlifi@juris-conseil.ma',
    specialite: 'Droit des Marchés Publics & Contentieux',
    cin: 'HA345120',
    rib: '050 810 0000159753486258 91',
    createdAt: '2026-09-02T09:30:00Z',
  },
  {
    id: 'INT-008',
    nom: 'EL FASSI',
    prenom: 'Tarik',
    telephone: '+212 6 68 22 34 56',
    email: 't.elfassi@geotech.ma',
    specialite: 'Mécanique des Sols & Géotechnique',
    cin: 'JA781290',
    rib: '011 780 0000852963741852 63',
    createdAt: '2026-09-02T09:45:00Z',
  },
  {
    id: 'INT-009',
    nom: 'ALAMI',
    prenom: 'Othmane',
    telephone: '+212 6 69 55 67 89',
    email: 'o.alami@green-power.ma',
    specialite: 'Énergies Renouvelables & Efficacité',
    cin: 'KB456123',
    rib: '022 810 0000753159852456 28',
    createdAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'INT-010',
    nom: 'ZEROUALI',
    prenom: 'Nadia',
    telephone: '+212 6 70 11 23 45',
    email: 'n.zerouali@qualite-eau.ma',
    specialite: 'Chimie des Eaux & Traitement',
    cin: 'LC901234',
    rib: '007 790 0000951357456852 40',
    createdAt: '2026-09-02T10:15:00Z',
  },
  {
    id: 'INT-011',
    nom: 'NACIRI',
    prenom: 'Mehdi',
    telephone: '+212 6 71 44 56 78',
    email: 'm.naciri@stats-maroc.ma',
    specialite: 'Statistiques & Analyse Prédictive',
    cin: 'MD234567',
    rib: '013 780 0000357951456123 72',
    createdAt: '2026-09-02T10:30:00Z',
  },
  {
    id: 'INT-012',
    nom: 'KABBAGE',
    prenom: 'Leila',
    telephone: '+212 6 72 88 99 00',
    email: 'l.kabbage@leadership-academy.ma',
    specialite: 'Leadership & Gouvernance d\'Équipe',
    cin: 'NE890145',
    rib: '182 810 0000147258369741 19',
    createdAt: '2026-09-02T10:45:00Z',
  },
];

export const SEED_FORMATIONS: Formation[] = [
  // Marché M001 (4 formations)
  {
    id: 'FOR-001',
    marcheId: 'M001',
    nature: 'Disciplinaire',
    module: 'Mathématiques II',
    filiere: 'M1 Eau',
    description: 'Calcul tensoriel, équations différentielles et modélisation hydraulique',
    createdAt: '2026-09-15T09:00:00Z',
  },
  {
    id: 'FOR-002',
    marcheId: 'M001',
    nature: 'Disciplinaire',
    module: 'Béton armé et dimensionnement des structures',
    filiere: 'Génie Civil',
    description: 'Eurocode 2 et BAEL 91 révisé pour ouvrages d\'art et réservoirs',
    createdAt: '2026-09-15T09:15:00Z',
  },
  {
    id: 'FOR-003',
    marcheId: 'M001',
    nature: 'Disciplinaire',
    module: 'Hydraulique urbaine et modélisation de réseaux',
    filiere: 'M1 Eau',
    description: 'Écoulements en charge, coups de bélier et régulation de pression',
    createdAt: '2026-09-15T09:30:00Z',
  },
  {
    id: 'FOR-004',
    marcheId: 'M001',
    nature: 'Complémentaire',
    module: 'Communication professionnelle et gestion des réunions',
    filiere: 'Tronc Commun',
    description: 'Techniques d\'animation, synthèse écrite et prise de parole',
    createdAt: '2026-09-15T09:45:00Z',
  },

  // Marché M002 (4 formations)
  {
    id: 'FOR-005',
    marcheId: 'M002',
    nature: 'Disciplinaire',
    module: 'Mécanique des sols et fondations profondes',
    filiere: 'Génie Civil',
    description: 'Sondages in situ, tassements et stabilité des pentes',
    createdAt: '2026-09-16T10:00:00Z',
  },
  {
    id: 'FOR-006',
    marcheId: 'M002',
    nature: 'Disciplinaire',
    module: 'Assainissement liquide et traitement des effluents',
    filiere: 'M1 Eau',
    description: 'Dimensionnement des stations STEP et réutilisation des eaux usées',
    createdAt: '2026-09-16T10:15:00Z',
  },
  {
    id: 'FOR-007',
    marcheId: 'M002',
    nature: 'Disciplinaire',
    module: 'Chimie des eaux et potabilisation',
    filiere: 'Ressources en Eau',
    description: 'Analyses physico-chimiques, désinfection et déminéralisation',
    createdAt: '2026-09-16T10:30:00Z',
  },
  {
    id: 'FOR-008',
    marcheId: 'M002',
    nature: 'Complémentaire',
    module: 'Droit des marchés publics appliqué aux travaux',
    filiere: 'Tronc Commun',
    description: 'Décret des marchés publics marocain, passation, ordres de service et réclamations',
    createdAt: '2026-09-16T10:45:00Z',
  },

  // Marché M003 (3 formations)
  {
    id: 'FOR-009',
    marcheId: 'M003',
    nature: 'Complémentaire',
    module: 'Gestion de projet selon le standard PMI/Agile',
    filiere: 'Management',
    description: 'Cycle de vie, planification, WBS, suivi des coûts et gestion des risques',
    createdAt: '2026-09-17T08:30:00Z',
  },
  {
    id: 'FOR-010',
    marcheId: 'M003',
    nature: 'Complémentaire',
    module: 'Leadership, négociation et intelligence relationnelle',
    filiere: 'Management',
    description: 'Techniques de négociation raisonnée et mobilisation des équipes',
    createdAt: '2026-09-17T08:45:00Z',
  },
  {
    id: 'FOR-011',
    marcheId: 'M003',
    nature: 'Complémentaire',
    module: 'Anglais technique et communication internationale',
    filiere: 'Tronc Commun',
    description: 'Rédaction de rapports d\'ingénierie et présentations de projets en anglais',
    createdAt: '2026-09-17T09:00:00Z',
  },

  // Marché M004 (4 formations)
  {
    id: 'FOR-012',
    marcheId: 'M004',
    nature: 'Disciplinaire',
    module: 'SIG et cartographie numérique sous ArcGIS / QGIS',
    filiere: 'Géomatique & Eau',
    description: 'Traitement de données spatiales, géoréférencement et analyses spatiales',
    createdAt: '2026-09-18T11:00:00Z',
  },
  {
    id: 'FOR-013',
    marcheId: 'M004',
    nature: 'Disciplinaire',
    module: 'Informatique décisionnelle et Business Intelligence (Power BI)',
    filiere: 'Informatique Décisionnelle',
    description: 'Modélisation en étoile, DAX avancé et tableaux de bord exécutifs',
    createdAt: '2026-09-18T11:15:00Z',
  },
  {
    id: 'FOR-014',
    marcheId: 'M004',
    nature: 'Disciplinaire',
    module: 'Programmation Python et analyse de données scientifiques',
    filiere: 'Informatique Décisionnelle',
    description: 'NumPy, Pandas, Matplotlib et automatisation des calculs d\'ingénierie',
    createdAt: '2026-09-18T11:30:00Z',
  },
  {
    id: 'FOR-015',
    marcheId: 'M004',
    nature: 'Disciplinaire',
    module: 'Statistiques avancées et modélisation prédictive',
    filiere: 'Informatique Décisionnelle',
    description: 'Régression multivariée, séries temporelles et détection d\'anomalies',
    createdAt: '2026-09-18T11:45:00Z',
  },

  // Marché M005 (3 formations)
  {
    id: 'FOR-016',
    marcheId: 'M005',
    nature: 'Disciplinaire',
    module: 'Systèmes photovoltaïques et pompage solaire de l\'eau',
    filiere: 'Énergies Renouvelables',
    description: 'Dimensionnement des générateurs PV, onduleurs et variateurs solaires',
    createdAt: '2026-09-19T09:30:00Z',
  },
  {
    id: 'FOR-017',
    marcheId: 'M005',
    nature: 'Disciplinaire',
    module: 'Audit énergétique et décarbonation industrielle',
    filiere: 'Énergies Renouvelables',
    description: 'Norme ISO 50001, instrumentation de mesure et plans de mesurage',
    createdAt: '2026-09-19T09:45:00Z',
  },
  {
    id: 'FOR-018',
    marcheId: 'M005',
    nature: 'Complémentaire',
    module: 'Réglementation environnementale et transition écologique',
    filiere: 'Environnement',
    description: 'Loi-cadre sur l\'environnement, études d\'impact et démarches RSE',
    createdAt: '2026-09-19T10:00:00Z',
  },
];

export const SEED_INTERVENTIONS: Intervention[] = [
  // Interventions pour FOR-001 (Mathématiques II) : Deux intervenants (Professeur A et B)
  {
    id: 'ITV-001',
    formationId: 'FOR-001',
    intervenantId: 'INT-002', // EL AMMANI Rachid
    masseHoraire: 30,
    tauxHoraire: 350,
    montantTotal: 10500, // 30 * 350
    seances: [
      { id: 'SEA-001-1', date: '2026-10-06', heures: 6, description: 'Cours magistral : Espaces vectoriels et calcul tensoriel' },
      { id: 'SEA-001-2', date: '2026-10-13', heures: 6, description: 'Équations différentielles appliquées aux écoulements' },
      { id: 'SEA-001-3', date: '2026-10-20', heures: 6, description: 'Travaux dirigés : Modélisation des flux et dérivées partielles' },
      { id: 'SEA-001-4', date: '2026-10-27', heures: 6, description: 'Méthodes de résolution numérique et discrétisation' },
      { id: 'SEA-001-5', date: '2026-11-03', heures: 6, description: 'Synthèse d\'ingénierie et cas d\'études pratiques' },
    ],
    observations: 'Module théorique et travaux dirigés',
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    id: 'ITV-002',
    formationId: 'FOR-001',
    intervenantId: 'INT-011', // NACIRI Mehdi
    masseHoraire: 20,
    tauxHoraire: 300,
    montantTotal: 6000, // 20 * 300
    seances: [
      { id: 'SEA-002-1', date: '2026-10-08', heures: 4, description: 'Introduction aux outils de calcul numérique et MATLAB' },
      { id: 'SEA-002-2', date: '2026-10-15', heures: 4, description: 'Atelier scripts et calcul matriciel appliqué' },
      { id: 'SEA-002-3', date: '2026-10-22', heures: 4, description: 'Simulation des régimes transitoires' },
      { id: 'SEA-002-4', date: '2026-10-29', heures: 4, description: 'Visualisation graphique des champs de vitesse' },
      { id: 'SEA-002-5', date: '2026-11-05', heures: 4, description: 'Évaluation pratique et validation des modèles' },
    ],
    observations: 'Ateliers numériques et travaux pratiques sur MATLAB',
    createdAt: '2026-09-20T10:15:00Z',
  },

  // FOR-002 (Béton armé)
  {
    id: 'ITV-003',
    formationId: 'FOR-002',
    intervenantId: 'INT-001', // BENJELLOUN Mohamed
    masseHoraire: 31,
    tauxHoraire: 250,
    montantTotal: 7750, // Conforme à l'exemple du prompt (31h * 250 = 7750 DH)
    seances: [
      { id: 'SEA-003-1', date: '2026-10-12', heures: 6, description: 'Rappels BAEL 91 & Eurocode 2 pour ouvrages hydrauliques' },
      { id: 'SEA-003-2', date: '2026-10-19', heures: 6, description: 'Dimensionnement des radiers et voiles en béton armé' },
      { id: 'SEA-003-3', date: '2026-10-26', heures: 7, description: 'Calcul des armatures longitudinales et d\'effort tranchant' },
      { id: 'SEA-003-4', date: '2026-11-02', heures: 6, description: 'Vérification à l\'état limite d\'ouverture des fissures (ELS)' },
      { id: 'SEA-003-5', date: '2026-11-09', heures: 6, description: 'Dessins de ferraillage et études de dalots sous chaussée' },
    ],
    observations: 'Dimensionnement des réservoirs et dalots',
    createdAt: '2026-09-20T10:30:00Z',
  },

  // FOR-003 (Hydraulique urbaine)
  {
    id: 'ITV-004',
    formationId: 'FOR-003',
    intervenantId: 'INT-003', // CHRAIBI Fatima-Zahra
    masseHoraire: 40,
    tauxHoraire: 350,
    montantTotal: 14000,
    seances: [
      { id: 'SEA-004-1', date: '2026-10-20', heures: 8, description: 'Principes hydrauliques des écoulements sous pression' },
      { id: 'SEA-004-2', date: '2026-10-27', heures: 8, description: 'Conception des stations de reprise et châteaux d\'eau' },
      { id: 'SEA-004-3', date: '2026-11-03', heures: 8, description: 'Modélisation numérique des maillages sous EPANET' },
      { id: 'SEA-004-4', date: '2026-11-10', heures: 8, description: 'Diagnostic des pertes de charge et sectorisation' },
      { id: 'SEA-004-5', date: '2026-11-17', heures: 8, description: 'Étude d\'un réseau d\'adduction pour agglomération' },
    ],
    observations: 'Réseaux de distribution et modélisation EPANET',
    createdAt: '2026-09-20T10:45:00Z',
  },

  // FOR-004 (Communication)
  {
    id: 'ITV-005',
    formationId: 'FOR-004',
    intervenantId: 'INT-005', // BERRADA Kenza
    masseHoraire: 25,
    tauxHoraire: 300,
    montantTotal: 7500,
    seances: [
      { id: 'SEA-005-1', date: '2026-11-05', heures: 5, description: 'Communication interpersonnelle et dynamique de groupe' },
      { id: 'SEA-005-2', date: '2026-11-12', heures: 5, description: 'Techniques de négociation technique avec les maîtres d\'ouvrage' },
      { id: 'SEA-005-3', date: '2026-11-19', heures: 5, description: 'Gestion des situations de crise et conflits sur chantier' },
      { id: 'SEA-005-4', date: '2026-11-26', heures: 5, description: 'Rédaction de comptes-rendus et présentations exécutives' },
      { id: 'SEA-005-5', date: '2026-12-03', heures: 5, description: 'Jeux de rôles et débriefings vidéo personnalisés' },
    ],
    observations: 'Communication managériale',
    createdAt: '2026-09-20T11:00:00Z',
  },

  // FOR-005 (Mécanique des sols)
  {
    id: 'ITV-006',
    formationId: 'FOR-005',
    intervenantId: 'INT-008', // EL FASSI Tarik
    masseHoraire: 35,
    tauxHoraire: 350,
    montantTotal: 12250,
    seances: [
      { id: 'SEA-006-1', date: '2026-11-10', heures: 7, description: 'Essais de laboratoire (oedomètre, triaxial, Proctor)' },
      { id: 'SEA-006-2', date: '2026-11-17', heures: 7, description: 'Calcul des tassements et consolidation des sols fins' },
      { id: 'SEA-006-3', date: '2026-11-24', heures: 7, description: 'Capacité portante des fondations superficielles et profondes' },
      { id: 'SEA-006-4', date: '2026-12-01', heures: 7, description: 'Stabilité des talus et digues en terre sous infiltration' },
      { id: 'SEA-006-5', date: '2026-12-08', heures: 7, description: 'Pathologies géotechniques et confortement par inclusions' },
    ],
    observations: 'Géotechnique appliquée aux barrages et ouvrages d\'art',
    createdAt: '2026-09-20T11:15:00Z',
  },
  {
    id: 'ITV-007',
    formationId: 'FOR-005',
    intervenantId: 'INT-001', // BENJELLOUN Mohamed (intervient dans plusieurs formations/marchés !)
    masseHoraire: 15,
    tauxHoraire: 350,
    montantTotal: 5250,
    seances: [
      { id: 'SEA-007-1', date: '2026-11-12', heures: 5, description: 'Modélisation éléments finis des interactions sol-pieux' },
      { id: 'SEA-007-2', date: '2026-11-19', heures: 5, description: 'Vérification aux sollicitations sismiques combinées' },
      { id: 'SEA-007-3', date: '2026-11-26', heures: 5, description: 'Étude d\'un radier général sur sol élasto-plastique' },
    ],
    observations: 'Interaction sol-structure',
    createdAt: '2026-09-20T11:30:00Z',
  },

  // FOR-006 (Assainissement liquide)
  {
    id: 'ITV-008',
    formationId: 'FOR-006',
    intervenantId: 'INT-003', // CHRAIBI Fatima-Zahra
    masseHoraire: 30,
    tauxHoraire: 350,
    montantTotal: 10500,
    seances: [
      { id: 'SEA-008-1', date: '2026-11-20', heures: 6, description: 'Hydrologie urbaine et estimation des débits de pointe' },
      { id: 'SEA-008-2', date: '2026-11-27', heures: 6, description: 'Dimensionnement des collecteurs gravitaires unitaire et séparatif' },
      { id: 'SEA-008-3', date: '2026-12-04', heures: 6, description: 'Ouvrages spéciaux : déversoirs d\'orage et regards de chute' },
      { id: 'SEA-008-4', date: '2026-12-11', heures: 6, description: 'Stations de relevage des eaux usées et régulation' },
      { id: 'SEA-008-5', date: '2026-12-18', heures: 6, description: 'Dimensionnement hydraulique des bassins d\'écrêtement' },
    ],
    observations: 'Collecteurs et bassins d\'orage',
    createdAt: '2026-09-20T11:45:00Z',
  },

  // FOR-007 (Chimie des eaux)
  {
    id: 'ITV-009',
    formationId: 'FOR-007',
    intervenantId: 'INT-010', // ZEROUALI Nadia
    masseHoraire: 30,
    tauxHoraire: 300,
    montantTotal: 9000,
    seances: [
      { id: 'SEA-009-1', date: '2026-12-05', heures: 6, description: 'Paramètres physico-chimiques et normes de potabilité NM 03.7.001' },
      { id: 'SEA-009-2', date: '2026-12-12', heures: 6, description: 'Procédés de coagulation-floculation et jar-test' },
      { id: 'SEA-009-3', date: '2026-12-19', heures: 6, description: 'Filtration sur sable et membranes d\'ultrafiltration' },
      { id: 'SEA-009-4', date: '2027-01-09', heures: 6, description: 'Désinfection finale (chloration, ozonation, UV)' },
      { id: 'SEA-009-5', date: '2027-01-16', heures: 6, description: 'Équilibre calco-carbonique et indices de saturation' },
    ],
    observations: 'Contrôle qualité et potabilisation',
    createdAt: '2026-09-20T12:00:00Z',
  },

  // FOR-008 (Droit des marchés publics)
  {
    id: 'ITV-010',
    formationId: 'FOR-008',
    intervenantId: 'INT-007', // BOUKHLIFI Sanaa
    masseHoraire: 24,
    tauxHoraire: 400,
    montantTotal: 9600,
    seances: [
      { id: 'SEA-010-1', date: '2026-11-20', heures: 6, description: 'Nouveau décret des marchés publics et principes fondamentaux' },
      { id: 'SEA-010-2', date: '2026-11-27', heures: 6, description: 'Passation des marchés et gestion des appels d\'offres' },
      { id: 'SEA-010-3', date: '2026-12-04', heures: 6, description: 'Exécution administrative, CCAG-EMO et ordres de service' },
      { id: 'SEA-010-4', date: '2026-12-11', heures: 6, description: 'Décomptes, pénalités de retard et réceptions provisoires/définitives' },
    ],
    observations: 'Cadre légal des marchés publics et CCAG-Travaux',
    createdAt: '2026-09-20T12:15:00Z',
  },

  // FOR-009 (Gestion de projet PMI)
  {
    id: 'ITV-011',
    formationId: 'FOR-009',
    intervenantId: 'INT-005', // BERRADA Kenza
    masseHoraire: 30,
    tauxHoraire: 350,
    montantTotal: 10500,
    seances: [
      { id: 'SEA-011-1', date: '2026-12-04', heures: 6, description: 'Cadrage de projet selon le PMBOK (Charte, WBS)' },
      { id: 'SEA-011-2', date: '2026-12-11', heures: 6, description: 'Planification par chemin critique (CPM) et diagramme de GANTT' },
      { id: 'SEA-011-3', date: '2026-12-18', heures: 6, description: 'Gestion de la valeur acquise (EVM - CPI/SPI)' },
      { id: 'SEA-011-4', date: '2027-01-08', heures: 6, description: 'Cartographie et gestion des risques de projet' },
      { id: 'SEA-011-5', date: '2027-01-15', heures: 6, description: 'Clôture de projet et capitalisation du retour d\'expérience' },
    ],
    observations: 'Management de portefeuille de projets d\'infrastructure',
    createdAt: '2026-09-20T12:30:00Z',
  },

  // FOR-010 (Leadership)
  {
    id: 'ITV-012',
    formationId: 'FOR-010',
    intervenantId: 'INT-012', // KABBAGE Leila
    masseHoraire: 25,
    tauxHoraire: 400,
    montantTotal: 10000,
    seances: [
      { id: 'SEA-012-1', date: '2027-01-12', heures: 5, description: 'Styles de leadership et positionnement managérial' },
      { id: 'SEA-012-2', date: '2027-01-19', heures: 5, description: 'Motivation et engagement des collaborateurs' },
      { id: 'SEA-012-3', date: '2027-01-26', heures: 5, description: 'Délégation efficace et responsabilisation' },
      { id: 'SEA-012-4', date: '2027-02-02', heures: 5, description: 'Intelligence émotionnelle et écoute active' },
      { id: 'SEA-012-5', date: '2027-02-09', heures: 5, description: 'Conduite du changement dans l\'administration publique' },
    ],
    observations: 'Coaching d\'équipe et intelligence collective',
    createdAt: '2026-09-20T12:45:00Z',
  },

  // FOR-011 (Anglais technique)
  {
    id: 'ITV-013',
    formationId: 'FOR-011',
    intervenantId: 'INT-012', // KABBAGE Leila
    masseHoraire: 30,
    tauxHoraire: 250,
    montantTotal: 7500,
    seances: [
      { id: 'SEA-013-1', date: '2027-02-05', heures: 6, description: 'Vocabulaire technique de l\'ingénierie civile et de l\'eau' },
      { id: 'SEA-013-2', date: '2027-02-12', heures: 6, description: 'Rédaction de spécifications techniques et RFP en anglais' },
      { id: 'SEA-013-3', date: '2027-02-19', heures: 6, description: 'Animation de réunions internationales d\'ingénierie' },
      { id: 'SEA-013-4', date: '2027-02-26', heures: 6, description: 'Correspondance officielle et emails professionnels' },
      { id: 'SEA-013-5', date: '2027-03-05', heures: 6, description: 'Présentations orales de projets et simulations de pitchs' },
    ],
    observations: 'Rédaction technique internationale',
    createdAt: '2026-09-20T13:00:00Z',
  },

  // FOR-012 (SIG ArcGIS/QGIS)
  {
    id: 'ITV-014',
    formationId: 'FOR-012',
    intervenantId: 'INT-006', // IDRISSI Youssef
    masseHoraire: 40,
    tauxHoraire: 350,
    montantTotal: 14000,
    seances: [
      { id: 'SEA-014-1', date: '2026-11-20', heures: 8, description: 'Fondements géodésiques, projections et systèmes de coordonnées' },
      { id: 'SEA-014-2', date: '2026-11-27', heures: 8, description: 'Acquisition des données raster et vecteur (MNT, images satellites)' },
      { id: 'SEA-014-3', date: '2026-12-04', heures: 8, description: 'Délimitation automatique des bassins versants et réseaux hydro' },
      { id: 'SEA-014-4', date: '2026-12-11', heures: 8, description: 'Géodatabases, requêtes SQL spatiales et jointures attributaires' },
      { id: 'SEA-014-5', date: '2026-12-18', heures: 8, description: 'Mise en page cartographique et publication de géoservices Web' },
    ],
    observations: 'Analyses spatiales des bassins versants',
    createdAt: '2026-09-20T13:15:00Z',
  },

  // FOR-013 (Power BI)
  {
    id: 'ITV-015',
    formationId: 'FOR-013',
    intervenantId: 'INT-004', // TAZI Hicham
    masseHoraire: 35,
    tauxHoraire: 400,
    montantTotal: 14000,
    seances: [
      { id: 'SEA-015-1', date: '2026-12-08', heures: 7, description: 'Connecteurs Power Query et nettoyage avancé des flux de données' },
      { id: 'SEA-015-2', date: '2026-12-15', heures: 7, description: 'Modélisation relationnelle en étoile et tables de faits' },
      { id: 'SEA-015-3', date: '2027-01-05', heures: 7, description: 'Formules DAX (CALCULATE, Time Intelligence, mesures dynamiques)' },
      { id: 'SEA-015-4', date: '2027-01-12', heures: 7, description: 'Design UX de rapports et visualisations interactives' },
      { id: 'SEA-015-5', date: '2027-01-19', heures: 7, description: 'Déploiement sur le service Power BI et actualisation programmée' },
    ],
    observations: 'Dashboards décisionnels pour le suivi des ressources hydriques',
    createdAt: '2026-09-20T13:30:00Z',
  },

  // FOR-014 (Python ingénierie)
  {
    id: 'ITV-016',
    formationId: 'FOR-014',
    intervenantId: 'INT-004', // TAZI Hicham
    masseHoraire: 30,
    tauxHoraire: 350,
    montantTotal: 10500,
    seances: [
      { id: 'SEA-016-1', date: '2027-01-10', heures: 6, description: 'Structures de données avancées et POO en Python' },
      { id: 'SEA-016-2', date: '2027-01-17', heures: 6, description: 'Calculs vectorisés avec NumPy et algèbre linéaire' },
      { id: 'SEA-016-3', date: '2027-01-24', heures: 6, description: 'Analyse et manipulation de séries temporelles avec Pandas' },
      { id: 'SEA-016-4', date: '2027-01-31', heures: 6, description: 'Automatisation du traitement des rapports hydrologiques' },
      { id: 'SEA-016-5', date: '2027-02-07', heures: 6, description: 'Mini-projet d\'optimisation de réservoir d\'eau' },
    ],
    observations: 'Scripts de calculs hydrauliques et data processing',
    createdAt: '2026-09-20T13:45:00Z',
  },

  // FOR-015 (Statistiques)
  {
    id: 'ITV-017',
    formationId: 'FOR-015',
    intervenantId: 'INT-011', // NACIRI Mehdi
    masseHoraire: 25,
    tauxHoraire: 300,
    montantTotal: 7500,
    seances: [
      { id: 'SEA-017-1', date: '2027-02-08', heures: 5, description: 'Statistique descriptive et ajustements de lois de probabilité (Gumbel, Pearson)' },
      { id: 'SEA-017-2', date: '2027-02-15', heures: 5, description: 'Intervalles de confiance et tests d\'hypothèses' },
      { id: 'SEA-017-3', date: '2027-02-22', heures: 5, description: 'Analyse de régression linéaire et corrélations pluie-débit' },
      { id: 'SEA-017-4', date: '2027-03-01', heures: 5, description: 'Modélisation prédictive des crues centennales' },
      { id: 'SEA-017-5', date: '2027-03-08', heures: 5, description: 'Validation statistique des modèles environnementaux' },
    ],
    observations: 'Séries temporelles pluviométriques',
    createdAt: '2026-09-20T14:00:00Z',
  },

  // FOR-016 (Photovoltaïque)
  {
    id: 'ITV-018',
    formationId: 'FOR-016',
    intervenantId: 'INT-009', // ALAMI Othmane
    masseHoraire: 40,
    tauxHoraire: 350,
    montantTotal: 14000,
    seances: [
      { id: 'SEA-018-1', date: '2026-12-15', heures: 8, description: 'Gisement solaire au Maroc et inclinaison optimale des panneaux' },
      { id: 'SEA-018-2', date: '2026-12-22', heures: 8, description: 'Technologies de cellules PV et courbes I-V' },
      { id: 'SEA-018-3', date: '2027-01-05', heures: 8, description: 'Onduleurs solaires, variateurs de fréquence et pompage fil du soleil' },
      { id: 'SEA-018-4', date: '2027-01-12', heures: 8, description: 'Dimensionnement des câbles DC/AC et protections parafoudres' },
      { id: 'SEA-018-5', date: '2027-01-19', heures: 8, description: 'Simulation techno-économique sous PVsyst et analyse LCOE' },
    ],
    observations: 'Dimensionnement des fermes solaires de pompage',
    createdAt: '2026-09-20T14:15:00Z',
  },

  // FOR-017 (Audit énergétique)
  {
    id: 'ITV-019',
    formationId: 'FOR-017',
    intervenantId: 'INT-009', // ALAMI Othmane
    masseHoraire: 30,
    tauxHoraire: 350,
    montantTotal: 10500,
    seances: [
      { id: 'SEA-019-1', date: '2027-01-20', heures: 6, description: 'Méthodologie d\'audit selon ISO 50002 et réglementation nationale' },
      { id: 'SEA-019-2', date: '2027-01-27', heures: 6, description: 'Instrumentation de mesure sur site (analyseurs réseau, débitmètres)' },
      { id: 'SEA-019-3', date: '2027-02-03', heures: 6, description: 'Bilan énergétique des moteurs électriques et groupes motopompes' },
      { id: 'SEA-019-4', date: '2027-02-10', heures: 6, description: 'Identification des gisements d\'économies d\'énergie (IPE)' },
      { id: 'SEA-019-5', date: '2027-02-17', heures: 6, description: 'Calcul du temps de retour sur investissement (TRI / VAN)' },
    ],
    observations: 'Mesures sur site et plans de performance énergétique',
    createdAt: '2026-09-20T14:30:00Z',
  },

  // FOR-018 (Réglementation environnementale)
  {
    id: 'ITV-020',
    formationId: 'FOR-018',
    intervenantId: 'INT-007', // BOUKHLIFI Sanaa (intervient aussi sur M005)
    masseHoraire: 20,
    tauxHoraire: 400,
    montantTotal: 8000,
    seances: [
      { id: 'SEA-020-1', date: '2027-02-08', heures: 5, description: 'Loi-cadre 99-12 portant charte nationale de l\'environnement' },
      { id: 'SEA-020-2', date: '2027-02-15', heures: 5, description: 'Études d\'impact sur l\'environnement (Loi 12-03) et enquêtes publiques' },
      { id: 'SEA-020-3', date: '2027-02-22', heures: 5, description: 'Gestion des déchets industriels et rejets liquides (Loi 28-00)' },
      { id: 'SEA-020-4', date: '2027-03-01', heures: 5, description: 'Responsabilité environnementale et démarches RSE des entreprises délégataires' },
    ],
    observations: 'Conformité légale et études de dangers',
    createdAt: '2026-09-20T14:45:00Z',
  },
];

export const SEED_DECOMPTES: Decompte[] = [
  // Décomptes reçus pour M001 (Montant marché : 3 500 000 DH)
  // Exactement conformes aux exemples de décomptes donnés par le prompt :
  // Décompte 1: 370 320 DH (25/11/2025)
  // Décompte 2: 366 960 DH (23/12/2025)
  // Décompte 3: 773 040 DH (20/02/2026)
  // Décompte 4: 1 710 960 DH (15/05/2026) -> Total = 3 221 280 DH (exactement l'exemple du prompt !)
  {
    id: 'DEC-001',
    marcheId: 'M001',
    numero: 1,
    date: '2025-11-25',
    montantRecu: 370320,
    referenceVirement: 'VIR-TGR-2025-88912',
    observation: 'Décompte n° 1 - Avancement initial des prestations disciplinaires',
    createdAt: '2025-11-26T08:00:00Z',
  },
  {
    id: 'DEC-002',
    marcheId: 'M001',
    numero: 2,
    date: '2025-12-23',
    montantRecu: 366960,
    referenceVirement: 'VIR-TGR-2025-94510',
    observation: 'Décompte n° 2 - Clôture des sessions du premier trimestre',
    createdAt: '2025-12-24T09:00:00Z',
  },
  {
    id: 'DEC-003',
    marcheId: 'M001',
    numero: 3,
    date: '2026-02-20',
    montantRecu: 773040,
    referenceVirement: 'VIR-TGR-2026-10452',
    observation: 'Décompte n° 3 - Validation des modules semestriels et ateliers',
    createdAt: '2026-02-21T10:00:00Z',
  },
  {
    id: 'DEC-004',
    marcheId: 'M001',
    numero: 4,
    date: '2026-05-15',
    montantRecu: 1710960,
    referenceVirement: 'VIR-TGR-2026-28941',
    observation: 'Décompte n° 4 - Avancement majeur (Total reçu: 3 221 280 DH, Reste: 278 720 DH)',
    createdAt: '2026-05-16T11:00:00Z',
  },

  // Décomptes reçus pour M002 (Montant marché : 2 800 000 DH)
  {
    id: 'DEC-005',
    marcheId: 'M002',
    numero: 1,
    date: '2026-01-18',
    montantRecu: 650000,
    referenceVirement: 'VIR-TGR-2026-04512',
    observation: 'Décompte n° 1 - Démarrage des modules de sciences de l\'eau',
    createdAt: '2026-01-19T08:30:00Z',
  },
  {
    id: 'DEC-006',
    marcheId: 'M002',
    numero: 2,
    date: '2026-04-10',
    montantRecu: 850000,
    referenceVirement: 'VIR-TGR-2026-21045',
    observation: 'Décompte n° 2 - Réalisation des travaux pratiques et visites techniques',
    createdAt: '2026-04-11T09:00:00Z',
  },

  // Décomptes reçus pour M003 (Montant marché : 1 950 000 DH)
  {
    id: 'DEC-007',
    marcheId: 'M003',
    numero: 1,
    date: '2026-02-28',
    montantRecu: 580000,
    referenceVirement: 'VIR-TGR-2026-14523',
    observation: 'Décompte n° 1 - Cycle management et gouvernance',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'DEC-008',
    marcheId: 'M003',
    numero: 2,
    date: '2026-05-30',
    montantRecu: 620000,
    referenceVirement: 'VIR-TGR-2026-32104',
    observation: 'Décompte n° 2 - Clôture des sessions transversales',
    createdAt: '2026-06-01T11:00:00Z',
  },

  // Décomptes reçus pour M004 (Montant marché : 2 200 000 DH)
  {
    id: 'DEC-009',
    marcheId: 'M004',
    numero: 1,
    date: '2026-03-15',
    montantRecu: 750000,
    referenceVirement: 'VIR-TGR-2026-18974',
    observation: 'Décompte n° 1 - Mise en place des laboratoires informatiques et licences SIG',
    createdAt: '2026-03-16T09:00:00Z',
  },

  // Décomptes reçus pour M005 (Montant marché : 1 650 000 DH)
  {
    id: 'DEC-010',
    marcheId: 'M005',
    numero: 1,
    date: '2026-04-05',
    montantRecu: 450000,
    referenceVirement: 'VIR-TGR-2026-25890',
    observation: 'Décompte n° 1 - Modules solaires et audits préliminaires',
    createdAt: '2026-04-06T10:30:00Z',
  },
];

export const SEED_PAIEMENTS: Paiement[] = [
  // Conforme à l'exemple du prompt pour ITV-003 (Professeur A - Béton armé, 7 750 DH)
  // Paiement 1 : 2 000 DH - 15/11/2026 - Virement
  // Paiement 2 : 3 000 DH - 15/12/2026 - Virement
  // Paiement 3 : 2 750 DH - 15/01/2027 - Espèces
  // -> Total payé = 7 750 DH, Reste = 0 DH, État = PAYÉ
  {
    id: 'PAY-001',
    interventionId: 'ITV-003',
    date: '2026-11-15',
    montant: 2000,
    mode: 'Virement',
    reference: 'VIR-PAI-2026-001',
    observation: 'Acompte n° 1 - Début du module béton armé',
    createdAt: '2026-11-15T10:00:00Z',
  },
  {
    id: 'PAY-002',
    interventionId: 'ITV-003',
    date: '2026-12-15',
    montant: 3000,
    mode: 'Virement',
    reference: 'VIR-PAI-2026-024',
    observation: 'Acompte n° 2 - Mi-parcours des travaux dirigés',
    createdAt: '2026-12-15T11:00:00Z',
  },
  {
    id: 'PAY-003',
    interventionId: 'ITV-003',
    date: '2027-01-15',
    montant: 2750,
    mode: 'Espèces',
    reference: 'RECU-ESP-2027-009',
    observation: 'Solde final intervention - Règlement en espèces contre émargement',
    createdAt: '2027-01-15T12:00:00Z',
  },

  // ITV-001 (Mathématiques II - EL AMMANI Rachid, Montant prévu: 10 500 DH)
  // Paiement partiel -> État: En cours
  {
    id: 'PAY-004',
    interventionId: 'ITV-001',
    date: '2026-11-10',
    montant: 5000,
    mode: 'Virement',
    reference: 'VIR-PAI-2026-015',
    observation: 'Premier versement 50% après 15 heures dispensées',
    createdAt: '2026-11-10T09:30:00Z',
  },

  // ITV-002 (Mathématiques II - NACIRI Mehdi, Montant prévu: 6 000 DH)
  // Total payé -> État: Payé
  {
    id: 'PAY-005',
    interventionId: 'ITV-002',
    date: '2026-12-05',
    montant: 6000,
    mode: 'Virement',
    reference: 'VIR-PAI-2026-031',
    observation: 'Règlement intégral des travaux pratiques MATLAB',
    createdAt: '2026-12-05T14:00:00Z',
  },

  // ITV-004 (Hydraulique urbaine - CHRAIBI Fatima-Zahra, Montant prévu: 14 000 DH)
  // Paiement partiel -> État: En cours (Reste: 6 000 DH)
  {
    id: 'PAY-006',
    interventionId: 'ITV-004',
    date: '2026-12-20',
    montant: 8000,
    mode: 'Virement',
    reference: 'VIR-PAI-2026-048',
    observation: 'Premier acompte module réseaux',
    createdAt: '2026-12-20T10:15:00Z',
  },

  // ITV-005 (Communication - BERRADA Kenza, Montant prévu: 7 500 DH)
  // Total payé -> État: Payé
  {
    id: 'PAY-007',
    interventionId: 'ITV-005',
    date: '2026-12-22',
    montant: 7500,
    mode: 'Virement',
    reference: 'VIR-PAI-2026-052',
    observation: 'Règlement total des sessions de communication',
    createdAt: '2026-12-22T11:45:00Z',
  },

  // ITV-006 (Mécanique des sols - EL FASSI Tarik, Montant prévu: 12 250 DH)
  // Deux paiements partiels -> État: En cours (payé 7 000 DH, reste 5 250 DH)
  {
    id: 'PAY-008',
    interventionId: 'ITV-006',
    date: '2026-11-28',
    montant: 4000,
    mode: 'Virement',
    reference: 'VIR-PAI-2026-029',
    observation: 'Acompte 1 géotechnique',
    createdAt: '2026-11-28T09:00:00Z',
  },
  {
    id: 'PAY-009',
    interventionId: 'ITV-006',
    date: '2026-12-28',
    montant: 3000,
    mode: 'Espèces',
    reference: 'RECU-ESP-2026-018',
    observation: 'Acompte 2 en espèces',
    createdAt: '2026-12-28T15:30:00Z',
  },

  // ITV-010 (Droit des marchés - BOUKHLIFI Sanaa, Montant prévu: 9 600 DH)
  // Total payé -> État: Payé
  {
    id: 'PAY-010',
    interventionId: 'ITV-010',
    date: '2026-12-20',
    montant: 9600,
    mode: 'Virement',
    reference: 'VIR-PAI-2026-050',
    observation: 'Règlement intégral session droit des marchés',
    createdAt: '2026-12-20T16:00:00Z',
  },

  // ITV-011 (PMI - BERRADA Kenza, Montant prévu: 10 500 DH)
  // Paiement partiel -> État: En cours
  {
    id: 'PAY-011',
    interventionId: 'ITV-011',
    date: '2027-01-10',
    montant: 5500,
    mode: 'Virement',
    reference: 'VIR-PAI-2027-005',
    observation: 'Acompte formation gestion de projet',
    createdAt: '2027-01-10T10:00:00Z',
  },

  // ITV-014 (SIG - IDRISSI Youssef, Montant prévu: 14 000 DH)
  // Paiement partiel -> État: En cours (payé 7 000 DH)
  {
    id: 'PAY-012',
    interventionId: 'ITV-014',
    date: '2027-01-20',
    montant: 7000,
    mode: 'Virement',
    reference: 'VIR-PAI-2027-014',
    observation: 'Acompte SIG 20h validées',
    createdAt: '2027-01-20T11:00:00Z',
  },

  // ITV-015 (Power BI - TAZI Hicham, Montant prévu: 14 000 DH)
  // Total payé -> État: Payé
  {
    id: 'PAY-013',
    interventionId: 'ITV-015',
    date: '2027-02-15',
    montant: 14000,
    mode: 'Virement',
    reference: 'VIR-PAI-2027-033',
    observation: 'Règlement complet module Power BI',
    createdAt: '2027-02-15T15:00:00Z',
  },
];

// ==================== GESTION DES SALAIRES SEED DATA ====================

export const SEED_MARCHES_SALAIRES: MarcheSalaire[] = [
  {
    id: 'MS-001',
    reference: '01/SAL/2026',
    objet: 'Mise à disposition de personnel de soutien technique, logistique et pédagogique',
    dateCommencement: '2026-01-01',
    delaiMois: 12,
    montantContractuel: 480000,
    observations: 'Marché annuel d\'encadrement des centres et ateliers régionaux',
    createdAt: '2025-12-20T10:00:00Z',
  },
  {
    id: 'MS-002',
    reference: '02/SAL/2026',
    objet: 'Assistance technique pour laboratoires de recherche et plateformes d\'excellence',
    dateCommencement: '2026-02-01',
    delaiMois: 10,
    montantContractuel: 350000,
    observations: 'Opérations spécialisées et maintenance des équipements de pointe',
    createdAt: '2026-01-15T11:00:00Z',
  },
  {
    id: 'MS-003',
    reference: '03/SAL/2026',
    objet: 'Support administratif, archivage numérique et coordination des services d\'accueil',
    dateCommencement: '2026-03-01',
    delaiMois: 12,
    montantContractuel: 290000,
    observations: 'Coordination logistique générale et intendance des annexes',
    createdAt: '2026-02-10T09:30:00Z',
  },
];

export const SEED_SALARIES: Salarie[] = [
  {
    id: 'SAL-001',
    nom: 'Bennani',
    prenom: 'Youssef',
    cin: 'AB458921',
    rib: '011780000012345678901245',
    specialite: 'Technicien Supérieur de Laboratoire',
    telephone: '0661-234567',
    email: 'y.bennani@salaries.gov.ma',
    adresse: '14 Rue Oukaimeden, Agdal, Rabat',
    lieuAffectation: 'Laboratoire',
    marcheSalaireId: 'MS-001',
    salaireBase: 6500,
    createdAt: '2026-01-02T09:00:00Z',
  },
  {
    id: 'SAL-002',
    nom: 'El Amrani',
    prenom: 'Fatima Zahra',
    cin: 'BK678912',
    rib: '225780000098765432109867',
    specialite: 'Coordinatrice Pédagogique & Multimédia',
    telephone: '0663-891234',
    email: 'fz.elamrani@salaries.gov.ma',
    adresse: '28 Avenue des Nations Unies, Rabat',
    lieuAffectation: 'Centre pédagogique',
    marcheSalaireId: 'MS-001',
    salaireBase: 7000,
    createdAt: '2026-01-03T10:00:00Z',
  },
  {
    id: 'SAL-003',
    nom: 'Chraibi',
    prenom: 'Mehdi',
    cin: 'CD321456',
    rib: '007780000045612378904589',
    specialite: 'Chargé de Gestion Administrative & RH',
    telephone: '0662-345678',
    email: 'm.chraibi@salaries.gov.ma',
    adresse: '5 Rue Al Mariniyine, Hassan, Rabat',
    lieuAffectation: 'Administration',
    marcheSalaireId: 'MS-003',
    salaireBase: 6200,
    createdAt: '2026-01-05T11:00:00Z',
  },
  {
    id: 'SAL-004',
    nom: 'Tazi',
    prenom: 'Houda',
    cin: 'AE987123',
    rib: '181780000078945612301234',
    specialite: 'Ingénieure Support Plateformes de Recherche',
    telephone: '0665-678901',
    email: 'h.tazi@salaries.gov.ma',
    adresse: '42 Résidence Al Manar, Hay Riad, Rabat',
    lieuAffectation: "Centre d'Excellence",
    marcheSalaireId: 'MS-002',
    salaireBase: 8500,
    createdAt: '2026-01-06T14:00:00Z',
  },
  {
    id: 'SAL-005',
    nom: 'Zouhri',
    prenom: 'Anas',
    cin: 'BJ147258',
    rib: '022780000032165498706789',
    specialite: 'Technicien Systèmes & Réseaux Informatiques',
    telephone: '0664-567890',
    email: 'a.zouhri@salaries.gov.ma',
    adresse: '19 Avenue Allal Ben Abdellah, Salé',
    lieuAffectation: 'Autre',
    lieuAffectationAutre: 'Annexe Universitaire Bab Al Bahr',
    marcheSalaireId: 'MS-002',
    salaireBase: 5800,
    createdAt: '2026-01-08T09:30:00Z',
  },
  {
    id: 'SAL-006',
    nom: 'Lahlou',
    prenom: 'Sanaa',
    cin: 'D852963',
    rib: '001780000065498732105432',
    specialite: 'Assistante de Direction & Accueil Usagers',
    telephone: '0667-890123',
    email: 's.lahlou@salaries.gov.ma',
    adresse: '7 Rue Al Yamama, Diar Chems, Rabat',
    lieuAffectation: 'Administration',
    marcheSalaireId: 'MS-003',
    salaireBase: 5500,
    createdAt: '2026-01-10T10:30:00Z',
  },
];

export const SEED_DECOMPTES_SALAIRES: DecompteSalaire[] = [
  {
    id: 'DEC-SAL-001',
    marcheSalaireId: 'MS-001',
    numero: 1,
    date: '2026-02-15',
    montantRecu: 120000,
    referenceVirement: 'VIR-ENC-SAL-01',
    observation: 'Acompte 1er trimestre - Personnel de soutien',
    createdAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'DEC-SAL-002',
    marcheSalaireId: 'MS-001',
    numero: 2,
    date: '2026-05-20',
    montantRecu: 120000,
    referenceVirement: 'VIR-ENC-SAL-04',
    observation: 'Acompte 2ème trimestre - Personnel de soutien',
    createdAt: '2026-05-20T11:00:00Z',
  },
  {
    id: 'DEC-SAL-003',
    marcheSalaireId: 'MS-001',
    numero: 3,
    date: '2026-08-25',
    montantRecu: 120000,
    referenceVirement: 'VIR-ENC-SAL-07',
    observation: 'Acompte 3ème trimestre - Personnel de soutien',
    createdAt: '2026-08-25T14:30:00Z',
  },
  {
    id: 'DEC-SAL-004',
    marcheSalaireId: 'MS-002',
    numero: 1,
    date: '2026-03-10',
    montantRecu: 110000,
    referenceVirement: 'VIR-ENC-SAL-02',
    observation: 'Premier versement - Agents de laboratoire',
    createdAt: '2026-03-10T09:45:00Z',
  },
  {
    id: 'DEC-SAL-005',
    marcheSalaireId: 'MS-002',
    numero: 2,
    date: '2026-06-18',
    montantRecu: 110000,
    referenceVirement: 'VIR-ENC-SAL-05',
    observation: 'Deuxième versement - Agents de laboratoire',
    createdAt: '2026-06-18T10:15:00Z',
  },
  {
    id: 'DEC-SAL-006',
    marcheSalaireId: 'MS-003',
    numero: 1,
    date: '2026-04-12',
    montantRecu: 95000,
    referenceVirement: 'VIR-ENC-SAL-03',
    observation: 'Acompte initial - Support administratif',
    createdAt: '2026-04-12T15:00:00Z',
  },
  {
    id: 'DEC-SAL-007',
    marcheSalaireId: 'MS-003',
    numero: 2,
    date: '2026-07-22',
    montantRecu: 95000,
    referenceVirement: 'VIR-ENC-SAL-06',
    observation: 'Acompte semestriel - Support administratif',
    createdAt: '2026-07-22T11:20:00Z',
  },
];

export const SEED_PAIEMENTS_SALAIRES: PaiementSalarie[] = [
  // Paiements pour MS-001 (Youssef Bennani & Fatima Zahra El Amrani)
  {
    id: 'PAY-SAL-001',
    salarieId: 'SAL-001',
    marcheSalaireId: 'MS-001',
    periode: 'Septembre 2026',
    montant: 6500,
    date: '2026-09-28',
    mode: 'Virement',
    reference: 'VIR-SAL-2026-091',
    observation: 'Salaire mensuel net - Septembre 2026',
    createdAt: '2026-09-28T16:00:00Z',
  },
  {
    id: 'PAY-SAL-002',
    salarieId: 'SAL-002',
    marcheSalaireId: 'MS-001',
    periode: 'Septembre 2026',
    montant: 7000,
    date: '2026-09-28',
    mode: 'Virement',
    reference: 'VIR-SAL-2026-092',
    observation: 'Salaire mensuel net - Septembre 2026',
    createdAt: '2026-09-28T16:15:00Z',
  },
  {
    id: 'PAY-SAL-003',
    salarieId: 'SAL-001',
    marcheSalaireId: 'MS-001',
    periode: 'Août 2026',
    montant: 6500,
    date: '2026-08-29',
    mode: 'Virement',
    reference: 'VIR-SAL-2026-081',
    observation: 'Salaire mensuel net - Août 2026',
    createdAt: '2026-08-29T15:30:00Z',
  },
  {
    id: 'PAY-SAL-004',
    salarieId: 'SAL-002',
    marcheSalaireId: 'MS-001',
    periode: 'Août 2026',
    montant: 7000,
    date: '2026-08-29',
    mode: 'Virement',
    reference: 'VIR-SAL-2026-082',
    observation: 'Salaire mensuel net - Août 2026',
    createdAt: '2026-08-29T15:45:00Z',
  },

  // Paiements pour MS-002 (Houda Tazi & Anas Zouhri)
  {
    id: 'PAY-SAL-005',
    salarieId: 'SAL-004',
    marcheSalaireId: 'MS-002',
    periode: 'Septembre 2026',
    montant: 8500,
    date: '2026-09-27',
    mode: 'Virement',
    reference: 'VIR-SAL-2026-093',
    observation: 'Traitement mensuel plateforme d\'excellence',
    createdAt: '2026-09-27T14:00:00Z',
  },
  {
    id: 'PAY-SAL-006',
    salarieId: 'SAL-005',
    marcheSalaireId: 'MS-002',
    periode: 'Septembre 2026',
    montant: 5800,
    date: '2026-09-27',
    mode: 'Chèque',
    reference: 'CHQ-BP-884120',
    observation: 'Règlement mensuel par chèque barré',
    createdAt: '2026-09-27T14:30:00Z',
  },
  {
    id: 'PAY-SAL-007',
    salarieId: 'SAL-004',
    marcheSalaireId: 'MS-002',
    periode: 'Août 2026',
    montant: 8500,
    date: '2026-08-28',
    mode: 'Virement',
    reference: 'VIR-SAL-2026-083',
    observation: 'Traitement mensuel août',
    createdAt: '2026-08-28T12:00:00Z',
  },

  // Paiements pour MS-003 (Mehdi Chraibi & Sanaa Lahlou)
  {
    id: 'PAY-SAL-008',
    salarieId: 'SAL-003',
    marcheSalaireId: 'MS-003',
    periode: 'Septembre 2026',
    montant: 6200,
    date: '2026-09-29',
    mode: 'Virement',
    reference: 'VIR-SAL-2026-094',
    observation: 'Salaire mensuel gestion administrative',
    createdAt: '2026-09-29T10:00:00Z',
  },
  {
    id: 'PAY-SAL-009',
    salarieId: 'SAL-006',
    marcheSalaireId: 'MS-003',
    periode: 'Septembre 2026',
    montant: 5500,
    date: '2026-09-29',
    mode: 'Espèces',
    reference: 'RECU-CAISSE-2026-09',
    observation: 'Règlement en espèces contre reçu d\'émargement',
    createdAt: '2026-09-29T10:30:00Z',
  },
  {
    id: 'PAY-SAL-010',
    salarieId: 'SAL-003',
    marcheSalaireId: 'MS-003',
    periode: 'Août 2026',
    montant: 6200,
    date: '2026-08-30',
    mode: 'Virement',
    reference: 'VIR-SAL-2026-084',
    observation: 'Salaire mensuel août',
    createdAt: '2026-08-30T11:00:00Z',
  },
];

// ==================== SEED POINTAGES & PRÉSENCE DES SALARIÉS ====================

export const SEED_POINTAGES: Pointage[] = [
  // --- Date du jour (2026-09-27) ---
  {
    id: 'PTG-20260927-01',
    salarie_id: 'SAL-001',
    date: '2026-09-27',
    statut: 'PRESENT',
    createdAt: '2026-09-27T08:00:00Z',
  },
  {
    id: 'PTG-20260927-02',
    salarie_id: 'SAL-002',
    date: '2026-09-27',
    statut: 'PRESENT',
    createdAt: '2026-09-27T08:05:00Z',
  },
  {
    id: 'PTG-20260927-03',
    salarie_id: 'SAL-003',
    date: '2026-09-27',
    statut: 'ABSENCE_AUTORISEE',
    motif: 'Mission administrative auprès de la DAF',
    createdAt: '2026-09-27T08:10:00Z',
  },
  {
    id: 'PTG-20260927-04',
    salarie_id: 'SAL-004',
    date: '2026-09-27',
    statut: 'PRESENT',
    createdAt: '2026-09-27T08:15:00Z',
  },
  {
    id: 'PTG-20260927-05',
    salarie_id: 'SAL-005',
    date: '2026-09-27',
    statut: 'CONGE',
    motif: 'Congé annuel réglementaire',
    createdAt: '2026-09-27T08:20:00Z',
  },
  {
    id: 'PTG-20260927-06',
    salarie_id: 'SAL-006',
    date: '2026-09-27',
    statut: 'PRESENT',
    createdAt: '2026-09-27T08:25:00Z',
  },

  // --- 2026-09-26 ---
  {
    id: 'PTG-20260926-01',
    salarie_id: 'SAL-001',
    date: '2026-09-26',
    statut: 'PRESENT',
    createdAt: '2026-09-26T08:00:00Z',
  },
  {
    id: 'PTG-20260926-02',
    salarie_id: 'SAL-002',
    date: '2026-09-26',
    statut: 'PRESENT',
    createdAt: '2026-09-26T08:05:00Z',
  },
  {
    id: 'PTG-20260926-03',
    salarie_id: 'SAL-003',
    date: '2026-09-26',
    statut: 'PRESENT',
    createdAt: '2026-09-26T08:10:00Z',
  },
  {
    id: 'PTG-20260926-04',
    salarie_id: 'SAL-004',
    date: '2026-09-26',
    statut: 'PRESENT',
    createdAt: '2026-09-26T08:15:00Z',
  },
  {
    id: 'PTG-20260926-05',
    salarie_id: 'SAL-005',
    date: '2026-09-26',
    statut: 'CONGE',
    motif: 'Congé annuel réglementaire',
    createdAt: '2026-09-26T08:20:00Z',
  },
  {
    id: 'PTG-20260926-06',
    salarie_id: 'SAL-006',
    date: '2026-09-26',
    statut: 'PRESENT',
    createdAt: '2026-09-26T08:25:00Z',
  },

  // --- 2026-09-25 ---
  {
    id: 'PTG-20260925-01',
    salarie_id: 'SAL-001',
    date: '2026-09-25',
    statut: 'PRESENT',
    createdAt: '2026-09-25T08:00:00Z',
  },
  {
    id: 'PTG-20260925-02',
    salarie_id: 'SAL-002',
    date: '2026-09-25',
    statut: 'ABSENCE_AUTORISEE',
    motif: 'Participation atelier pédagogique régional',
    createdAt: '2026-09-25T08:05:00Z',
  },
  {
    id: 'PTG-20260925-03',
    salarie_id: 'SAL-003',
    date: '2026-09-25',
    statut: 'PRESENT',
    createdAt: '2026-09-25T08:10:00Z',
  },
  {
    id: 'PTG-20260925-04',
    salarie_id: 'SAL-004',
    date: '2026-09-25',
    statut: 'PRESENT',
    createdAt: '2026-09-25T08:15:00Z',
  },
  {
    id: 'PTG-20260925-05',
    salarie_id: 'SAL-005',
    date: '2026-09-25',
    statut: 'PRESENT',
    createdAt: '2026-09-25T08:20:00Z',
  },
  {
    id: 'PTG-20260925-06',
    salarie_id: 'SAL-006',
    date: '2026-09-25',
    statut: 'PRESENT',
    createdAt: '2026-09-25T08:25:00Z',
  },

  // --- 2026-09-24 ---
  {
    id: 'PTG-20260924-01',
    salarie_id: 'SAL-001',
    date: '2026-09-24',
    statut: 'PRESENT',
    createdAt: '2026-09-24T08:00:00Z',
  },
  {
    id: 'PTG-20260924-02',
    salarie_id: 'SAL-002',
    date: '2026-09-24',
    statut: 'PRESENT',
    createdAt: '2026-09-24T08:05:00Z',
  },
  {
    id: 'PTG-20260924-03',
    salarie_id: 'SAL-003',
    date: '2026-09-24',
    statut: 'PRESENT',
    createdAt: '2026-09-24T08:10:00Z',
  },
  {
    id: 'PTG-20260924-04',
    salarie_id: 'SAL-004',
    date: '2026-09-24',
    statut: 'ABSENCE_NON_AUTORISEE',
    motif: 'Absence non justifiée',
    createdAt: '2026-09-24T08:15:00Z',
  },
  {
    id: 'PTG-20260924-05',
    salarie_id: 'SAL-005',
    date: '2026-09-24',
    statut: 'PRESENT',
    createdAt: '2026-09-24T08:20:00Z',
  },
  {
    id: 'PTG-20260924-06',
    salarie_id: 'SAL-006',
    date: '2026-09-24',
    statut: 'PRESENT',
    createdAt: '2026-09-24T08:25:00Z',
  },

  // --- 2026-09-23 ---
  {
    id: 'PTG-20260923-01',
    salarie_id: 'SAL-001',
    date: '2026-09-23',
    statut: 'PRESENT',
    createdAt: '2026-09-23T08:00:00Z',
  },
  {
    id: 'PTG-20260923-02',
    salarie_id: 'SAL-002',
    date: '2026-09-23',
    statut: 'PRESENT',
    createdAt: '2026-09-23T08:05:00Z',
  },
  {
    id: 'PTG-20260923-03',
    salarie_id: 'SAL-003',
    date: '2026-09-23',
    statut: 'PRESENT',
    createdAt: '2026-09-23T08:10:00Z',
  },
  {
    id: 'PTG-20260923-04',
    salarie_id: 'SAL-004',
    date: '2026-09-23',
    statut: 'PRESENT',
    createdAt: '2026-09-23T08:15:00Z',
  },
  {
    id: 'PTG-20260923-05',
    salarie_id: 'SAL-005',
    date: '2026-09-23',
    statut: 'PRESENT',
    createdAt: '2026-09-23T08:20:00Z',
  },
  {
    id: 'PTG-20260923-06',
    salarie_id: 'SAL-006',
    date: '2026-09-23',
    statut: 'PRESENT',
    createdAt: '2026-09-23T08:25:00Z',
  },

  // --- 2026-09-22 ---
  {
    id: 'PTG-20260922-01',
    salarie_id: 'SAL-001',
    date: '2026-09-22',
    statut: 'PRESENT',
    createdAt: '2026-09-22T08:00:00Z',
  },
  {
    id: 'PTG-20260922-02',
    salarie_id: 'SAL-002',
    date: '2026-09-22',
    statut: 'PRESENT',
    createdAt: '2026-09-22T08:05:00Z',
  },
  {
    id: 'PTG-20260922-03',
    salarie_id: 'SAL-003',
    date: '2026-09-22',
    statut: 'PRESENT',
    createdAt: '2026-09-22T08:10:00Z',
  },
  {
    id: 'PTG-20260922-04',
    salarie_id: 'SAL-004',
    date: '2026-09-22',
    statut: 'PRESENT',
    createdAt: '2026-09-22T08:15:00Z',
  },
  {
    id: 'PTG-20260922-05',
    salarie_id: 'SAL-005',
    date: '2026-09-22',
    statut: 'PRESENT',
    createdAt: '2026-09-22T08:20:00Z',
  },
  {
    id: 'PTG-20260922-06',
    salarie_id: 'SAL-006',
    date: '2026-09-22',
    statut: 'ABSENCE_AUTORISEE',
    motif: 'Rendez-vous médical avec certificat',
    createdAt: '2026-09-22T08:25:00Z',
  },
];

