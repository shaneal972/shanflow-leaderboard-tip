import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const destFolders = [
  path.resolve('c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/03 - Paliers Pédagogiques/201026'),
  path.resolve('c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/01 - Entreprise Fictive KLF')
];

// 25 machines réalistes KLF
const rawCleanData = [
  { id: 'MAT-001', machine: 'PC-DIR-01', user: 'Edouard LOMBARD', os: 'Windows 11 Pro', service: 'Direction', site: 'Jarry', type: 'PC Fixe Tour', modele: 'Dell OptiPlex 7090', dateAchat: '2024-01-15', dateDisplay: '15/01/2024', garantie: 36, obs: 'Poste Direction Générale - RAS' },
  { id: 'MAT-002', machine: 'PC-DIR-02', user: 'Marc VERDIER', os: 'Windows 11 Pro', service: 'DSI', site: 'Jarry', type: 'PC Portable', modele: 'Lenovo ThinkPad P16', dateAchat: '2024-02-15', dateDisplay: '15/02/2024', garantie: 36, obs: 'Poste DSI double écran' },
  { id: 'MAT-003', machine: 'PC-FACT-01', user: 'Corinne MONROSE', os: 'Windows 10 Pro', service: 'Facturation', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 400', dateAchat: '2021-06-10', dateDisplay: '10/06/2021', garantie: 36, obs: 'Lenteur sur gros classeurs fret (Palier 2)' },
  { id: 'MAT-004', machine: 'PC-FACT-02', user: 'Lydie BASTIEN', os: 'Windows 10 Pro', service: 'Facturation', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 400', dateAchat: '2021-06-10', dateDisplay: '10/06/2021', garantie: 36, obs: 'Clavier et pavé numérique défaillants' },
  { id: 'MAT-005', machine: 'PC-FACT-03', user: 'Jean-Marc SAINT-VAL', os: 'Windows 11 Pro', service: 'Facturation', site: 'Jarry', type: 'PC Fixe', modele: 'Dell OptiPlex 3080', dateAchat: '2023-09-01', dateDisplay: '01/09/2023', garantie: 36, obs: 'Double écran installé' },
  { id: 'MAT-006', machine: 'PC-RH-01', user: 'Elodie THEOPHILE', os: 'Windows 11 Pro', service: 'Ressources Humaines', site: 'Jarry', type: 'PC Portable', modele: 'Dell Latitude 5430', dateAchat: '2023-11-20', dateDisplay: '20/11/2023', garantie: 36, obs: 'Campagne publipostage convocations' },
  { id: 'MAT-007', machine: 'PC-RH-02', user: 'Stagiaire RH', os: 'Windows 10 Pro', service: 'Ressources Humaines', site: 'Jarry', type: 'PC Portable', modele: 'Lenovo ThinkPad L14', dateAchat: '2020-09-15', dateDisplay: '15/09/2020', garantie: 24, obs: 'Batterie HS, fonctionne sur secteur' },
  { id: 'MAT-008', machine: 'PC-LOG-01', user: 'Sebastien LEBLANC', os: 'Windows 11 Pro', service: 'Logistique', site: 'Jarry', type: 'PC Durci', modele: 'Panasonic Toughbook 55', dateAchat: '2024-03-10', dateDisplay: '10/03/2024', garantie: 36, obs: 'Poste chef de quai Jarry' },
  { id: 'MAT-009', machine: 'PC-LOG-02', user: 'Cariste Equipe A', os: 'Windows 10 Pro', service: 'Logistique', site: 'Jarry', type: 'Tablette Durcie', modele: 'Zebra ET51', dateAchat: '2022-04-18', dateDisplay: '18/04/2022', garantie: 24, obs: 'Écran tactile rayé' },
  { id: 'MAT-010', machine: 'PC-LOG-03', user: 'Cariste Equipe B', os: 'Windows 10 Pro', service: 'Logistique', site: 'Jarry', type: 'Tablette Durcie', modele: 'Zebra ET51', dateAchat: '2022-04-18', dateDisplay: '18/04/2022', garantie: 24, obs: 'Problème synchronisation ERP' },
  { id: 'MAT-011', machine: 'IMP-JARRY-01', user: 'Multi-services Accueil', os: 'Autre', service: 'Accueil', site: 'Jarry', type: 'Copieur Réseau', modele: 'Canon imageRUNNER 2630', dateAchat: '2022-08-01', dateDisplay: '01/08/2022', garantie: 48, obs: 'IP fixe 192.168.10.250' },
  { id: 'MAT-012', machine: 'IMP-FACT-01', user: 'Service Facturation', os: 'Autre', service: 'Facturation', site: 'Jarry', type: 'Imprimante N&B', modele: 'Brother HL-L6400DW', dateAchat: '2021-03-12', dateDisplay: '12/03/2021', garantie: 36, obs: 'Bac papier n°2 bloqué' },
  { id: 'MAT-013', machine: 'PC-FDF-01', user: 'Patrick NARCISSE', os: 'Windows 11 Pro', service: 'Direction', site: 'Fort-de-France', type: 'PC Portable', modele: 'HP EliteBook 840', dateAchat: '2023-05-14', dateDisplay: '14/05/2023', garantie: 36, obs: 'Responsable antenne Martinique' },
  { id: 'MAT-014', machine: 'PC-FDF-02', user: 'Mireille ROSEAU', os: 'Windows 11 Pro', service: 'Facturation', site: 'Fort-de-France', type: 'PC Fixe', modele: 'Dell OptiPlex 3090', dateAchat: '2023-05-14', dateDisplay: '14/05/2023', garantie: 36, obs: 'Guichet douane Fort-de-France' },
  { id: 'MAT-015', machine: 'IMP-FDF-01', user: 'Multi-services FDF', os: 'Autre', service: 'Accueil', site: 'Fort-de-France', type: 'Copieur Réseau', modele: 'Canon imageRUNNER 2625', dateAchat: '2023-05-14', dateDisplay: '14/05/2023', garantie: 48, obs: 'IP fixe 192.168.20.250' },
  { id: 'MAT-016', machine: 'PC-SXM-01', user: 'Dave HODGE', os: 'Windows 10 Pro', service: 'Logistique', site: 'Saint-Martin', type: 'PC Portable', modele: 'Lenovo ThinkPad E15', dateAchat: '2021-10-05', dateDisplay: '05/10/2021', garantie: 36, obs: 'Poste Marigot liaison instable' },
  { id: 'MAT-017', machine: 'PC-COM-01', user: 'Thomas BASTIEN', os: 'Windows 11 Pro', service: 'Commercial', site: 'Jarry', type: 'PC Portable', modele: 'Dell Latitude 7420', dateAchat: '2023-02-10', dateDisplay: '10/02/2023', garantie: 36, obs: 'Commercial itinérant Guadeloupe' },
  { id: 'MAT-018', machine: 'PC-COM-02', user: 'Sabrina EUGENE', os: 'Windows 11 Pro', service: 'Commercial', site: 'Jarry', type: 'PC Portable', modele: 'Dell Latitude 7420', dateAchat: '2023-02-10', dateDisplay: '10/02/2023', garantie: 36, obs: 'Devis grands comptes' },
  { id: 'MAT-019', machine: 'PC-QUAL-01', user: 'Yannick CLAVIER', os: 'Windows 11 Pro', service: 'Qualité & Sécurité', site: 'Jarry', type: 'PC Fixe', modele: 'Dell OptiPlex 5000', dateAchat: '2024-02-01', dateDisplay: '01/02/2024', garantie: 36, obs: 'Audits QSE et normes maritimes' },
  { id: 'MAT-020', machine: 'PC-STAG-01', user: 'Poste Polyvalent', os: 'Windows 10 Pro', service: 'Support IT', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 600', dateAchat: '2019-11-12', dateDisplay: '12/11/2019', garantie: 24, obs: 'Poste atelier TIP à réinstaller' },
  { id: 'MAT-021', machine: 'PC-ACC-01', user: 'Vanessa CIRILLE', os: 'Windows 11 Pro', service: 'Accueil', site: 'Jarry', type: 'PC Fixe', modele: 'Dell OptiPlex 3080', dateAchat: '2022-09-15', dateDisplay: '15/09/2022', garantie: 36, obs: 'Standard téléphonique IP' },
  { id: 'MAT-022', machine: 'PC-LOG-04', user: 'Alain GOURGUE', os: 'Windows 10 Pro', service: 'Logistique', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 400', dateAchat: '2020-03-20', dateDisplay: '20/03/2020', garantie: 36, obs: 'Gestionnaire arrivage conteneurs' },
  { id: 'MAT-023', machine: 'PC-FACT-04', user: 'Cedric VAITILINGON', os: 'Windows 10 Pro', service: 'Facturation', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 400', dateAchat: '2020-04-15', dateDisplay: '15/04/2020', garantie: 36, obs: 'Rapprochement bancaire' },
  { id: 'MAT-024', machine: 'PC-DIR-03', user: 'Assistante Direction', os: 'Windows 11 Pro', service: 'Direction', site: 'Jarry', type: 'PC Portable', modele: 'Dell Latitude 5420', dateAchat: '2022-10-01', dateDisplay: '01/10/2022', garantie: 36, obs: 'Secrétariat général' },
  { id: 'MAT-025', machine: 'PC-MAINT-01', user: 'Technicien Astreinte', os: 'Windows 10 Pro', service: 'DSI', site: 'Jarry', type: 'PC Portable', modele: 'Lenovo ThinkPad L14', dateAchat: '2021-01-10', dateDisplay: '10/01/2021', garantie: 36, obs: 'Astreinte week-end et nuit' },
];

function buildStudentCleanWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Onglet 1 : Inventaire propre (avec colonne H = Age_Poste_Annees prête à être calculée)
  // Alignement strict avec les consignes TP :
  // Col D = OS -> NB.SI(Inventaire!D2:D50; "Windows 10 Pro")
  // Col G = Date_Mise_En_Service
  // Col H = Age_Poste_Annees -> NB.SI(Inventaire!H2:H50; ">=5")
  const header = [
    'ID_Materiel',
    'Nom_Machine',
    'Utilisateur',
    'OS',
    'Service',
    'Site',
    'Date_Mise_En_Service',
    'Age_Poste_Annees',
    'Type_Materiel',
    'Garantie_Mois',
    'Statut_Garantie',
    'Observations_Helpdesk'
  ];

  const rows = rawCleanData.map(d => [
    d.id,
    d.machine,
    d.user,
    d.os,
    d.service,
    d.site,
    d.dateDisplay,
    '', // Age_Poste_Annees à calculer par l'élève à l'étape 3
    d.type,
    d.garantie,
    '', // Statut_Garantie
    d.obs
  ]);

  const wsInventaire = XLSX.utils.aoa_to_sheet([header, ...rows]);
  wsInventaire['!cols'] = [
    { wch: 12 }, // ID_Materiel (A)
    { wch: 14 }, // Nom_Machine (B)
    { wch: 22 }, // Utilisateur (C)
    { wch: 16 }, // OS (D)
    { wch: 20 }, // Service (E)
    { wch: 15 }, // Site (F)
    { wch: 20 }, // Date_Mise_En_Service (G)
    { wch: 18 }, // Age_Poste_Annees (H)
    { wch: 16 }, // Type_Materiel (I)
    { wch: 14 }, // Garantie_Mois (J)
    { wch: 16 }, // Statut_Garantie (K)
    { wch: 38 }, // Observations_Helpdesk (L)
  ];

  // Onglet 2 : TDB_Direction_DSI (Trame pré-formatée avec les tableaux prêts à recevoir les formules)
  const tdbAoa = [
    ['TABLEAU DE BORD DSI - PILOTAGE ET OBSOLESCENCE DU PARC KLF', '', ''],
    ['Session TIP2 - Direction des Systèmes d\'Information Jarry', '', ''],
    ['', '', ''],
    ['1. RÉPARTITION DU PARC PAR SYSTÈME D\'EXPLOITATION (OS)', '', ''],
    ['Système d\'exploitation (OS)', 'Nombre de postes', 'Formule attendue'],
    ['Windows 10 Pro', '', '=NB.SI(Inventaire!D2:D26; "Windows 10 Pro")'],
    ['Windows 11 Pro', '', '=NB.SI(Inventaire!D2:D26; "Windows 11 Pro")'],
    ['Autre (Copieurs / Imprimantes)', '', '=NB.SI(Inventaire!D2:D26; "Autre")'],
    ['TOTAL GÉNÉRAL DU PARC', '', '=SOMME(B6:B8)'],
    ['', '', ''],
    ['2. INDICATEURS D\'OBSOLESCENCE ET DE RENOUVELLEMENT', '', ''],
    ['Indicateur DSI', 'Valeur', 'Formule attendue'],
    ['Nombre de postes vétustes (>= 5 ans)', '', '=NB.SI(Inventaire!H2:H26; ">=5")'],
    ['Taux d\'obsolescence du parc (%)', '', '=B13/B9'],
    ['Seuil d\'alerte DSI KLF', '20.0%', 'Seuil critique de renouvellement'],
    ['Statut budgétaire 2027', '', '=SI(B14>B15; "BUDGET RENOUVELLEMENT REQUIS"; "CONFORME")'],
  ];

  const wsTdb = XLSX.utils.aoa_to_sheet(tdbAoa);
  wsTdb['!cols'] = [
    { wch: 36 },
    { wch: 18 },
    { wch: 45 }
  ];

  XLSX.utils.book_append_sheet(wb, wsInventaire, 'Inventaire');
  XLSX.utils.book_append_sheet(wb, wsTdb, 'TDB_Direction_DSI');

  return wb;
}

function buildTeacherCorrigéWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const header = [
    'ID_Materiel',
    'Nom_Machine',
    'Utilisateur',
    'OS',
    'Service',
    'Site',
    'Date_Mise_En_Service',
    'Age_Poste_Annees',
    'Type_Materiel',
    'Garantie_Mois',
    'Statut_Obsolescence',
    'Observations_Helpdesk'
  ];

  // Année de référence = 2026
  const rows = rawCleanData.map((d, idx) => {
    const anneeAchat = parseInt(d.dateAchat.split('-')[0], 10);
    const age = 2026 - anneeAchat;
    const statut = age >= 5 ? 'A RENOUVELER (>= 5 ans)' : 'CONFORME (< 5 ans)';
    return [
      d.id,
      d.machine,
      d.user,
      d.os,
      d.service,
      d.site,
      d.dateDisplay,
      age, // Dans Excel : =ANNEE(AUJOURDHUI())-ANNEE(G2)
      d.type,
      d.garantie,
      statut,
      d.obs
    ];
  });

  const wsInventaire = XLSX.utils.aoa_to_sheet([header, ...rows]);
  wsInventaire['!cols'] = [
    { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 20 },
    { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 14 },
    { wch: 24 }, { wch: 38 }
  ];

  const tdbAoa = [
    ['TABLEAU DE BORD DSI - PILOTAGE ET OBSOLESCENCE DU PARC KLF (CORRIGÉ FORMATEUR)', '', ''],
    ['Session TIP2 - Direction des Systèmes d\'Information Jarry', '', ''],
    ['', '', ''],
    ['1. RÉPARTITION DU PARC PAR SYSTÈME D\'EXPLOITATION (OS)', '', ''],
    ['Système d\'exploitation (OS)', 'Nombre de postes', 'Formule exacte'],
    ['Windows 10 Pro', 10, '=NB.SI(Inventaire!D2:D26; "Windows 10 Pro")'],
    ['Windows 11 Pro', 12, '=NB.SI(Inventaire!D2:D26; "Windows 11 Pro")'],
    ['Autre (Copieurs / Imprimantes)', 3, '=NB.SI(Inventaire!D2:D26; "Autre")'],
    ['TOTAL GÉNÉRAL DU PARC', 25, '=SOMME(B6:B8)'],
    ['', '', ''],
    ['2. INDICATEURS D\'OBSOLESCENCE ET DE RENOUVELLEMENT', '', ''],
    ['Indicateur DSI', 'Valeur', 'Formule exacte'],
    ['Nombre de postes vétustes (>= 5 ans)', 9, '=NB.SI(Inventaire!H2:H26; ">=5")'],
    ['Taux d\'obsolescence du parc (%)', '36.0%', '=B13/B9'],
    ['Seuil d\'alerte DSI KLF', '20.0%', 'Seuil critique de renouvellement'],
    ['Statut budgétaire 2027', 'BUDGET RENOUVELLEMENT REQUIS', '=SI(B14>B15; "BUDGET RENOUVELLEMENT REQUIS"; "CONFORME")'],
  ];

  const wsTdb = XLSX.utils.aoa_to_sheet(tdbAoa);
  wsTdb['!cols'] = [
    { wch: 38 },
    { wch: 28 },
    { wch: 45 }
  ];

  XLSX.utils.book_append_sheet(wb, wsInventaire, 'Inventaire');
  XLSX.utils.book_append_sheet(wb, wsTdb, 'TDB_Direction_DSI');

  return wb;
}

function run() {
  console.log('🚀 Génération des classeurs Excel pour la séance du 20/10/2026...');

  const cleanWb = buildStudentCleanWorkbook();
  const corrigeWb = buildTeacherCorrigéWorkbook();

  for (const dir of destFolders) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const cleanPath = path.join(dir, 'KLF_Inventaire_Parc_Jarry_Nettoye.xlsx');
    const studentReadyPath = path.join(dir, 'KLF_Inventaire_Parc_Jarry_Brut.xlsx');
    const corrigePath = path.join(dir, 'KLF_Inventaire_Parc_Jarry_CORRIGE_DSI.xlsx');

    XLSX.writeFile(cleanWb, cleanPath);
    XLSX.writeFile(cleanWb, studentReadyPath); // Également sous le nom attendu par les consignes TP
    XLSX.writeFile(corrigeWb, corrigePath);

    console.log(`✅ Classeurs créés dans : ${dir}`);
    console.log(`   📁 ${cleanPath}`);
    console.log(`   📁 ${studentReadyPath}`);
    console.log(`   📁 ${corrigePath}`);
  }

  console.log('\n🎉 Tous les fichiers Excel sont prêts et synchronisés !');
}

run();
