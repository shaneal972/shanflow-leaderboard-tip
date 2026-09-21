import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import {
  generateFicheJournalierePdfHtml,
  FicheJournaliereData,
} from '@/lib/templates/ficheJournalierePdfTemplate';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 secondes pour la compilation Gotenberg

export async function POST(request: NextRequest) {
  // 1. Contrôle d'accès formateur / admin
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return new NextResponse('Accès non autorisé : session formateur requise.', {
      status: 401,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  try {
    const body = await request.json();
    const ficheData: FicheJournaliereData = body?.ficheData;

    if (!ficheData || !ficheData.nomFormateur || !ficheData.date) {
      return new NextResponse('Données de fiche journalière invalides ou incomplètes.', {
        status: 400,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    // 2. Pré-compilation du gabarit HTML A4 Portrait
    const compiledHtml = generateFicheJournalierePdfHtml(ficheData);

    // Formatage du nom de fichier propre
    const cleanDate = (ficheData.date || 'session').replace(/[\/\\]/g, '-').trim();
    const cleanNom = (ficheData.nomFormateur || 'FORMATEUR').trim().replace(/\s+/g, '_');
    const filename = `FICHE_JOURNALIERE_ACTIVITE_FORMATEUR_${cleanDate}_${cleanNom}.pdf`;

    // 3. Appel du webhook n8n / Gotenberg sécurisé
    const webhookUrl =
      process.env.N8N_QUALIOPI_PDF_WEBHOOK_URL ||
      'https://n8n.shandev.cloud/webhook/qualiopi-pdf-generate';
    const bearerToken =
      process.env.KLF_WEBHOOK_BEARER_TOKEN ||
      'klf_tip_bearer_secret_2026_jarry_secure!';

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        html: compiledHtml,
        filename,
      }),
      cache: 'no-store',
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('[Fiche Journalière PDF] Erreur webhook n8n:', n8nResponse.status, errorText);
      return new NextResponse(
        `Erreur du service d'impression PDF Gotenberg (${n8nResponse.status}) : ${errorText.substring(0, 200)}`,
        { status: 502 }
      );
    }

    // 4. Récupération du buffer binaire PDF généré par Gotenberg
    const pdfBuffer = await n8nResponse.arrayBuffer();

    if (!pdfBuffer || pdfBuffer.byteLength === 0) {
      return new NextResponse("Le service d'impression Gotenberg a renvoyé un document vide.", {
        status: 502,
      });
    }

    // 5. Streaming direct du PDF vers le navigateur
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[Fiche Journalière PDF] Exception inattendue:', error);
    return new NextResponse(
      `Erreur interne lors de la génération de la fiche journalière : ${error.message || 'Erreur inconnue'}`,
      { status: 500 }
    );
  }
}
