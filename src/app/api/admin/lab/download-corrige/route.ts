import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { buildCorinneCorrigeWorkbook } from '@/lib/lab/corinneWorkbook';

export async function GET(req: NextRequest) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: 'Accès réservé au formateur référent DSI.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const labId = searchParams.get('labId') || 'tp-bur-01-corinne';

    if (labId !== 'tp-bur-01-corinne') {
      return NextResponse.json({ error: 'Corrigé non disponible pour cet atelier.' }, { status: 404 });
    }

    const wb = buildCorinneCorrigeWorkbook();
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="KLF_Manifeste_Arrivages_Corinne_CORRIGE_DSI.xlsx"',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Erreur génération corrigé KLF Lab:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du corrigé officiel.' }, { status: 500 });
  }
}

