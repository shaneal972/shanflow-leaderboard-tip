import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const labId = searchParams.get('labId') || 'tp-bur-01-corinne';

    if (labId !== 'tp-bur-01-corinne') {
      return NextResponse.json({ error: 'Fichier modèle non disponible pour cet atelier' }, { status: 404 });
    }

    // Création du classeur en mémoire
    const wb = XLSX.utils.book_new();

    // 1. Feuille principale : Manifeste d'Arrivages Maritimes
    const wsData: any[][] = [
      ['KARUKERA LOGISTIQUE & FRET (KLF) — MANIFESTE ARRIVAGES MARITIMES (PORT DE JARRY)', '', '', '', '', '', '', '', '', ''],
      ['Paramètres fiscaux réglementaires :', '', '', '', 'Taux Octroi de mer :', 0.085, 'Taux TVA locale :', 0.085, '', ''],
      ['N° Conteneur', 'Navire', 'Armateur', 'Destinataire', 'Code Postal', 'Base HT (€)', 'Frais Transit (€)', 'Octroi de mer (€)', 'TVA 8.5% (€)', 'Total TTC (€)'],
      ['CMAU-982144-0', 'Fort Saint-Louis', 'CMA-CGM', 'Antilles Fret Distribution', 97122, 12500.00, '#N/A', '', '', ''],
      ['MSCU-331209-1', 'Caraïbes Express', 'MSC', 'Boutique Caraïbes Déco', 1234, 4850.50, '#N/A', '', '', ''], // Code postal 01234 corrompu en 1234
      ['MAEU-774011-8', 'Fort Sainte-Marie', 'Maersk', 'Jarry Bricolage Outillage', 97110, 8920.00, '#N/A', '', '', ''],
      ['HLCU-440912-3', 'Atlantic Star', 'Hapag-Lloyd', 'Société Guadeloupéenne d\'Import', 97139, 15400.00, '#N/A', '', '', ''],
      ['CMAU-110294-7', 'Fort Fleur d\'Épée', 'CMA-CGM', 'Pharmacie Centrale Houelbourg', 6000, 3100.00, '#N/A', '', '', ''], // Code postal 06000 corrompu en 6000
      ['MSCU-889021-4', 'Caraïbes Express', 'MSC', 'Agro-Antilles SAS', 97120, 22150.00, '#N/A', '', '', ''],
      ['MAEU-661045-2', 'Fort Saint-Louis', 'Maersk', 'Fret Express Baie-Mahault', 97122, 7300.00, '#N/A', '', '', ''],
      ['CMAU-554109-9', 'Fort Fleur d\'Épée', 'CMA-CGM', 'Électronique Caraïbe Tech', 75001, 11400.00, '#N/A', '', '', ''],
      ['HLCU-992014-5', 'Atlantic Star', 'Hapag-Lloyd', 'Distribution Matériel Médical', 97139, 18900.00, '#N/A', '', '', ''],
      ['MSCU-443190-2', 'Caraïbes Express', 'MSC', 'Trans-Antilles Transit', 97110, 6450.00, '#N/A', '', '', ''],
      ['TOTAL DU MANIFESTE', '', '', '', '', '=SOMME(F4:F13)', '', '', '', ''],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

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
    XLSX.utils.book_append_sheet(wb, wsTarifs, 'Tarifs_Transit');

    // Génération du buffer Excel
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="KLF_Manifeste_Arrivages_Corinne_BRUT.xlsx"',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Erreur génération fichier modèle KLF Lab:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du fichier modèle' }, { status: 500 });
  }
}
