import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { generateCorinneBrutWorkbook } from '@/lib/lab/corinneWorkbook';

export { generateCorinneBrutWorkbook };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const labId = searchParams.get('labId') || 'tp-bur-01-corinne';

    if (labId !== 'tp-bur-01-corinne') {
      return NextResponse.json({ error: 'Fichier modèle non disponible pour cet atelier' }, { status: 404 });
    }

    const wb = generateCorinneBrutWorkbook();

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
