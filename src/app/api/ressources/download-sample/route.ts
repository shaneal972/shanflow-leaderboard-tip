import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileKey = searchParams.get('file');

    const fileMap: Record<string, { filename: string; contentType: string }> = {
      'zebra-doc': {
        filename: 'KLF_Notice_Zebra_v1_POUBELLE.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
      'zebra-txt': {
        filename: 'Exercice_Brut_Notice_Zebra_TCK102.txt',
        contentType: 'text/plain; charset=utf-8',
      },
      'sop-txt': {
        filename: 'KLF_Manuel_Procedure_Standard_BRUT.txt',
        contentType: 'text/plain; charset=utf-8',
      },
      'pont-bascule-doc': {
        filename: 'KLF_Procedure_PontBascule_v1_POUBELLE.docx',
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      },
      'pont-bascule-txt': {
        filename: 'KLF_Procedure_PontBascule_BRUT.txt',
        contentType: 'text/plain; charset=utf-8',
      },
    };

    if (!fileKey || !fileMap[fileKey]) {
      return NextResponse.json(
        { error: 'Fichier d\'exercice introuvable ou non spécifié.' },
        { status: 404 }
      );
    }

    const { filename, contentType } = fileMap[fileKey];
    const filePath = path.join(process.cwd(), 'src', 'data', 'samples', filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Le fichier ${filename} est manquant sur le serveur.` },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erreur lors du téléchargement du fichier.' },
      { status: 500 }
    );
  }
}
