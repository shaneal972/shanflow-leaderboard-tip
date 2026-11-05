import * as XLSX from 'xlsx';

/**
 * Générateur du classeur brut KLF_Manifeste_Arrivages_Corinne_BRUT.xlsx.
 * Respecte les spécifications OpenXML SheetJS et la Clean Architecture (zéro dépendance framework).
 */
export function generateCorinneBrutWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // 1. Feuille principale : Manifeste d'Arrivages Maritimes
  const wsData: any[][] = [
    ['KARUKERA LOGISTIQUE & FRET (KLF) — MANIFESTE ARRIVAGES MARITIMES (PORT DE JARRY)', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', 'Paramètres fiscaux réglementaires (Octroi / TVA) :', '', 'Octroi 8,5% ->', 0.085, 0.085, ''],
    ['N° Conteneur', 'Navire', 'Armateur', 'Destinataire', 'Code Postal', 'Base HT (€)', 'Frais Transit (€)', 'Octroi de mer (€)', 'TVA 8.5% (€)', 'Total TTC (€)'],
    ['CMAU-982144-0', 'Fort Saint-Louis', 'CMA-CGM ', 'Antilles Fret Distribution', 97122, 12500.00, '', '', '', ''],
    ['MSCU-331209-1', 'Caraïbes Express', 'MSC  ', 'Boutique Caraïbes Déco', 1234, 4850.50, '', '', '', ''], // Code postal 01234 corrompu en 1234
    ['MAEU-774011-8', 'Fort Sainte-Marie', 'Maersk ', 'Jarry Bricolage Outillage', 97110, 8920.00, '', '', '', ''],
    ['HLCU-440912-3', 'Atlantic Star', 'Hapag-Lloyd ', 'Société Guadeloupéenne d\'Import', 97139, 15400.00, '', '', '', ''],
    ['CMAU-110294-7', 'Fort Fleur d\'Épée', 'CMA-CGM  ', 'Pharmacie Centrale Houelbourg', 6000, 3100.00, '', '', '', ''], // Code postal 06000 corrompu en 6000
    ['MSCU-889021-4', 'Caraïbes Express', 'MSC ', 'Agro-Antilles SAS', 97120, 22150.00, '', '', '', ''],
    ['MAEU-661045-2', 'Fort Saint-Louis', 'Maersk  ', 'Fret Express Baie-Mahault', 97122, 7300.00, '', '', '', ''],
    ['CMAU-554109-9', 'Fort Fleur d\'Épée', 'CMA-CGM ', 'Électronique Caraïbe Tech', 75001, 11400.00, '', '', '', ''],
    ['HLCU-992014-5', 'Atlantic Star', 'Hapag-Lloyd  ', 'Distribution Matériel Médical', 97139, 18900.00, '', '', '', ''],
    ['MSCU-443190-2', 'Caraïbes Express', 'MSC ', 'Trans-Antilles Transit', 97110, 6450.00, '', '', '', ''],
    ['TOTAL DU MANIFESTE', '', '', '', '', '', '', '', '', ''],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Ajustement de la Ligne 2 : Paramètres fiscaux réglementaires ($H$2 et $I$2)
  ws['E2'] = { t: 's', v: 'Paramètres fiscaux réglementaires (Octroi / TVA) :' };
  ws['G2'] = { t: 's', v: 'Octroi 8,5% ->' };
  ws['H2'] = { t: 'n', v: 0.085, z: '0.0%' };
  ws['I2'] = { t: 'n', v: 0.085, z: '0.0%' };

  // Injection des formules VLOOKUP actives échouant avec #N/A (Col G, lignes 4 à 13)
  for (let r = 4; r <= 13; r++) {
    ws['G' + r] = {
      t: 'e',
      f: `VLOOKUP(C${r},Tarifs_Transit!$A$3:$B$6,2,FALSE)`,
      v: 0x2a,
      w: '#N/A',
    };
  }

  // Formule active sur la ligne 14 (TOTAL DU MANIFESTE)
  ws['F14'] = { t: 'n', f: 'SUM(F4:F13)', v: 110970.50, z: '#,##0.00' };

  // Ajustement de la largeur des colonnes
  ws['!cols'] = [
    { wch: 18 }, // Conteneur
    { wch: 20 }, // Navire
    { wch: 14 }, // Armateur
    { wch: 32 }, // Destinataire
    { wch: 14 }, // Code Postal
    { wch: 15 }, // Base HT
    { wch: 18 }, // Frais Transit
    { wch: 18 }, // Octroi de mer
    { wch: 16 }, // TVA
    { wch: 16 }, // Total TTC
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Manifeste_Arrivages');

  // 2. Feuille secondaire : Grille tarifaire de transit (pour la recherche matricielle)
  const wsTarifsData: any[][] = [
    ['RÉFÉRENTIEL TARIFAIRE DES FRAIS DE TRANSIT (PORT DE JARRY)', ''],
    ['Code Armateur', 'Forfait Transit (€)'],
    ['CMA-CGM', 280.00],
    ['MSC', 310.00],
    ['Maersk', 295.00],
    ['Hapag-Lloyd', 340.00],
  ];

  const wsTarifs = XLSX.utils.aoa_to_sheet(wsTarifsData);
  wsTarifs['!cols'] = [{ wch: 22 }, { wch: 20 }];
  wsTarifs['B3'] = { t: 'n', v: 280.00, z: '#,##0.00' };
  wsTarifs['B4'] = { t: 'n', v: 310.00, z: '#,##0.00' };
  wsTarifs['B5'] = { t: 'n', v: 295.00, z: '#,##0.00' };
  wsTarifs['B6'] = { t: 'n', v: 340.00, z: '#,##0.00' };
  XLSX.utils.book_append_sheet(wb, wsTarifs, 'Tarifs_Transit');

  return wb;
}

/**
 * Générateur du classeur corrigé officiel DSI KLF_Manifeste_Arrivages_Corinne_CORRIGE_DSI.xlsx.
 * Comporte 100 % de vraies formules OpenXML actives (.f), valeurs (.v), formats et volets figés.
 */
export function buildCorinneCorrigeWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // 1. Feuille principale : Manifeste d'Arrivages Maritimes
  const wsData: any[][] = [
    ['KARUKERA LOGISTIQUE & FRET (KLF) — MANIFESTE ARRIVAGES MARITIMES (PORT DE JARRY)', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', 'Paramètres fiscaux réglementaires (Octroi / TVA) :', '', 'Octroi 8,5% ->', 0.085, 0.085, ''],
    ['N° Conteneur', 'Navire', 'Armateur', 'Destinataire', 'Code Postal', 'Base HT (€)', 'Frais Transit (€)', 'Octroi de mer (€)', 'TVA 8.5% (€)', 'Total TTC (€)'],
    ['CMAU-982144-0', 'Fort Saint-Louis', 'CMA-CGM ', 'Antilles Fret Distribution', '97122', 12500.00, 280.00, 1062.50, 1062.50, 14905.00],
    ['MSCU-331209-1', 'Caraïbes Express', 'MSC  ', 'Boutique Caraïbes Déco', '01234', 4850.50, 310.00, 412.29, 412.29, 5985.08],
    ['MAEU-774011-8', 'Fort Sainte-Marie', 'Maersk ', 'Jarry Bricolage Outillage', '97110', 8920.00, 295.00, 758.20, 758.20, 10731.40],
    ['HLCU-440912-3', 'Atlantic Star', 'Hapag-Lloyd ', 'Société Guadeloupéenne d\'Import', '97139', 15400.00, 340.00, 1309.00, 1309.00, 18358.00],
    ['CMAU-110294-7', 'Fort Fleur d\'Épée', 'CMA-CGM  ', 'Pharmacie Centrale Houelbourg', '06000', 3100.00, 280.00, 263.50, 263.50, 3907.00],
    ['MSCU-889021-4', 'Caraïbes Express', 'MSC ', 'Agro-Antilles SAS', '97120', 22150.00, 310.00, 1882.75, 1882.75, 26225.50],
    ['MAEU-661045-2', 'Fort Saint-Louis', 'Maersk  ', 'Fret Express Baie-Mahault', '97122', 7300.00, 295.00, 620.50, 620.50, 8836.00],
    ['CMAU-554109-9', 'Fort Fleur d\'Épée', 'CMA-CGM ', 'Électronique Caraïbe Tech', '75001', 11400.00, 280.00, 969.00, 969.00, 13618.00],
    ['HLCU-992014-5', 'Atlantic Star', 'Hapag-Lloyd  ', 'Distribution Matériel Médical', '97139', 18900.00, 340.00, 1606.50, 1606.50, 22453.00],
    ['MSCU-443190-2', 'Caraïbes Express', 'MSC ', 'Trans-Antilles Transit', '97110', 6450.00, 310.00, 548.25, 548.25, 7856.50],
    ['TOTAL DU MANIFESTE', '', '', '', '', 110970.50, 3040.00, 9432.49, 9432.49, 132875.48],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Ligne 2 : Paramètres fiscaux réglementaires
  ws['E2'] = { t: 's', v: 'Paramètres fiscaux réglementaires (Octroi / TVA) :' };
  ws['G2'] = { t: 's', v: 'Octroi 8,5% ->' };
  ws['H2'] = { t: 'n', v: 0.085, z: '0.0%' };
  ws['I2'] = { t: 'n', v: 0.085, z: '0.0%' };

  // Formules actives lignes 4 à 13
  const expectedValues = [
    { r: 4, base: 12500.00, transit: 280.00, octroi: 1062.50, tva: 1062.50, ttc: 14905.00, cp: '97122' },
    { r: 5, base: 4850.50, transit: 310.00, octroi: 412.29, tva: 412.29, ttc: 5985.08, cp: '01234' },
    { r: 6, base: 8920.00, transit: 295.00, octroi: 758.20, tva: 758.20, ttc: 10731.40, cp: '97110' },
    { r: 7, base: 15400.00, transit: 340.00, octroi: 1309.00, tva: 1309.00, ttc: 18358.00, cp: '97139' },
    { r: 8, base: 3100.00, transit: 280.00, octroi: 263.50, tva: 263.50, ttc: 3907.00, cp: '06000' },
    { r: 9, base: 22150.00, transit: 310.00, octroi: 1882.75, tva: 1882.75, ttc: 26225.50, cp: '97120' },
    { r: 10, base: 7300.00, transit: 295.00, octroi: 620.50, tva: 620.50, ttc: 8836.00, cp: '97122' },
    { r: 11, base: 11400.00, transit: 280.00, octroi: 969.00, tva: 969.00, ttc: 13618.00, cp: '75001' },
    { r: 12, base: 18900.00, transit: 340.00, octroi: 1606.50, tva: 1606.50, ttc: 22453.00, cp: '97139' },
    { r: 13, base: 6450.00, transit: 310.00, octroi: 548.25, tva: 548.25, ttc: 7856.50, cp: '97110' },
  ];

  for (const item of expectedValues) {
    const row = item.r;
    // Col E : Code postal en texte
    ws[`E${row}`] = { t: 's', v: item.cp, z: '@' };
    // Col F : Base HT
    ws[`F${row}`] = { t: 'n', v: item.base, z: '#,##0.00' };
    // Col G : Frais de transit avec recherche et trim
    ws[`G${row}`] = {
      t: 'n',
      f: `IFERROR(VLOOKUP(TRIM(C${row}),Tarifs_Transit!$A$3:$B$6,2,FALSE),0)`,
      v: item.transit,
      z: '#,##0.00',
    };
    // Col H : Octroi de mer
    ws[`H${row}`] = {
      t: 'n',
      f: `F${row}*$H$2`,
      v: item.octroi,
      z: '#,##0.00',
    };
    // Col I : TVA 8.5%
    ws[`I${row}`] = {
      t: 'n',
      f: `F${row}*$I$2`,
      v: item.tva,
      z: '#,##0.00',
    };
    // Col J : Total TTC
    ws[`J${row}`] = {
      t: 'n',
      f: `F${row}+G${row}+H${row}+I${row}`,
      v: item.ttc,
      z: '#,##0.00',
    };
  }

  // Ligne 14 : TOTAL DU MANIFESTE avec formules SUM
  ws['F14'] = { t: 'n', f: 'SUM(F4:F13)', v: 110970.50, z: '#,##0.00' };
  ws['G14'] = { t: 'n', f: 'SUM(G4:G13)', v: 3040.00, z: '#,##0.00' };
  ws['H14'] = { t: 'n', f: 'SUM(H4:H13)', v: 9432.49, z: '#,##0.00' };
  ws['I14'] = { t: 'n', f: 'SUM(I4:I13)', v: 9432.49, z: '#,##0.00' };
  ws['J14'] = { t: 'n', f: 'SUM(J4:J13)', v: 132875.48, z: '#,##0.00' };

  // Figer les volets sur la ligne 3 (en-têtes visibles)
  ws['!views'] = [{ state: 'frozen', ySplit: 3 }];
  ws['!freeze'] = { xSplit: 0, ySplit: 3, topLeftCell: 'A4', activePane: 'bottomLeft', state: 'frozen' };

  ws['!cols'] = [
    { wch: 18 }, // Conteneur
    { wch: 20 }, // Navire
    { wch: 14 }, // Armateur
    { wch: 32 }, // Destinataire
    { wch: 14 }, // Code Postal
    { wch: 15 }, // Base HT
    { wch: 18 }, // Frais Transit
    { wch: 18 }, // Octroi de mer
    { wch: 16 }, // TVA
    { wch: 16 }, // Total TTC
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Manifeste_Arrivages');

  // 2. Feuille secondaire : Tarifs_Transit
  const wsTarifsData: any[][] = [
    ['RÉFÉRENTIEL TARIFAIRE DES FRAIS DE TRANSIT (PORT DE JARRY)', ''],
    ['Code Armateur', 'Forfait Transit (€)'],
    ['CMA-CGM', 280.00],
    ['MSC', 310.00],
    ['Maersk', 295.00],
    ['Hapag-Lloyd', 340.00],
  ];

  const wsTarifs = XLSX.utils.aoa_to_sheet(wsTarifsData);
  wsTarifs['!cols'] = [{ wch: 22 }, { wch: 20 }];
  wsTarifs['B3'] = { t: 'n', v: 280.00, z: '#,##0.00' };
  wsTarifs['B4'] = { t: 'n', v: 310.00, z: '#,##0.00' };
  wsTarifs['B5'] = { t: 'n', v: 295.00, z: '#,##0.00' };
  wsTarifs['B6'] = { t: 'n', v: 340.00, z: '#,##0.00' };
  XLSX.utils.book_append_sheet(wb, wsTarifs, 'Tarifs_Transit');

  return wb;
}
