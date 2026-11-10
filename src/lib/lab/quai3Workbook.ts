import * as XLSX from 'xlsx';

export interface Quai3PaletteRow {
  row: number;
  paletteId: string;
  cariste: string;
  codeZone: string;
  zoneAttendue: string;
  nbColis: number;
  poidsUnitaire: number;
  poidsTotal: number;
  alerte: string;
  montantHt: number;
  tva: number;
  ttc: number;
}

export const QUAI3_ROWS: Quai3PaletteRow[] = [
  { row: 4,  paletteId: 'PAL-301', cariste: 'Marc L.',  codeZone: 'Z-A',  zoneAttendue: 'Quai Conteneurs Nord', nbColis: 40, poidsUnitaire: 45,  poidsTotal: 1800, alerte: 'OK CHARIOT',            montantHt: 950.00,  tva: 80.75,  ttc: 1030.75 },
  { row: 5,  paletteId: 'PAL-302', cariste: 'Eddy P.',  codeZone: 'Z-B',  zoneAttendue: 'Hangar Froid Sud',     nbColis: 60, poidsUnitaire: 52,  poidsTotal: 3120, alerte: 'SURCHARGE - 2 PASSAGES', montantHt: 1840.00, tva: 156.40, ttc: 1996.40 },
  { row: 6,  paletteId: 'PAL-303', cariste: 'Kévin R.', codeZone: 'Z-A ', zoneAttendue: 'Quai Conteneurs Nord', nbColis: 25, poidsUnitaire: 60,  poidsTotal: 1500, alerte: 'OK CHARIOT',            montantHt: 720.00,  tva: 61.20,  ttc: 781.20 }, // Espace parasite volontaire sur Z-A !
  { row: 7,  paletteId: 'PAL-304', cariste: 'Lucie M.', codeZone: 'Z-C',  zoneAttendue: 'Zone Douane Express',  nbColis: 80, poidsUnitaire: 45,  poidsTotal: 3600, alerte: 'SURCHARGE - 2 PASSAGES', montantHt: 2200.00, tva: 187.00, ttc: 2387.00 },
  { row: 8,  paletteId: 'PAL-305', cariste: 'Marc L.',  codeZone: 'Z-D',  zoneAttendue: 'Dépôt Outre-Mer',      nbColis: 15, poidsUnitaire: 40,  poidsTotal: 600,  alerte: 'OK CHARIOT',            montantHt: 510.00,  tva: 43.35,  ttc: 553.35 },
  { row: 9,  paletteId: 'PAL-306', cariste: 'Eddy P.',  codeZone: 'Z-B',  zoneAttendue: 'Hangar Froid Sud',     nbColis: 55, poidsUnitaire: 50,  poidsTotal: 2750, alerte: 'SURCHARGE - 2 PASSAGES', montantHt: 1650.00, tva: 140.25, ttc: 1790.25 },
  { row: 10, paletteId: 'PAL-307', cariste: 'Kévin R.', codeZone: 'Z-C',  zoneAttendue: 'Zone Douane Express',  nbColis: 30, poidsUnitaire: 70,  poidsTotal: 2100, alerte: 'OK CHARIOT',            montantHt: 1120.00, tva: 95.20,  ttc: 1215.20 },
  { row: 11, paletteId: 'PAL-308', cariste: 'Lucie M.', codeZone: 'Z-A',  zoneAttendue: 'Quai Conteneurs Nord', nbColis: 20, poidsUnitaire: 55,  poidsTotal: 1100, alerte: 'OK CHARIOT',            montantHt: 680.00,  tva: 57.80,  ttc: 737.80 },
  { row: 12, paletteId: 'PAL-309', cariste: 'Marc L.',  codeZone: 'Z-D',  zoneAttendue: 'Dépôt Outre-Mer',      nbColis: 70, poidsUnitaire: 45,  poidsTotal: 3150, alerte: 'SURCHARGE - 2 PASSAGES', montantHt: 2050.00, tva: 174.25, ttc: 2224.25 },
  { row: 13, paletteId: 'PAL-310', cariste: 'Eddy P.',  codeZone: 'Z-99', zoneAttendue: 'Zone inconnue',        nbColis: 18, poidsUnitaire: 85,  poidsTotal: 1530, alerte: 'OK CHARIOT',            montantHt: 890.00,  tva: 75.65,  ttc: 965.65 }, // Code inconnu volontaire pour démontrer SIERREUR !
  { row: 14, paletteId: 'PAL-311', cariste: 'Kévin R.', codeZone: 'Z-B',  zoneAttendue: 'Hangar Froid Sud',     nbColis: 45, poidsUnitaire: 55,  poidsTotal: 2475, alerte: 'OK CHARIOT',            montantHt: 1490.00, tva: 126.65, ttc: 1616.65 },
  { row: 15, paletteId: 'PAL-312', cariste: 'Lucie M.', codeZone: 'Z-C',  zoneAttendue: 'Zone Douane Express',  nbColis: 36, poidsUnitaire: 65,  poidsTotal: 2340, alerte: 'OK CHARIOT',            montantHt: 1755.00, tva: 149.18, ttc: 1904.18 },
];

export const QUAI3_TOTALS = {
  poidsTotal: 26065,
  poidsMoyen: 2172.08,
  poidsMax: 3600,
  poidsMin: 600,
  nbSurcharge: 4,
  totalTtc: 17202.68,
};

function appendZonesSheet(wb: XLSX.WorkBook) {
  const zonesData: any[][] = [
    ['RÉFÉRENTIEL DES ZONES DU QUAI N°3 — PORT DE JARRY (KLF)', '', ''],
    ['Code Zone', 'Nom de la Zone', 'Cariste Référent'],
    ['Z-A', 'Quai Conteneurs Nord', 'Marc L.'],
    ['Z-B', 'Hangar Froid Sud', 'Eddy P.'],
    ['Z-C', 'Zone Douane Express', 'Kévin R.'],
    ['Z-D', 'Dépôt Outre-Mer', 'Lucie M.'],
  ];

  const wsZones = XLSX.utils.aoa_to_sheet(zonesData);
  wsZones['!cols'] = [{ wch: 16 }, { wch: 28 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsZones, 'Zones_Quais');
}

/**
 * Génère le classeur de départ BRUT pour les apprenants (Acte 1 : Excel & Google Sheets).
 * Les colonnes calculées sont laissées prêtes à compléter, avec les deux paramètres bloqués en $H$2 (2500 kg) et $J$2 (8,5 %).
 */
export function generateQuai3BrutWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const rows: any[][] = [
    ['KARUKERA LOGISTIQUE & FRET (KLF) — CALCULATEUR SÉCURITÉ & COLISAGE QUAI N°3 (JARRY)', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', 'Seuil max chariot (kg) ->', 2500, 'TVA Guadeloupe ->', 0.085, ''],
    ['N° Palette', 'Cariste', 'Code Zone', 'Nom de la Zone', 'Nb Colis', 'Poids / Colis (kg)', 'Poids Total (kg)', 'Alerte Chariot (<= 2 500 kg)', 'Montant Fret HT (€)', 'TVA 8,5 % (€)', 'Total Fret TTC (€)'],
    ...QUAI3_ROWS.map((item) => [
      item.paletteId,
      item.cariste,
      item.codeZone,
      '', // D : À compléter via SIERREUR + RECHERCHEV + SUPPRESPACE
      item.nbColis,
      item.poidsUnitaire,
      '', // G : À compléter via =E*F
      '', // H : À compléter via =SI(G4>$H$2; ...)
      item.montantHt,
      '', // J : À compléter via =I4*$J$2
      '', // K : À compléter via =I4+J4
    ]),
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['TABLEAU DE SYNTHÈSE QUAI N°3 (À COMPLÉTER PAR FORMULES)', '', '', '', '', '', '', '', '', '', ''],
    ['Poids total manipulé (kg) — SOMME', '', '', '', '', '', '', '', '', '', ''],
    ['Poids moyen par palette (kg) — MOYENNE', '', '', '', '', '', '', '', '', '', ''],
    ['Palette la plus lourde (kg) — MAX', '', '', '', '', '', '', '', '', '', ''],
    ['Palette la plus légère (kg) — MIN', '', '', '', '', '', '', '', '', '', ''],
    ['Nombre de palettes en SURCHARGE — NB.SI', '', '', '', '', '', '', '', '', '', ''],
    ['Chiffre d\'affaires Total TTC (€) — SOMME', '', '', '', '', '', '', '', '', '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['H2'] = { t: 'n', v: 2500, z: '#,##0' };
  ws['J2'] = { t: 'n', v: 0.085, z: '0.0%' };

  for (const item of QUAI3_ROWS) {
    ws[`I${item.row}`] = { t: 'n', v: item.montantHt, z: '#,##0.00' };
  }

  ws['!cols'] = [
    { wch: 15 }, // A
    { wch: 14 }, // B
    { wch: 13 }, // C
    { wch: 24 }, // D
    { wch: 11 }, // E
    { wch: 18 }, // F
    { wch: 17 }, // G
    { wch: 26 }, // H
    { wch: 19 }, // I
    { wch: 15 }, // J
    { wch: 18 }, // K
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Palettes_Quai3');
  appendZonesSheet(wb);
  return wb;
}

/**
 * Génère le classeur CORRIGÉ DSI officiel avec 100 % de formules OpenXML vives (.f).
 * Conforme au Standard Zéro-Défaut des Classeurs Excel Pédagogiques.
 */
export function buildQuai3CorrigeWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const rows: any[][] = [
    ['KARUKERA LOGISTIQUE & FRET (KLF) — CALCULATEUR SÉCURITÉ & COLISAGE QUAI N°3 (CORRIGÉ DSI)', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', 'Seuil max chariot (kg) ->', 2500, 'TVA Guadeloupe ->', 0.085, ''],
    ['N° Palette', 'Cariste', 'Code Zone', 'Nom de la Zone', 'Nb Colis', 'Poids / Colis (kg)', 'Poids Total (kg)', 'Alerte Chariot (<= 2 500 kg)', 'Montant Fret HT (€)', 'TVA 8,5 % (€)', 'Total Fret TTC (€)'],
    ...QUAI3_ROWS.map((item) => [
      item.paletteId,
      item.cariste,
      item.codeZone,
      item.zoneAttendue,
      item.nbColis,
      item.poidsUnitaire,
      item.poidsTotal,
      item.alerte,
      item.montantHt,
      item.tva,
      item.ttc,
    ]),
    ['', '', '', '', '', '', '', '', '', '', ''],
    ['TABLEAU DE SYNTHÈSE QUAI N°3 (FORMULES AUTOMATIQUES)', '', '', '', '', '', '', '', '', '', ''],
    ['Poids total manipulé (kg) — SOMME', QUAI3_TOTALS.poidsTotal, '', '', '', '', '', '', '', '', ''],
    ['Poids moyen par palette (kg) — MOYENNE', QUAI3_TOTALS.poidsMoyen, '', '', '', '', '', '', '', '', ''],
    ['Palette la plus lourde (kg) — MAX', QUAI3_TOTALS.poidsMax, '', '', '', '', '', '', '', '', ''],
    ['Palette la plus légère (kg) — MIN', QUAI3_TOTALS.poidsMin, '', '', '', '', '', '', '', '', ''],
    ['Nombre de palettes en SURCHARGE — NB.SI', QUAI3_TOTALS.nbSurcharge, '', '', '', '', '', '', '', '', ''],
    ['Chiffre d\'affaires Total TTC (€) — SOMME', QUAI3_TOTALS.totalTtc, '', '', '', '', '', '', '', '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['H2'] = { t: 'n', v: 2500, z: '#,##0' };
  ws['J2'] = { t: 'n', v: 0.085, z: '0.0%' };

  for (const item of QUAI3_ROWS) {
    const r = item.row;
    ws[`D${r}`] = {
      t: 's',
      f: `IFERROR(VLOOKUP(TRIM(C${r}),Zones_Quais!$A$3:$C$6,2,FALSE),"Zone inconnue")`,
      v: item.zoneAttendue,
    };
    ws[`G${r}`] = {
      t: 'n',
      f: `E${r}*F${r}`,
      v: item.poidsTotal,
      z: '#,##0',
    };
    ws[`H${r}`] = {
      t: 's',
      f: `IF(G${r}>$H$2,"SURCHARGE - 2 PASSAGES","OK CHARIOT")`,
      v: item.alerte,
    };
    ws[`I${r}`] = {
      t: 'n',
      v: item.montantHt,
      z: '#,##0.00',
    };
    ws[`J${r}`] = {
      t: 'n',
      f: `I${r}*$J$2`,
      v: item.tva,
      z: '#,##0.00',
    };
    ws[`K${r}`] = {
      t: 'n',
      f: `I${r}+J${r}`,
      v: item.ttc,
      z: '#,##0.00',
    };
  }

  // Bloc Synthèse (B18 à B23)
  ws['B18'] = { t: 'n', f: 'SUM(G4:G15)', v: QUAI3_TOTALS.poidsTotal, z: '#,##0' };
  ws['B19'] = { t: 'n', f: 'AVERAGE(G4:G15)', v: QUAI3_TOTALS.poidsMoyen, z: '#,##0.00' };
  ws['B20'] = { t: 'n', f: 'MAX(G4:G15)', v: QUAI3_TOTALS.poidsMax, z: '#,##0' };
  ws['B21'] = { t: 'n', f: 'MIN(G4:G15)', v: QUAI3_TOTALS.poidsMin, z: '#,##0' };
  ws['B22'] = { t: 'n', f: 'COUNTIF(H4:H15,"SURCHARGE - 2 PASSAGES")', v: QUAI3_TOTALS.nbSurcharge, z: '#,##0' };
  ws['B23'] = { t: 'n', f: 'SUM(K4:K15)', v: QUAI3_TOTALS.totalTtc, z: '#,##0.00' };

  // Figeage des volets (Ligne 3)
  ws['!views'] = [{ state: 'frozen', ySplit: 3 }];
  ws['!freeze'] = { xSplit: 0, ySplit: 3, topLeftCell: 'A4', activePane: 'bottomLeft', state: 'frozen' };

  ws['!cols'] = [
    { wch: 38 }, // A (large pour libellés synthèse en A18:A23)
    { wch: 15 }, // B
    { wch: 13 }, // C
    { wch: 24 }, // D
    { wch: 11 }, // E
    { wch: 18 }, // F
    { wch: 17 }, // G
    { wch: 26 }, // H
    { wch: 19 }, // I
    { wch: 15 }, // J
    { wch: 18 }, // K
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Palettes_Quai3');
  appendZonesSheet(wb);
  return wb;
}
