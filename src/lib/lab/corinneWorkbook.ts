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
