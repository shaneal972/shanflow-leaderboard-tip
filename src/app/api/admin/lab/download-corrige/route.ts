import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { buildCorinneCorrigeWorkbook } from '@/lib/lab/corinneWorkbook';
import { buildQuai3CorrigeWorkbook } from '@/lib/lab/quai3Workbook';
import { buildQuai3CorrigeDocxBuffer } from '@/lib/lab/quai3Docx';

export async function GET(req: NextRequest) {
  try {
    const isAuth = await isAdminAuthenticated();
    if (!isAuth) {
      return NextResponse.json({ error: 'Accès réservé au formateur référent DSI.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const labId = searchParams.get('labId') || 'tp-bur-01-corinne';
    const part = searchParams.get('part') || 'xlsx';

    if (labId === 'tp-bur-03-quai3-pack') {
      if (part === 'docx') {
        const docBuffer = buildQuai3CorrigeDocxBuffer();
        return new NextResponse(new Uint8Array(docBuffer), {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': 'attachment; filename="KLF_Guide_Caristes_CORRIGE_DSI_101126.docx"',
            'Cache-Control': 'no-store, max-age=0',
          },
        });
      }

      const wb = buildQuai3CorrigeWorkbook();
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="KLF_Palette_Quai3_CORRIGE_DSI_101126.xlsx"',
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

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
