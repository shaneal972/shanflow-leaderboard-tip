import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { generateCorinneBrutWorkbook } from '@/lib/lab/corinneWorkbook';
import { generateQuai3BrutWorkbook } from '@/lib/lab/quai3Workbook';
import { buildQuai3BrutDocxBuffer } from '@/lib/lab/quai3Docx';

export { generateCorinneBrutWorkbook, generateQuai3BrutWorkbook };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const labId = searchParams.get('labId') || 'tp-bur-01-corinne';
    const part = searchParams.get('part') || 'xlsx';

    if (labId === 'tp-bur-03-quai3-pack') {
      if (part === 'docx') {
        const docBuffer = buildQuai3BrutDocxBuffer();
        return new NextResponse(new Uint8Array(docBuffer), {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition': 'attachment; filename="KLF_Guide_Caristes_BRUT_101126.docx"',
            'Cache-Control': 'no-store, max-age=0',
          },
        });
      }

      const wb = generateQuai3BrutWorkbook();
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="KLF_Palette_Quai3_BRUT_101126.xlsx"',
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    if (labId !== 'tp-bur-01-corinne') {
      return NextResponse.json({ error: 'Fichier modèle non disponible pour cet atelier' }, { status: 404 });
    }

    const wb = generateCorinneBrutWorkbook();
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
