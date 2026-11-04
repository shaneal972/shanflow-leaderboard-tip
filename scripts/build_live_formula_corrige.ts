import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const rawCleanData = [
  { id: 'MAT-001', machine: 'PC-DIR-01', user: 'Edouard LOMBARD', os: 'Windows 11 Pro', service: 'Direction', site: 'Jarry', type: 'PC Fixe Tour', modele: 'Dell OptiPlex 7090', dateAchat: '2024-01-15', y: 2024, m: 1, d: 15, garantie: 36, obs: 'Poste Direction Générale - RAS' },
  { id: 'MAT-002', machine: 'PC-DIR-02', user: 'Marc VERDIER', os: 'Windows 11 Pro', service: 'DSI', site: 'Jarry', type: 'PC Portable', modele: 'Lenovo ThinkPad P16', dateAchat: '2024-02-15', y: 2024, m: 2, d: 15, garantie: 36, obs: 'Poste DSI double écran' },
  { id: 'MAT-003', machine: 'PC-FACT-01', user: 'Corinne MONROSE', os: 'Windows 10 Pro', service: 'Facturation', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 400', dateAchat: '2021-06-10', y: 2021, m: 6, d: 10, garantie: 36, obs: 'Lenteur sur gros classeurs fret (Palier 2)' },
  { id: 'MAT-004', machine: 'PC-FACT-02', user: 'Lydie BASTIEN', os: 'Windows 10 Pro', service: 'Facturation', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 400', dateAchat: '2021-06-10', y: 2021, m: 6, d: 10, garantie: 36, obs: 'Clavier et pavé numérique défaillants' },
  { id: 'MAT-005', machine: 'PC-FACT-03', user: 'Jean-Marc SAINT-VAL', os: 'Windows 11 Pro', service: 'Facturation', site: 'Jarry', type: 'PC Fixe', modele: 'Dell OptiPlex 3080', dateAchat: '2023-09-01', y: 2023, m: 9, d: 1, garantie: 36, obs: 'Double écran installé' },
  { id: 'MAT-006', machine: 'PC-RH-01', user: 'Elodie THEOPHILE', os: 'Windows 11 Pro', service: 'Ressources Humaines', site: 'Jarry', type: 'PC Portable', modele: 'Dell Latitude 5430', dateAchat: '2023-11-20', y: 2023, m: 11, d: 20, garantie: 36, obs: 'Campagne publipostage convocations' },
  { id: 'MAT-007', machine: 'PC-RH-02', user: 'Stagiaire RH', os: 'Windows 10 Pro', service: 'Ressources Humaines', site: 'Jarry', type: 'PC Portable', modele: 'Lenovo ThinkPad L14', dateAchat: '2020-09-15', y: 2020, m: 9, d: 15, garantie: 24, obs: 'Batterie HS, fonctionne sur secteur' },
  { id: 'MAT-008', machine: 'PC-LOG-01', user: 'Sebastien LEBLANC', os: 'Windows 11 Pro', service: 'Logistique', site: 'Jarry', type: 'PC Durci', modele: 'Panasonic Toughbook 55', dateAchat: '2024-03-10', y: 2024, m: 3, d: 10, garantie: 36, obs: 'Poste chef de quai Jarry' },
  { id: 'MAT-009', machine: 'PC-LOG-02', user: 'Cariste Equipe A', os: 'Windows 10 Pro', service: 'Logistique', site: 'Jarry', type: 'Tablette Durcie', modele: 'Zebra ET51', dateAchat: '2022-04-18', y: 2022, m: 4, d: 18, garantie: 24, obs: 'Écran tactile rayé' },
  { id: 'MAT-010', machine: 'PC-LOG-03', user: 'Cariste Equipe B', os: 'Windows 10 Pro', service: 'Logistique', site: 'Jarry', type: 'Tablette Durcie', modele: 'Zebra ET51', dateAchat: '2022-04-18', y: 2022, m: 4, d: 18, garantie: 24, obs: 'Problème synchronisation ERP' },
  { id: 'MAT-011', machine: 'IMP-JARRY-01', user: 'Multi-services Accueil', os: 'Autre', service: 'Accueil', site: 'Jarry', type: 'Copieur Réseau', modele: 'Canon imageRUNNER 2630', dateAchat: '2022-08-01', y: 2022, m: 8, d: 1, garantie: 48, obs: 'IP fixe 192.168.10.250' },
  { id: 'MAT-012', machine: 'IMP-FACT-01', user: 'Service Facturation', os: 'Autre', service: 'Facturation', site: 'Jarry', type: 'Imprimante N&B', modele: 'Brother HL-L6400DW', dateAchat: '2021-03-12', y: 2021, m: 3, d: 12, garantie: 36, obs: 'Bac papier n°2 bloqué' },
  { id: 'MAT-013', machine: 'PC-FDF-01', user: 'Patrick NARCISSE', os: 'Windows 11 Pro', service: 'Direction', site: 'Fort-de-France', type: 'PC Portable', modele: 'HP EliteBook 840', dateAchat: '2023-05-14', y: 2023, m: 5, d: 14, garantie: 36, obs: 'Responsable antenne Martinique' },
  { id: 'MAT-014', machine: 'PC-FDF-02', user: 'Mireille ROSEAU', os: 'Windows 11 Pro', service: 'Facturation', site: 'Fort-de-France', type: 'PC Fixe', modele: 'Dell OptiPlex 3090', dateAchat: '2023-05-14', y: 2023, m: 5, d: 14, garantie: 36, obs: 'Guichet douane Fort-de-France' },
  { id: 'MAT-015', machine: 'IMP-FDF-01', user: 'Multi-services FDF', os: 'Autre', service: 'Accueil', site: 'Fort-de-France', type: 'Copieur Réseau', modele: 'Canon imageRUNNER 2625', dateAchat: '2023-05-14', y: 2023, m: 5, d: 14, garantie: 48, obs: 'IP fixe 192.168.20.250' },
  { id: 'MAT-016', machine: 'PC-SXM-01', user: 'Dave HODGE', os: 'Windows 10 Pro', service: 'Logistique', site: 'Saint-Martin', type: 'PC Portable', modele: 'Lenovo ThinkPad E15', dateAchat: '2021-10-05', y: 2021, m: 10, d: 5, garantie: 36, obs: 'Poste Marigot liaison instable' },
  { id: 'MAT-017', machine: 'PC-COM-01', user: 'Thomas BASTIEN', os: 'Windows 11 Pro', service: 'Commercial', site: 'Jarry', type: 'PC Portable', modele: 'Dell Latitude 7420', dateAchat: '2023-02-10', y: 2023, m: 2, d: 10, garantie: 36, obs: 'Commercial itinérant Guadeloupe' },
  { id: 'MAT-018', machine: 'PC-COM-02', user: 'Sabrina EUGENE', os: 'Windows 11 Pro', service: 'Commercial', site: 'Jarry', type: 'PC Portable', modele: 'Dell Latitude 7420', dateAchat: '2023-02-10', y: 2023, m: 2, d: 10, garantie: 36, obs: 'Devis grands comptes' },
  { id: 'MAT-019', machine: 'PC-QUAL-01', user: 'Yannick CLAVIER', os: 'Windows 11 Pro', service: 'Qualité & Sécurité', site: 'Jarry', type: 'PC Fixe', modele: 'Dell OptiPlex 5000', dateAchat: '2024-02-01', y: 2024, m: 2, d: 1, garantie: 36, obs: 'Audits QSE et normes maritimes' },
  { id: 'MAT-020', machine: 'PC-STAG-01', user: 'Poste Polyvalent', os: 'Windows 10 Pro', service: 'Support IT', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 600', dateAchat: '2019-11-12', y: 2019, m: 11, d: 12, garantie: 24, obs: 'Poste atelier TIP à réinstaller' },
  { id: 'MAT-021', machine: 'PC-ACC-01', user: 'Vanessa CIRILLE', os: 'Windows 11 Pro', service: 'Accueil', site: 'Jarry', type: 'PC Fixe', modele: 'Dell OptiPlex 3080', dateAchat: '2022-09-15', y: 2022, m: 9, d: 15, garantie: 36, obs: 'Standard téléphonique IP' },
  { id: 'MAT-022', machine: 'PC-LOG-04', user: 'Alain GOURGUE', os: 'Windows 10 Pro', service: 'Logistique', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 400', dateAchat: '2020-03-20', y: 2020, m: 3, d: 20, garantie: 36, obs: 'Gestionnaire arrivage conteneurs' },
  { id: 'MAT-023', machine: 'PC-FACT-04', user: 'Cedric VAITILINGON', os: 'Windows 10 Pro', service: 'Facturation', site: 'Jarry', type: 'PC Fixe', modele: 'HP ProDesk 400', dateAchat: '2020-04-15', y: 2020, m: 4, d: 15, garantie: 36, obs: 'Rapprochement bancaire' },
  { id: 'MAT-024', machine: 'PC-DIR-03', user: 'Assistante Direction', os: 'Windows 11 Pro', service: 'Direction', site: 'Jarry', type: 'PC Portable', modele: 'Dell Latitude 5420', dateAchat: '2022-10-01', y: 2022, m: 10, d: 1, garantie: 36, obs: 'Secrétariat général' },
  { id: 'MAT-025', machine: 'PC-MAINT-01', user: 'Technicien Astreinte', os: 'Windows 10 Pro', service: 'DSI', site: 'Jarry', type: 'PC Portable', modele: 'Lenovo ThinkPad L14', dateAchat: '2021-01-10', y: 2021, m: 1, d: 10, garantie: 36, obs: 'Astreinte week-end et nuit' },
];

function buildLiveFormulaCorrigéWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // --- 1. Onglet Inventaire ---
  const wsInventaire: XLSX.WorkSheet = {};
  const headers = [
    'ID_Materiel', 'Nom_Machine', 'Utilisateur', 'OS', 'Service', 'Site',
    'Date_Mise_En_Service', 'Age_Poste_Annees', 'Type_Materiel', 'Garantie_Mois',
    'Statut_Obsolescence', 'Observations_Helpdesk'
  ];

  headers.forEach((h, colIdx) => {
    const cellRef = XLSX.utils.encode_cell({ c: colIdx, r: 0 });
    wsInventaire[cellRef] = { t: 's', v: h };
  });

  rawCleanData.forEach((d, rowIdx) => {
    const r = rowIdx + 1; // 1-indexed row in Excel
    const age = 2026 - d.y;
    const statut = age >= 5 ? 'A RENOUVELER (>= 5 ans)' : 'CONFORME (< 5 ans)';

    wsInventaire[XLSX.utils.encode_cell({ c: 0, r })] = { t: 's', v: d.id };
    wsInventaire[XLSX.utils.encode_cell({ c: 1, r })] = { t: 's', v: d.machine };
    wsInventaire[XLSX.utils.encode_cell({ c: 2, r })] = { t: 's', v: d.user };
    wsInventaire[XLSX.utils.encode_cell({ c: 3, r })] = { t: 's', v: d.os };
    wsInventaire[XLSX.utils.encode_cell({ c: 4, r })] = { t: 's', v: d.service };
    wsInventaire[XLSX.utils.encode_cell({ c: 5, r })] = { t: 's', v: d.site };

    // Date_Mise_En_Service (Col G = index 6)
    // Enregistrée au format date réel avec affichage jj/mm/aaaa
    const dateVal = new Date(Date.UTC(d.y, d.m - 1, d.d));
    wsInventaire[XLSX.utils.encode_cell({ c: 6, r })] = { t: 'd', v: dateVal, z: 'dd/mm/yyyy' };

    // Age_Poste_Annees (Col H = index 7) : VRAIE FORMULE EXCEL
    const excelRow = r + 1; // row number in Excel formula
    wsInventaire[XLSX.utils.encode_cell({ c: 7, r })] = {
      t: 'n',
      f: `YEAR(TODAY())-YEAR(G${excelRow})`,
      v: age
    };

    // Type_Materiel (Col I = index 8)
    wsInventaire[XLSX.utils.encode_cell({ c: 8, r })] = { t: 's', v: d.type };

    // Garantie_Mois (Col J = index 9)
    wsInventaire[XLSX.utils.encode_cell({ c: 9, r })] = { t: 'n', v: d.garantie };

    // Statut_Obsolescence (Col K = index 10) : VRAIE FORMULE CONDITIONNELLE
    wsInventaire[XLSX.utils.encode_cell({ c: 10, r })] = {
      t: 's',
      f: `IF(H${excelRow}>=5,"A RENOUVELER (>= 5 ans)","CONFORME (< 5 ans)")`,
      v: statut
    };

    // Observations_Helpdesk (Col L = index 11)
    wsInventaire[XLSX.utils.encode_cell({ c: 11, r })] = { t: 's', v: d.obs };
  });

  wsInventaire['!ref'] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 11, r: 25 } });
  wsInventaire['!cols'] = [
    { wch: 12 }, { wch: 14 }, { wch: 22 }, { wch: 16 }, { wch: 20 },
    { wch: 15 }, { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 14 },
    { wch: 26 }, { wch: 38 }
  ];

  // --- 2. Onglet TDB_Direction_DSI ---
  const wsTdb: XLSX.WorkSheet = {};

  const tdbRows: any[][] = [
    ['TABLEAU DE BORD DSI - PILOTAGE ET OBSOLESCENCE DU PARC KLF (CORRIGÉ FORMATEUR)', '', ''], // Row 1 (index 0)
    ['Session TIP2 - Direction des Systèmes d\'Information Jarry', '', ''],                     // Row 2 (index 1)
    ['', '', ''],                                                                               // Row 3 (index 2)
    ['1. RÉPARTITION DU PARC PAR SYSTÈME D\'EXPLOITATION (OS)', '', ''],                        // Row 4 (index 3)
    ['Système d\'exploitation (OS)', 'Nombre de postes', 'Formule exacte exécutée'],             // Row 5 (index 4)
    ['Windows 10 Pro', null, null],                                                             // Row 6 (index 5)
    ['Windows 11 Pro', null, null],                                                             // Row 7 (index 6)
    ['Autre (Copieurs / Imprimantes)', null, null],                                             // Row 8 (index 7)
    ['TOTAL GÉNÉRAL DU PARC', null, null],                                                      // Row 9 (index 8)
    ['', '', ''],                                                                               // Row 10 (index 9)
    ['2. INDICATEURS D\'OBSOLESCENCE ET DE RENOUVELLEMENT', '', ''],                            // Row 11 (index 10)
    ['Indicateur DSI', 'Valeur', 'Formule exacte exécutée'],                                     // Row 12 (index 11)
    ['Nombre de postes vétustes (>= 5 ans)', null, null],                                       // Row 13 (index 12)
    ['Taux d\'obsolescence du parc (%)', null, null],                                           // Row 14 (index 13)
    ['Seuil d\'alerte DSI KLF', 0.20, 'Seuil critique de renouvellement DSI'],                  // Row 15 (index 14)
    ['Statut budgétaire 2027', null, null],                                                     // Row 16 (index 15)
    ['', '', ''],
    ['3. ESPACE GRAPHIQUES DÉCISIONNELS POUR LE COMITÉ DE DIRECTION', '', ''],
    ['Graphique Donut (Répartition OS)', 'Plage A5:B8', 'Windows 11 (Bleu nuit), Windows 10 (Orange alerte), Autre (Gris)'],
    ['Histogramme d\'Obsolescence', 'Plage A14:B15', 'Taux réel (36%) en Rouge Alerte vs Seuil 20% en Vert'],
    ['Mise en forme conditionnelle (MFC)', 'Plage Inventaire!H2:H26', 'Règle >= 5 : Remplissage rouge clair et texte rouge foncé']
  ];

  tdbRows.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val !== null && val !== undefined) {
        const cellRef = XLSX.utils.encode_cell({ c, r });
        if (typeof val === 'number') {
          wsTdb[cellRef] = { t: 'n', v: val };
        } else {
          wsTdb[cellRef] = { t: 's', v: val };
        }
      }
    });
  });

  // Injection des VRAIES FORMULES EXCEL dans le TDB :
  // Row 6 (B6 / C6) : Windows 10 Pro
  wsTdb['B6'] = {
    t: 'n',
    f: 'COUNTIF(Inventaire!D2:D26,"Windows 10 Pro")',
    v: 10
  };
  wsTdb['C6'] = { t: 's', v: '=NB.SI(Inventaire!D2:D26; "Windows 10 Pro")' };

  // Row 7 (B7 / C7) : Windows 11 Pro
  wsTdb['B7'] = {
    t: 'n',
    f: 'COUNTIF(Inventaire!D2:D26,"Windows 11 Pro")',
    v: 12
  };
  wsTdb['C7'] = { t: 's', v: '=NB.SI(Inventaire!D2:D26; "Windows 11 Pro")' };

  // Row 8 (B8 / C8) : Autre
  wsTdb['B8'] = {
    t: 'n',
    f: 'COUNTIF(Inventaire!D2:D26,"Autre")',
    v: 3
  };
  wsTdb['C8'] = { t: 's', v: '=NB.SI(Inventaire!D2:D26; "Autre")' };

  // Row 9 (B9 / C9) : Total général
  wsTdb['B9'] = {
    t: 'n',
    f: 'SUM(B6:B8)',
    v: 25
  };
  wsTdb['C9'] = { t: 's', v: '=SOMME(B6:B8)' };

  // Row 13 (B13 / C13) : Postes vétustes >= 5 ans
  wsTdb['B13'] = {
    t: 'n',
    f: 'COUNTIF(Inventaire!H2:H26,">=5")',
    v: 9
  };
  wsTdb['C13'] = { t: 's', v: '=NB.SI(Inventaire!H2:H26; ">=5")' };

  // Row 14 (B14 / C14) : Taux d'obsolescence
  wsTdb['B14'] = {
    t: 'n',
    f: 'B13/B9',
    v: 0.36,
    z: '0.0%'
  };
  wsTdb['C14'] = { t: 's', v: '=B13/B9' };

  // Row 15 (B15) : Seuil d'alerte à 20% formaté en pourcentage
  wsTdb['B15'] = {
    t: 'n',
    v: 0.20,
    z: '0.0%'
  };

  // Row 16 (B16 / C16) : Statut budgétaire 2027
  wsTdb['B16'] = {
    t: 's',
    f: 'IF(B14>B15,"BUDGET RENOUVELLEMENT REQUIS","CONFORME")',
    v: 'BUDGET RENOUVELLEMENT REQUIS'
  };
  wsTdb['C16'] = { t: 's', v: '=SI(B14>B15; "BUDGET RENOUVELLEMENT REQUIS"; "CONFORME")' };

  wsTdb['!ref'] = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 2, r: 20 } });
  wsTdb['!cols'] = [
    { wch: 40 },
    { wch: 32 },
    { wch: 50 }
  ];

  XLSX.utils.book_append_sheet(wb, wsInventaire, 'Inventaire');
  XLSX.utils.book_append_sheet(wb, wsTdb, 'TDB_Direction_DSI');

  return wb;
}

function run() {
  console.log('🚀 Génération des classeurs CORRIGÉ avec VRAIES FORMULES EXCEL actives...');

  const wb = buildLiveFormulaCorrigéWorkbook();

  const paths = [
    'c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/03 - Paliers Pédagogiques/271026/KLF_Tableau_Bord_DSI_Graphiques_CORRIGE.xlsx',
    'c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/03 - Paliers Pédagogiques/271026/KLF_Inventaire_Parc_Jarry_CORRIGE_DSI.xlsx',
    'c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/03 - Paliers Pédagogiques/201026/KLF_Inventaire_Parc_Jarry_CORRIGE_DSI.xlsx',
    'c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/01 - Entreprise Fictive KLF/KLF_Tableau_Bord_DSI_Graphiques_CORRIGE.xlsx',
    'c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/01 - Entreprise Fictive KLF/KLF_Inventaire_Parc_Jarry_CORRIGE_DSI.xlsx',
    // Au cas où David cherche sous le nom tapé exactement dans son message :
    'c:/Users/shand/.gemini/antigravity/Obsidian-Brain/04 - Pédagogie/Sessions/TIP-2026/03 - Paliers Pédagogiques/271026/KLF_Inventaire_Parc_Parc_CORRIGE_DSI.xlsx'
  ];

  for (const p of paths) {
    try {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      XLSX.writeFile(wb, p);
      console.log(`  ✅ Fichier corrigé écrit avec formules actives : ${p}`);
    } catch (err: any) {
      console.warn(`  ⚠️ Impossible d'écraser (fichier ouvert dans Excel) : ${p}`);
      // Écriture sous nom alternatif avec suffixe _FORMULES
      const ext = path.extname(p);
      const base = path.basename(p, ext);
      const altPath = path.join(path.dirname(p), `${base}_FORMULES${ext}`);
      try {
        XLSX.writeFile(wb, altPath);
        console.log(`  👉 Écrit sous le nom déverrouillé : ${altPath}`);
      } catch (e: any) {
        console.error(`  ❌ Erreur fichier alternatif : ${e.message}`);
      }
    }
  }

  console.log('\n🎉 Tous les classeurs Corrigé disposent désormais des vraies formules dynamiques !');
}

run();
